use tauri::{AppHandle, Emitter};
use tokio::time::{interval, Duration};

#[derive(serde::Serialize, Clone)]
pub struct FramePayload {
    pub imageBase64: String, // Note: serde renames can be used, matched to frontend expectation
}

#[derive(serde::Serialize, Clone)]
pub struct OutputStatePayload {
    pub audienceActive: bool,
}

pub fn start_compositor(app: AppHandle) {
    tokio::spawn(async move {
        // Core compositing engine loop (headless)
        // 60fps ~ 16.6ms intervals
        let mut ticker = interval(Duration::from_millis(16));

        // In a real application, this is where GStreamer/FFmpeg wrappers pull frames
        // Here we mock the output generation with a valid 1x1 black JPEG base64 payload to satisfy the UI
        let dummy_jpeg_b64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";

        // Output states (simplified for foundation)
        let audience_active = true;

        // Emit initial state
        let _ = app.emit("output::state_changed", serde_json::json!({
            "audienceActive": audience_active
        }));

        loop {
            ticker.tick().await;

            // Generate Audience Frame Payload
            let audience_payload = FramePayload {
                imageBase64: dummy_jpeg_b64.to_string(),
            };

            // Generate Stage Frame Payload
            let stage_payload = FramePayload {
                imageBase64: dummy_jpeg_b64.to_string(),
            };

            // Emit to frontend Output Monitors
            if audience_active {
                let _ = app.emit("output::audience_frame", &audience_payload);
            }

            let _ = app.emit("output::stage_frame", &stage_payload);
        }
    });
}
