use serde::{Deserialize, Serialize};
use serde_json::Value;
use std::sync::{Arc, Mutex};
use reqwest::{Client, Method, Response};
use chrono::{DateTime, Utc};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct User {
    pub id: String,
    pub username: String,
    pub email: Option<String>,
    pub phone_number: String,
    pub language: String,
    pub role: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct TokenPair {
    pub access_token: String,
    pub refresh_token: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct AuthResponse {
    pub access_token: String,
    pub refresh_token: String,
    pub user: User,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(tag = "type")]
pub enum ApiError {
    Network { message: String },
    InvalidCredentials,
    AccountLocked { locked_until: DateTime<Utc>, retry_after_seconds: i64 },
    AccountSuspended,
    AccountDeleted,
    NoPasswordSet,
    TokenExpired,
    TokenRevoked { reason: String },
    TokenTheftDetected,
    UserInactive,
    ClientOutdated { minimum_version: String, download_url: String },
    RateLimited { retry_after_seconds: i64 },
    ServerError { status: u16, message: String },
    Timeout,
}

pub struct ApiClient {
    pub http: reqwest::Client,
    pub base_url: String,
    pub access_token: Arc<Mutex<Option<String>>>,
    pub app_version: String,
    pub platform: String,
}

impl ApiClient {
    pub fn new(base_url: String, app_version: String, platform: String, access_token: Arc<Mutex<Option<String>>>) -> Self {
        ApiClient {
            http: Client::builder().timeout(std::time::Duration::from_secs(15)).build().unwrap_or_else(|_| Client::new()),
            base_url,
            access_token,
            app_version,
            platform,
        }
    }

    pub async fn request(&self, method: Method, path: &str, body: Option<Value>) -> Result<Response, ApiError> {
        let url = format!("{}{}", self.base_url, path);
        let mut builder = self.http.request(method.clone(), &url)
            .header("X-Client-Version", &self.app_version)
            .header("X-Client-Platform", &self.platform);

        let token_opt = {
            let lock = self.access_token.lock().unwrap();
            lock.clone()
        };

        if let Some(token) = token_opt {
            builder = builder.header("Authorization", format!("Bearer {}", token));
        }

        if let Some(b) = body.clone() {
            builder = builder.json(&b);
        }

        let resp = builder.send().await.map_err(|e| ApiError::Network { message: e.to_string() })?;

        Ok(resp)
    }

    pub async fn refresh_tokens(&self, raw_refresh_token: &str) -> Result<AuthResponse, ApiError> {
        let url = format!("{}/api/v1/auth/refresh", self.base_url);
        let req_body = serde_json::json!({ "client_type": "desktop" });

        let builder = self.http.post(&url)
            .header("X-Client-Version", &self.app_version)
            .header("X-Client-Platform", &self.platform)
            .header("Authorization", format!("Bearer {}", raw_refresh_token))
            .json(&req_body);

        let resp = builder.send().await.map_err(|e| ApiError::Network { message: e.to_string() })?;

        if resp.status().is_success() {
            let data: AuthResponse = resp.json().await.map_err(|_| ApiError::ServerError { status: 500, message: "Invalid JSON".into() })?;
            Ok(data)
        } else if resp.status() == 401 {
            Err(ApiError::TokenTheftDetected)
        } else {
            Err(ApiError::TokenRevoked { reason: "Refresh failed".into() })
        }
    }

    pub async fn login_impl(&self, identifier: &str, password: &str, _platform: &str) -> Result<AuthResponse, ApiError> {
        let url = format!("{}/api/v1/auth/login", self.base_url);
        let req_body = serde_json::json!({
            "identifier": identifier,
            "password": password,
            "client_type": "desktop",
            "client_version": self.app_version,
            "platform": self.platform,
            "remember_device": true
        });

        let resp = self.http.post(&url)
            .header("X-Client-Version", &self.app_version)
            .header("X-Client-Platform", &self.platform)
            .json(&req_body)
            .send().await.map_err(|e| ApiError::Network { message: e.to_string() })?;

        if resp.status().is_success() {
            let auth_response: AuthResponse = resp.json().await.map_err(|_| ApiError::ServerError { status: 500, message: "Invalid JSON".into() })?;
            Ok(auth_response)
        } else if resp.status() == 401 {
             Err(ApiError::InvalidCredentials)
        } else {
            Err(ApiError::ServerError { status: resp.status().as_u16(), message: "Failed".into() })
        }
    }

    pub async fn logout_impl(&self, _raw_refresh_token: &str) -> Result<(), ApiError> {
        let url = format!("{}/api/v1/auth/logout", self.base_url);
        let req_body = serde_json::json!({ "all_devices": false });

        let mut builder = self.http.post(&url)
            .header("X-Client-Version", &self.app_version)
            .header("X-Client-Platform", &self.platform);

        let token_opt = {
            let lock = self.access_token.lock().unwrap();
            lock.clone()
        };

        if let Some(token) = token_opt {
            builder = builder.header("Authorization", format!("Bearer {}", token));
        }

        builder.json(&req_body).send().await.map_err(|e| ApiError::Network { message: e.to_string() })?;
        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use mockito::Server;
    use std::sync::{Arc, Mutex};

    #[tokio::test]
    async fn test_refresh_token_theft_detected() {
        let mut server = Server::new_async().await;

        let _m = server.mock("POST", "/api/v1/auth/refresh")
            .with_status(401)
            .with_header("content-type", "application/json")
            .with_body(r#"{"error": "TOKEN_THEFT_DETECTED"}"#)
            .create_async()
            .await;

        let base_url = server.url();
        let access_token = Arc::new(Mutex::new(None));
        let client = ApiClient::new(
            base_url,
            "1.0.0".to_string(),
            "macos".to_string(),
            access_token,
        );

        let result = client.refresh_tokens("stolen_raw_token").await;

        match result {
            Err(ApiError::TokenTheftDetected) => {
                // Success: properly mapped!
            }
            other => {
                panic!("Expected TokenTheftDetected error, got {:?}", other);
            }
        }
    }
}
