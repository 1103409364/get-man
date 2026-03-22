import { invoke } from '@tauri-apps/api/core'
import { state, addHistoryEntry, substituteVariables } from '../stores/store.js'

function substituteHeadersVariables(headers) {
  return headers.map(h => ({
    ...h,
    key: substituteVariables(h.key),
    value: substituteVariables(h.value)
  }))
}

function substituteBodyVariables(body, bodyType) {
  if (!body) return body

  if (bodyType === 'json') {
    try {
      const parsed = JSON.parse(body)
      const substituteObj = (obj) => {
        if (typeof obj === 'string') {
          return substituteVariables(obj)
        } else if (Array.isArray(obj)) {
          return obj.map(substituteObj)
        } else if (typeof obj === 'object' && obj !== null) {
          const result = {}
          for (const key in obj) {
            result[key] = substituteObj(obj[key])
          }
          return result
        }
        return obj
      }
      return JSON.stringify(substituteObj(parsed), null, 2)
    } catch {
      return substituteVariables(body)
    }
  }

  return substituteVariables(body)
}

async function sendRequest() {
  if (!state.currentRequest.url) {
    state.error = '请输入 URL'
    return
  }

  state.loading = true
  state.error = null
  state.response = null

  const startTime = performance.now()

  try {
    const url = substituteVariables(state.currentRequest.url)
    const method = state.currentRequest.method.toUpperCase()
    const headers = substituteHeadersVariables(state.currentRequest.headers || [])
    const bodyType = state.currentRequest.bodyType
    const body = substituteBodyVariables(state.currentRequest.body, bodyType)

const request = {
    url,
    method,
    headers: headers.filter(h => h.key && h.enabled !== false).map(h => ({
      key: h.key,
      value: h.value,
      enabled: h.enabled !== false
    })),
    body: body || null,
    body_type: bodyType || null,
    files: state.currentRequest.files || null
  }

    const response = await invoke('send_http_request', { request })

state.response = {
    status: response.status,
    statusText: response.status_text,
    headers: response.headers,
    body: response.body,
    time: response.time,
    size: response.size,
    isBinary: response.is_binary,
    mimeType: response.mime_type,
    filename: response.filename
  }

    await addHistoryEntry({
      method: state.currentRequest.method,
      url: state.currentRequest.url,
      status: response.status,
      time: response.time,
      request: JSON.stringify(state.currentRequest)
    })

  } catch (err) {
    const endTime = performance.now()
    state.error = err.message || err || '请求失败'

    await addHistoryEntry({
      method: state.currentRequest.method,
      url: state.currentRequest.url,
      status: 0,
      time: Math.round(endTime - startTime),
      request: JSON.stringify(state.currentRequest),
      error: err.message || err
    })
  } finally {
    state.loading = false
  }
}

export {
  sendRequest
}
