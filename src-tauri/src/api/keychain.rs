// Basic stub mock, the OS dependencies break easily based on system packages.
#[derive(Debug)]
pub enum KeychainError {
    OS(String),
}

pub fn store_refresh_token(token: &str, user_id: Option<&str>) -> Result<(), KeychainError> {
    let account = user_id
        .map(|id| format!("refresh_token_{}", id))
        .unwrap_or_else(|| "refresh_token".to_string());

    std::env::set_var(account, token);
    Ok(())
}

pub fn read_refresh_token(user_id: Option<&str>) -> Result<String, KeychainError> {
    let account = user_id
        .map(|id| format!("refresh_token_{}", id))
        .unwrap_or_else(|| "refresh_token".to_string());

    std::env::var(&account)
        .map_err(|e| KeychainError::OS(e.to_string()))
}

pub fn clear_refresh_token(user_id: Option<&str>) -> Result<(), KeychainError> {
    let account = user_id
        .map(|id| format!("refresh_token_{}", id))
        .unwrap_or_else(|| "refresh_token".to_string());

    std::env::remove_var(account);
    Ok(())
}
