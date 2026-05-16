use std::path::{Path, PathBuf};
use std::fs;
use uuid::Uuid;
use walkdir::WalkDir;
use base64::{engine::general_purpose, Engine as _};
use image::imageops::FilterType;
use tauri::{AppHandle, Manager, State};

use crate::api::client::ApiError;
use crate::AppState;

pub fn is_path_safe(requested_path: &Path, app_data_dir: &Path, video_dir: Option<&PathBuf>) -> bool {
    let canonical_requested = match fs::canonicalize(requested_path) {
        Ok(path) => path,
        Err(_) => return false,
    };

    let canonical_app_data = fs::canonicalize(app_data_dir).unwrap_or_default();
    if canonical_requested.starts_with(&canonical_app_data) {
        return true;
    }

    if let Some(vid_dir) = video_dir {
        let canonical_video = fs::canonicalize(vid_dir).unwrap_or_default();
        if !canonical_video.as_os_str().is_empty() && canonical_requested.starts_with(&canonical_video) {
            return true;
        }
    }

    false
}

#[tauri::command]
pub async fn scan_media_directory(
    path: String,
    app: AppHandle,
    state: State<'_, AppState>,
) -> Result<usize, String> {
    let requested_path = PathBuf::from(&path);

    // Security Audit: Prevent path traversal
    let app_data_dir = app.path().app_data_dir().map_err(|e| e.to_string())?;
    let video_dir = app.path().video_dir().ok(); // Optional explicit user dir allowed

    if !is_path_safe(&requested_path, &app_data_dir, video_dir.as_ref()) {
        return Err(serde_json::to_string(&ApiError::SecurityViolation {
            message: "Access to the requested path is forbidden.".to_string()
        }).unwrap());
    }

    let pool = state.db_pool.clone();

    // Offload I/O to a background thread to prevent UI freezing
    let scanned_count = tokio::task::spawn_blocking(move || {
        let mut count = 0;

        for entry in WalkDir::new(&requested_path).into_iter().filter_map(|e| e.ok()) {
            let path = entry.path();
            if path.is_file() {
                if let Some(ext) = path.extension().and_then(|s| s.to_str()) {
                    let ext = ext.to_lowercase();
                    if ["mp4", "mov", "jpg", "png", "jpeg"].contains(&ext.as_str()) {
                        let id = Uuid::new_v4().to_string();
                        let file_path = path.to_string_lossy().to_string();
                        let mut thumbnail_base64 = None;

                        // Thumbnail generation for images
                        if ["jpg", "png", "jpeg"].contains(&ext.as_str()) {
                            if let Ok(img) = image::open(path) {
                                let thumb = img.resize(320, 180, FilterType::Lanczos3);
                                let mut buf = std::io::Cursor::new(Vec::new());
                                if thumb.write_to(&mut buf, image::ImageFormat::Jpeg).is_ok() {
                                    let b64 = general_purpose::STANDARD.encode(buf.into_inner());
                                    thumbnail_base64 = Some(format!("data:image/jpeg;base64,{}", b64));
                                }
                            }
                        }

                        let pool_clone = pool.clone();
                        let file_path_clone = file_path.clone();
                        let thumb_clone = thumbnail_base64.clone();

                        let insert_result: Result<_, sqlx::Error> = tauri::async_runtime::block_on(async {
                            // Using standard query builder instead of macro to avoid offline preparation requirement
                            sqlx::query(
                                "INSERT OR IGNORE INTO media_assets (id, file_path, thumbnail_base64) VALUES (?, ?, ?)"
                            )
                            .bind(id)
                            .bind(file_path_clone)
                            .bind(thumb_clone)
                            .execute(&pool_clone)
                            .await
                        });

                        if insert_result.is_ok() {
                            count += 1;
                        }
                    }
                }
            }
        }
        Ok::<usize, String>(count)
    })
    .await
    .map_err(|e| e.to_string())?
    .map_err(|e| e.to_string())?;

    Ok(scanned_count)
}
