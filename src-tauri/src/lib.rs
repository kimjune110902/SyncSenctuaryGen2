mod api;
mod db;
mod media;

use api::client::{ApiClient, AuthResponse, ApiError};
use std::sync::{Arc, Mutex};
use tauri::{State, AppHandle, Emitter, Manager};
use sqlx::SqlitePool;

pub struct AppState {
    pub api_client: ApiClient,
    pub platform: String,
    pub access_token: Arc<Mutex<Option<String>>>,
    pub db_pool: SqlitePool,
}

#[tauri::command]
async fn login(
    identifier: String,
    password: String,
    state: State<'_, AppState>,
    app: AppHandle,
) -> Result<AuthResponse, String> {
    let identifier = identifier.trim().to_string();
    let password = password.trim().to_string();

    if identifier.is_empty() {
        return Err(serde_json::to_string(&ApiError::ServerError {
            status: 400,
            message: "Please enter your phone number or email.".to_string(),
        }).unwrap());
    }

    if password.is_empty() {
        return Err(serde_json::to_string(&ApiError::ServerError {
            status: 400,
            message: "Please enter your password.".to_string(),
        }).unwrap());
    }

    if password.len() > 128 {
        return Err(serde_json::to_string(&ApiError::ServerError {
            status: 400,
            message: "Password is too long.".to_string(),
        }).unwrap());
    }

    let result = state.api_client
        .login_impl(&identifier, &password, &state.platform)
        .await;

    match result {
        Ok(auth_response) => {
            *state.access_token.lock().unwrap() = Some(auth_response.access_token.clone());
            let _ = api::keychain::store_refresh_token(&auth_response.refresh_token, None);
            app.emit("auth::logged-in", &auth_response.user).unwrap();
            Ok(auth_response)
        }
        Err(api_error) => {
            Err(serde_json::to_string(&api_error).unwrap())
        }
    }
}

#[tauri::command]
async fn logout(
    state: State<'_, AppState>,
    app: AppHandle,
) -> Result<(), String> {
    let refresh_token = api::keychain::read_refresh_token(None).unwrap_or_default();

    // best-effort server logout
    let _ = state.api_client.logout_impl(&refresh_token).await;

    let _ = api::keychain::clear_refresh_token(None);
    *state.access_token.lock().unwrap() = None;

    app.emit("auth::unauthenticated", ()).unwrap();
    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            let app_handle = app.handle().clone();

            // Sync database initialization
            let app_data_dir = app_handle.path().app_data_dir().unwrap();
            std::fs::create_dir_all(&app_data_dir).unwrap(); // Ensure path exists

            let db_pool = tauri::async_runtime::block_on(async {
                db::init_db(&app_data_dir).await.expect("Failed to initialize local database")
            });

            let access_token = Arc::new(Mutex::new(None));
            let base_url = "http://localhost:3000".to_string(); // In reality, load from config
            let app_version = "1.0.0".to_string();
            let platform = std::env::consts::OS.to_string();

            let api_client = ApiClient::new(base_url, app_version, platform.clone(), access_token.clone());

            app.manage(AppState {
                api_client,
                platform,
                access_token,
                db_pool,
            });

            tauri::async_runtime::spawn(async move {
                let state: State<'_, AppState> = app_handle.state();

                // STEP 2: Token retrieval from OS Keychain
                if let Ok(raw_refresh_token) = api::keychain::read_refresh_token(None) {
                    if !raw_refresh_token.is_empty() {
                        // STEP 3: Silent Token Refresh
                        match state.api_client.refresh_tokens(&raw_refresh_token).await {
                            Ok(auth_response) => {
                                *state.access_token.lock().unwrap() = Some(auth_response.access_token.clone());
                                let _ = api::keychain::store_refresh_token(&auth_response.refresh_token, None);

                                // Signal frontend session restored
                                app_handle.emit("auth::session-restored", auth_response.user).unwrap();
                            }
                            Err(e) => {
                                // Refresh failed (expired/revoked/theft)
                                let _ = api::keychain::clear_refresh_token(None);
                                *state.access_token.lock().unwrap() = None;

                                // Parse exactly the required error to send to the frontend
                                match e {
                                    ApiError::TokenTheftDetected => {
                                        app_handle.emit("auth::session-expired", serde_json::json!({ "reason": "Security alert: all sessions terminated. Please log in again." })).unwrap();
                                    }
                                    _ => {
                                        app_handle.emit("auth::session-expired", serde_json::json!({ "reason": "Your session has expired. Please log in again." })).unwrap();
                                    }
                                }
                            }
                        }
                    } else {
                        app_handle.emit("auth::unauthenticated", ()).unwrap();
                    }
                } else {
                    app_handle.emit("auth::unauthenticated", ()).unwrap();
                }
            });
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            login,
            logout,
            media::scan_media_directory
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
