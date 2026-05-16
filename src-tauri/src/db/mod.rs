use sqlx::{sqlite::{SqliteConnectOptions, SqlitePoolOptions}, SqlitePool};
use std::path::PathBuf;
use std::str::FromStr;

pub async fn init_db(app_data_dir: &PathBuf) -> Result<SqlitePool, sqlx::Error> {
    let db_path = app_data_dir.join("syncsanctuary.db");

    let options = SqliteConnectOptions::from_str(&format!("sqlite://{}", db_path.display()))?
        .create_if_missing(true);

    let pool = SqlitePoolOptions::new()
        .max_connections(5)
        .connect_with(options)
        .await?;

    // Create schema
    sqlx::query(
        "CREATE TABLE IF NOT EXISTS slides (
            id TEXT PRIMARY KEY NOT NULL,
            sort_order INTEGER NOT NULL,
            content TEXT NOT NULL,
            type TEXT NOT NULL
        );"
    )
    .execute(&pool)
    .await?;

    sqlx::query(
        "CREATE TABLE IF NOT EXISTS media_assets (
            id TEXT PRIMARY KEY NOT NULL,
            file_path TEXT NOT NULL UNIQUE,
            duration_ms INTEGER,
            thumbnail_base64 TEXT
        );"
    )
    .execute(&pool)
    .await?;

    Ok(pool)
}
