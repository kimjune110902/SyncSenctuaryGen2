use keyring::{Entry, Error as KeyringError};

#[derive(Debug)]
pub enum KeychainError {
    OS(String),
}

pub fn store_refresh_token(token: &str, user_id: Option<&str>) -> Result<(), KeychainError> {
    let account = user_id
        .map(|id| format!("refresh_token_{}", id))
        .unwrap_or_else(|| "refresh_token".to_string());

    let entry = Entry::new("SyncSanctuary", &account)
        .map_err(|e: KeyringError| KeychainError::OS(e.to_string()))?;

    entry.set_password(token)
        .map_err(|e: KeyringError| KeychainError::OS(e.to_string()))
}

pub fn read_refresh_token(user_id: Option<&str>) -> Result<String, KeychainError> {
    let account = user_id
        .map(|id| format!("refresh_token_{}", id))
        .unwrap_or_else(|| "refresh_token".to_string());

    let entry = Entry::new("SyncSanctuary", &account)
        .map_err(|e: KeyringError| KeychainError::OS(e.to_string()))?;

    entry.get_password()
        .map_err(|e: KeyringError| KeychainError::OS(e.to_string()))
}

pub fn clear_refresh_token(user_id: Option<&str>) -> Result<(), KeychainError> {
    let account = user_id
        .map(|id| format!("refresh_token_{}", id))
        .unwrap_or_else(|| "refresh_token".to_string());

    let entry = Entry::new("SyncSanctuary", &account)
        .map_err(|e: KeyringError| KeychainError::OS(e.to_string()))?;

    entry.delete_credential()
        .map_err(|e: KeyringError| KeychainError::OS(e.to_string()))
}
