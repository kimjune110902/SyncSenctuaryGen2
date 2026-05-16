use tauri::{AppHandle, Emitter, State};
use tokio::time::{interval, Duration};
use std::sync::Arc;
use tokio::sync::RwLock;
use image::{RgbImage, Rgb};
use base64::{engine::general_purpose, Engine as _};
use std::io::Cursor;
use sqlx::Row;

use crate::AppState;

pub struct CompositorState {
    pub live_slide_id: Option<String>,
    pub live_slide_content: Option<String>,
    pub live_media_id: Option<String>,
    pub is_blackout_active: bool,
    pub global_audio_level: f32,
}

impl Default for CompositorState {
    fn default() -> Self {
        Self {
            live_slide_id: None,
            live_slide_content: None,
            live_media_id: None,
            is_blackout_active: false,
            global_audio_level: 0.0,
        }
    }
}

#[derive(serde::Serialize, Clone)]
pub struct FramePayload {
    pub image_base64: String,
}

#[tauri::command]
pub async fn set_live_slide(
    slide_id: String,
    state: State<'_, AppState>,
) -> Result<(), String> {
    // 1. Query the database for the slide content
    let pool = &state.db_pool;

    // In a real application, the schema might differ slightly or contain JSON blobs.
    // Assuming `content` is a text field based on the schema defined in Part EIGHT.
    let record = sqlx::query("SELECT content FROM slides WHERE id = ?")
        .bind(&slide_id)
        .fetch_optional(pool)
        .await
        .map_err(|e| format!("Database error: {}", e))?;

    let content = record.map(|r| r.get::<String, _>("content"));

    // 2. Safely mutate the Compositor State
    let mut comp_state = state.compositor_state.write().await;
    comp_state.live_slide_id = Some(slide_id);
    comp_state.live_slide_content = content;

    Ok(())
}

pub fn start_compositor(app: AppHandle, state: Arc<RwLock<CompositorState>>) {
    tokio::spawn(async move {
        let mut ticker = interval(Duration::from_millis(16));

        loop {
            ticker.tick().await;

            // 1. Acquire read lock on the shared engine state
            let current_state = state.read().await;

            // 2. Generate frame base buffer (1280x720)
            let mut img = RgbImage::new(1280, 720);

            if current_state.is_blackout_active {
                // Blackout active: Leave frame as black (0,0,0)
                image::imageops::colorops::contrast_in_place(&mut img, -100.0); // Ensure black
            } else {
                // Compositor logic:
                // Draw background media (if live_media_id is present)
                if let Some(ref _media_id) = current_state.live_media_id {
                    // Logic to decode and paint media frame would go here.
                    // For now, fill with dark blue as a media placeholder
                    for pixel in img.pixels_mut() {
                        *pixel = Rgb([0, 0, 50]);
                    }
                }

                // Draw slide content overlay
                if let Some(ref _content) = current_state.live_slide_content {
                    // Logic to render text (e.g., using rusttype/ab_glyph or wgpu text rendering)
                    // As a simple visual indicator for this structural scaffold, fill a block
                    // to indicate text is being rendered
                    for y in 600..700 {
                        for x in 100..1180 {
                            img.put_pixel(x, y, Rgb([255, 255, 255]));
                        }
                    }
                }
            }

            // 3. Encode the frame
            let mut buf = Cursor::new(Vec::new());
            // Fast JPEG encoding for live streaming to the UI
            let _ = image::DynamicImage::ImageRgb8(img).write_to(&mut buf, image::ImageFormat::Jpeg);

            let b64 = general_purpose::STANDARD.encode(buf.into_inner());
            let formatted_b64 = b64;

            let payload = FramePayload {
                image_base64: formatted_b64,
            };

            // 4. Emit to frontend
            let _ = app.emit("output::audience_frame", &payload);
            let _ = app.emit("output::stage_frame", &payload);
        }
    });
}
