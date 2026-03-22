import axios from 'axios'
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
    const method = state.currentRequest.method.toLowerCase()
    const headers = substituteHeadersVariables(state.currentRequest.headers || [])
    const bodyType = state.currentRequest.bodyType
    const body = substituteBodyVariables(state.currentRequest.body, bodyType)
    
    const config = {
      method,
      url,
      headers: headers.reduce((acc, h) => {
        if (h.key && h.enabled !== false) {
          acc[h.key] = h.value
        }
        return acc
      }, {}),
      timeout: 30000,
      validateStatus: () => true
    }
    
    if (['post', 'put', 'patch'].includes(method) && body) {
      if (bodyType === 'json') {
        config.data = JSON.parse(body)
        if (!config.headers['Content-Type']) {
          config.headers['Content-Type'] = 'application/json'
        }
      } else if (bodyType === 'x-www-form-urlencoded') {
        const params = new URLSearchParams()
        try {
          const parsed = JSON.parse(body)
          for (const key in parsed) {
            params.append(key, parsed[key])
          }
        } catch {
          body.split('&').forEach(pair => {
            const [key, value] = pair.split('=')
            if (key) params.append(key, value || '')
          })
        }
        config.data = params
        if (!config.headers['Content-Type']) {
          config.headers['Content-Type'] = 'application/x-www-form-urlencoded'
        }
      } else if (bodyType === 'form-data') {
        const formData = new FormData()
        try {
          const parsed = JSON.parse(body)
          for (const key in parsed) {
            formData.append(key, parsed[key])
          }
        } catch {
          body.split('&').forEach(pair => {
            const [key, value] = pair.split('=')
            if (key) formData.append(key, value || '')
          })
        }
        config.data = formData
      } else {
        config.data = body
      }
    }
    
    const response = await axios(config)
    const endTime = performance.now()
    
    const responseData = response.data
    let responseBody
    
    try {
      if (typeof responseData === 'object') {
        responseBody = JSON.stringify(responseData, null, 2)
      } else {
        responseBody = String(responseData)
      }
    } catch {
      responseBody = String(responseData)
    }
    
    state.response = {
      status: response.status,
      statusText: response.statusText,
      headers: Object.entries(response.headers),
      body: responseBody,
      time: Math.round(endTime - startTime),
      size: new Blob([responseBody]).size
    }
    
    await addHistoryEntry({
      method: state.currentRequest.method,
      url: state.currentRequest.url,
      status: response.status,
      time: Math.round(endTime - startTime),
      request: JSON.stringify(state.currentRequest)
    })
    
  } catch (err) {
    const endTime = performance.now()
    state.error = err.message || '请求失败'
    
    await addHistoryEntry({
      method: state.currentRequest.method,
      url: state.currentRequest.url,
      status: 0,
      time: Math.round(endTime - startTime),
      request: JSON.stringify(state.currentRequest),
      error: err.message
    })
  } finally {
    state.loading = false
  }
}

export {
  sendRequest
}
