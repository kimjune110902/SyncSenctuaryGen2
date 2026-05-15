// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/

mod api;

use api::client::{ApiClient, AuthResponse, ApiError};
use std::sync::{Arc, Mutex};
use tauri::{State, AppHandle, Emitter};

pub struct AppState {
    pub api_client: ApiClient,
    pub platform: String,
    pub access_token: Arc<Mutex<Option<String>>>,
}

#[tauri::command]
async fn handle_login(
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
async fn handle_logout(
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
    let access_token = Arc::new(Mutex::new(None));
    let base_url = "http://localhost:3000".to_string(); // In reality, load from config
    let app_version = "1.0.0".to_string();
    let platform = std::env::consts::OS.to_string();

    let api_client = ApiClient::new(base_url, app_version, platform.clone(), access_token.clone());

    tauri::Builder::default()
        .manage(AppState {
            api_client,
            platform,
            access_token,
        })
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![handle_login, handle_logout])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
