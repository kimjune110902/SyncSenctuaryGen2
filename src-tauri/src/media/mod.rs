use std::path::{Path, PathBuf};
use std::fs;
use uuid::Uuid;
use walkdir::WalkDir;
use base64::{engine::general_purpose, Engine as _};
use image::imageops::FilterType;
use tauri::{AppHandle, Manager, State};
use tokio::sync::mpsc;

use crate::api::client::ApiError;
use crate::AppState;

pub struct MediaAssetData {
    pub id: String,
    pub file_path: String,
    pub thumbnail_base64: Option<String>,
}

pub fn validate_and_canonicalize(requested_path: &Path, app_data_dir: &Path, video_dir: Option<&PathBuf>) -> Result<PathBuf, String> {
    let canonical_requested = match fs::canonicalize(requested_path) {
        Ok(path) => path,
        Err(_) => return Err("Invalid path".to_string()),
    };

    let canonical_app_data = fs::canonicalize(app_data_dir).unwrap_or_default();
    if canonical_requested.starts_with(&canonical_app_data) {
        return Ok(canonical_requested);
    }

    if let Some(vid_dir) = video_dir {
        let canonical_video = fs::canonicalize(vid_dir).unwrap_or_default();
        if !canonical_video.as_os_str().is_empty() && canonical_requested.starts_with(&canonical_video) {
            return Ok(canonical_requested);
        }
    }

    Err("Access to the requested path is forbidden.".to_string())
}

#[tauri::command]
pub async fn scan_media_directory(
    path: String,
    app: AppHandle,
    state: State<'_, AppState>,
) -> Result<usize, String> {
    let requested_path = PathBuf::from(&path);

    // Security Audit: Prevent path traversal & TOCTOU
    let app_data_dir = app.path().app_data_dir().map_err(|e| e.to_string())?;
    let video_dir = app.path().video_dir().ok();

    let canonical_target = match validate_and_canonicalize(&requested_path, &app_data_dir, video_dir.as_ref()) {
        Ok(safe_path) => safe_path,
        Err(e) => return Err(serde_json::to_string(&ApiError::SecurityViolation { message: e }).unwrap()),
    };

    let pool = state.db_pool.clone();

    // MPSC Channel setup
    let (tx, mut rx) = mpsc::channel::<MediaAssetData>(1000);

    // Offload I/O to a background thread to prevent UI freezing
    let scanner_task = tokio::task::spawn_blocking(move || {
        // Use the SECURE canonical path, preventing TOCTOU
        for entry in WalkDir::new(&canonical_target).into_iter().filter_map(|e| e.ok()) {
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

                        let data = MediaAssetData {
                            id,
                            file_path,
                            thumbnail_base64,
                        };

                        if tx.blocking_send(data).is_err() {
                            break; // Receiver dropped, stop scanning
                        }
                    }
                }
            }
        }
    });

    // Async Task: Batch Database Insertions
    let mut total_inserted = 0;
    let mut batch = Vec::with_capacity(500);

    while let Some(asset) = rx.recv().await {
        batch.push(asset);

        if batch.len() >= 500 {
            let mut tx = pool.begin().await.map_err(|e| e.to_string())?;
            for item in &batch {
                let _ = sqlx::query(
                    "INSERT OR IGNORE INTO media_assets (id, file_path, thumbnail_base64) VALUES (?, ?, ?)"
                )
                .bind(&item.id)
                .bind(&item.file_path)
                .bind(&item.thumbnail_base64)
                .execute(&mut *tx)
                .await;
            }
            tx.commit().await.map_err(|e| e.to_string())?;
            total_inserted += batch.len();
            batch.clear();
        }
    }

    // Insert remaining items
    if !batch.is_empty() {
        let mut tx = pool.begin().await.map_err(|e| e.to_string())?;
        for item in &batch {
            let _ = sqlx::query(
                "INSERT OR IGNORE INTO media_assets (id, file_path, thumbnail_base64) VALUES (?, ?, ?)"
            )
            .bind(&item.id)
            .bind(&item.file_path)
            .bind(&item.thumbnail_base64)
            .execute(&mut *tx)
            .await;
        }
        tx.commit().await.map_err(|e| e.to_string())?;
        total_inserted += batch.len();
    }

    let _ = scanner_task.await; // Ensure scanning is complete

    Ok(total_inserted)
}
