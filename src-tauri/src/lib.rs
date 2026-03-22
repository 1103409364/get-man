use base64::{engine::general_purpose, Engine as _};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::time::Instant;

fn is_binary_content_type(content_type: &Option<String>) -> bool {
    match content_type {
        Some(ct) => {
            let ct_lower = ct.to_lowercase();
            ct_lower.contains("application/octet-stream")
                || ct_lower.contains("application/pdf")
                || ct_lower.contains("application/zip")
                || ct_lower.contains("image/")
                || ct_lower.contains("video/")
                || ct_lower.contains("audio/")
                || ct_lower.contains("application/x-rar")
                || ct_lower.contains("application/x-7z")
                || ct_lower.contains("application/x-tar")
                || ct_lower.contains("application/gzip")
        }
        None => false,
    }
}

fn is_binary_bytes(bytes: &[u8]) -> bool {
    if bytes.is_empty() {
        return false;
    }
    let sample_len = std::cmp::min(bytes.len(), 8192);
    let sample = &bytes[..sample_len];
    let null_count = sample.iter().filter(|&&b| b == 0).count();
    null_count > sample_len / 16
}

#[derive(Debug, Serialize, Deserialize)]
pub struct HttpRequest {
    pub url: String,
    pub method: String,
    pub headers: Vec<Header>,
    pub body: Option<String>,
    pub body_type: Option<String>,
    pub files: Option<Vec<FileInfo>>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct FileInfo {
    pub key: String,
    pub name: String,
    pub mime_type: String,
    pub data: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Header {
    pub key: String,
    pub value: String,
    #[serde(default = "default_enabled")]
    pub enabled: bool,
}

fn default_enabled() -> bool {
    true
}

#[derive(Debug, Serialize, Deserialize)]
pub struct HttpResponse {
    pub status: u16,
    pub status_text: String,
    pub headers: Vec<(String, String)>,
    pub body: String,
    pub time: u64,
    pub size: usize,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub error: Option<String>,
    pub is_binary: Option<bool>,
    pub mime_type: Option<String>,
    pub filename: Option<String>,
}

#[tauri::command]
async fn send_http_request(request: HttpRequest) -> Result<HttpResponse, String> {
    let client = reqwest::Client::builder()
        .timeout(std::time::Duration::from_secs(30))
        .build()
        .map_err(|e| e.to_string())?;

    let start = Instant::now();

    let method = match request.method.to_uppercase().as_str() {
        "GET" => reqwest::Method::GET,
        "POST" => reqwest::Method::POST,
        "PUT" => reqwest::Method::PUT,
        "PATCH" => reqwest::Method::PATCH,
        "DELETE" => reqwest::Method::DELETE,
        "HEAD" => reqwest::Method::HEAD,
        "OPTIONS" => reqwest::Method::OPTIONS,
        _ => reqwest::Method::GET,
    };

    let mut req = client.request(method, &request.url);

    for header in &request.headers {
        if header.enabled && !header.key.is_empty() {
            req = req.header(&header.key, &header.value);
        }
    }

    if let Some(ref body) = request.body {
        if !body.is_empty() {
            let body_type = request.body_type.as_deref().unwrap_or("raw");

            match body_type {
                "json" => {
                    req = req
                        .header("Content-Type", "application/json")
                        .body(body.clone());
                }
                "x-www-form-urlencoded" => {
                    req = req
                        .header("Content-Type", "application/x-www-form-urlencoded")
                        .body(body.clone());
                }
                "form-data" => {
                    let mut form = reqwest::multipart::Form::new();
                    if let Ok(parsed) = serde_json::from_str::<HashMap<String, String>>(body) {
                        for (k, v) in parsed {
                            form = form.text(k, v);
                        }
                    }
                    req = req.multipart(form);
                }
                _ => {
                    req = req.body(body.clone());
                }
            }
        }
    }

    if let Some(files) = request.files {
        if !files.is_empty() {
            let mut form = reqwest::multipart::Form::new();

            if let Some(ref body) = request.body {
                if !body.is_empty() {
                    if let Ok(parsed) = serde_json::from_str::<HashMap<String, String>>(body) {
                        for (k, v) in parsed {
                            form = form.text(k, v);
                        }
                    }
                }
            }

            for file_info in files {
                let bytes = general_purpose::STANDARD
                    .decode(&file_info.data)
                    .map_err(|e| e.to_string())?;
                let part = reqwest::multipart::Part::bytes(bytes)
                    .file_name(file_info.name)
                    .mime_str(&file_info.mime_type)
                    .map_err(|e| e.to_string())?;
                form = form.part(file_info.key, part);
            }

            req = req.multipart(form);
        }
    }

    let response = req.send().await.map_err(|e| e.to_string())?;

    let status = response.status().as_u16();
    let status_text = response
        .status()
        .canonical_reason()
        .unwrap_or("")
        .to_string();

    let headers: Vec<(String, String)> = response
        .headers()
        .iter()
        .map(|(k, v)| (k.to_string(), v.to_str().unwrap_or("").to_string()))
        .collect();

    let content_type = headers
        .iter()
        .find(|(k, _)| k.to_lowercase() == "content-type")
        .map(|(_, v)| v.clone());

    let content_disposition = headers
        .iter()
        .find(|(k, _)| k.to_lowercase() == "content-disposition")
        .map(|(_, v)| v.clone());

    let filename = content_disposition.and_then(|cd| {
        cd.split(';').find_map(|part| {
            let part = part.trim();
            if part.starts_with("filename=") {
                Some(part[9..].trim_matches('"').to_string())
            } else if part.starts_with("filename*=") {
                Some(part[10..].trim_matches('"').to_string())
            } else {
                None
            }
        })
    });

    let body_bytes = response.bytes().await.map_err(|e| e.to_string())?;
    let size = body_bytes.len();

    let is_binary = is_binary_content_type(&content_type) || is_binary_bytes(&body_bytes);

    let body = if is_binary {
        general_purpose::STANDARD.encode(&body_bytes)
    } else {
        String::from_utf8_lossy(&body_bytes).to_string()
    };

    let time = start.elapsed().as_millis() as u64;

    Ok(HttpResponse {
        status,
        status_text,
        headers,
        body,
        time,
        size,
        error: None,
        is_binary: Some(is_binary),
        mime_type: content_type,
        filename,
    })
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![send_http_request])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
