<template>
  <div class="request-editor">
    <div class="editor-toolbar">
      <input 
        v-model="requestName"
        type="text"
        placeholder="请求名称（可选）"
        class="request-name-input"
      />
      <button class="btn-send" @click="sendRequest" :disabled="loading">
        <svg v-if="loading" class="spinner" width="16" height="16" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none" stroke-dasharray="60" stroke-linecap="round">
            <animate attributeName="stroke-dashoffset" from="0" to="60" dur="1s" repeatCount="indefinite"/>
          </circle>
        </svg>
        <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="22" y1="2" x2="11" y2="13"/>
          <polygon points="22 2 15 22 11 13 2 9 22 2"/>
        </svg>
        发送
      </button>
    </div>
    
    <div class="url-bar">
      <MethodSelect v-model="currentRequest.method" />
      <input 
        v-model="currentRequest.url"
        type="text"
        placeholder="输入请求 URL（支持 {{variable}} 变量）"
        class="url-input"
        @keydown.enter="sendRequest"
      />
    </div>
    
    <div class="editor-tabs">
      <button 
        v-for="tab in tabs"
        :key="tab.id"
        class="tab-btn"
        :class="{ active: activeTab === tab.id }"
        @click="activeTab = tab.id"
      >
        {{ tab.label }}
        <span v-if="tab.id === 'headers' && headerCount" class="badge">{{ headerCount }}</span>
      </button>
    </div>
    
    <div class="editor-content">
      <div v-show="activeTab === 'headers'" class="tab-panel">
        <KeyValueEditor 
          v-model="currentRequest.headers"
          placeholder-key="Header Name"
          placeholder-value="Header Value"
        />
      </div>
      
<div v-show="activeTab === 'body'" class="tab-panel">
    <div class="body-type-selector">
      <button
        v-for="type in bodyTypes"
        :key="type.id"
        class="type-btn"
        :class="{ active: currentRequest.bodyType === type.id }"
        @click="currentRequest.bodyType = type.id"
      >
        {{ type.label }}
      </button>
    </div>
    <div v-if="currentRequest.bodyType === 'binary'" class="binary-upload">
      <div class="file-list">
        <div v-for="(file, index) in currentRequest.files" :key="index" class="file-item">
          <span class="file-name">{{ file.name }}</span>
          <span class="file-size">{{ formatFileSize(file.size) }}</span>
          <button class="btn-remove-file" @click="removeFile(index)" title="删除">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
      </div>
      <label class="btn-upload">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <polyline points="17 8 12 3 7 8"/>
          <line x1="12" y1="3" x2="12" y2="15"/>
        </svg>
        选择文件
        <input type="file" @change="handleFileSelect" style="display: none" />
      </label>
    </div>
    <textarea
      v-else
      v-model="currentRequest.body"
      class="body-editor"
      :placeholder="bodyPlaceholder"
    ></textarea>
  </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { state } from '../stores/store.js'
import { sendRequest as sendHttpRequest } from '../utils/http.js'
import MethodSelect from './MethodSelect.vue'
import KeyValueEditor from './KeyValueEditor.vue'

const currentRequest = computed(() => state.currentRequest)
const loading = computed(() => state.loading)

const requestName = ref('')
const activeTab = ref('headers')

const tabs = [
  { id: 'headers', label: 'Headers' },
  { id: 'body', label: 'Body' }
]

const bodyTypes = [
  { id: 'json', label: 'JSON' },
  { id: 'form-data', label: 'Form Data' },
  { id: 'x-www-form-urlencoded', label: 'x-www-form-urlencoded' },
  { id: 'raw', label: 'Raw' },
  { id: 'binary', label: 'Binary' }
]

const headerCount = computed(() => {
  return currentRequest.value.headers?.filter(h => h.key && h.enabled !== false).length || 0
})

const bodyPlaceholder = computed(() => {
  const type = currentRequest.value.bodyType
  if (type === 'json') return '{\n  "key": "value"\n}'
  if (type === 'x-www-form-urlencoded') return 'key1=value1&key2=value2'
  if (type === 'form-data') return '{\n  "key": "value"\n}'
  return 'Raw text content'
})

watch(() => currentRequest.value.name, (name) => {
  requestName.value = name || ''
}, { immediate: true })

watch(requestName, (name) => {
  currentRequest.value.name = name
})

watch(() => currentRequest.value.bodyType, (newType) => {
  if (newType !== 'binary' && currentRequest.value.files) {
    currentRequest.value.files = []
  }
})

function sendRequest() {
  sendHttpRequest()
}

async function handleFileSelect(event) {
  const fileInput = event.target
  const file = fileInput.files[0]
  if (!file) return
  
  const reader = new FileReader()
  reader.onload = (e) => {
    const base64 = e.target.result.split(',')[1]
    const fileInfo = {
      key: 'file',
      name: file.name,
      mime_type: file.type || 'application/octet-stream',
      data: base64,
      size: file.size
    }
    if (!currentRequest.value.files) {
      currentRequest.value.files = []
    }
    currentRequest.value.files.push(fileInfo)
  }
  reader.readAsDataURL(file)
  fileInput.value = ''
}

function removeFile(index) {
  currentRequest.value.files.splice(index, 1)
}

function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}
</script>

<style scoped>
.request-editor {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--color-surface-1);
  border-right: 1px solid var(--color-border);
}

.editor-toolbar {
  height: 54px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-bottom: 1px solid var(--color-border);
}

.request-name-input {
  height: 30px;
  flex: 1;
  padding: 8px 12px;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  background: var(--color-surface-2);
  color: inherit;
  font-size: 14px;
}

.request-name-input:focus {
  outline: none;
  border-color: var(--color-primary);
}

.request-name-input::placeholder {
  color: var(--color-text-tertiary);
}

.btn-send {
  height: 30px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 20px;
  border: none;
  border-radius: 6px;
  background: var(--color-primary);
  color: white;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-send:hover:not(:disabled) {
  filter: brightness(1.1);
}

.btn-send:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.url-bar {
  display: flex;
  gap: 8px;
  padding: 10px 12px;
  border-bottom: 1px solid var(--color-border);
}

.url-input {
  flex: 1;
  padding: 8px 14px;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  background: var(--color-surface-2);
  color: inherit;
  font-size: 13px;
  font-family: 'JetBrains Mono', 'SF Mono', Monaco, monospace;
}

.url-input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-primary-alpha);
}

.url-input::placeholder {
  color: var(--color-text-tertiary);
}

.editor-tabs {
  display: flex;
  gap: 4px;
  padding: 8px 12px;
  border-bottom: 1px solid var(--color-border);
  background: var(--color-surface-2);
}

.tab-btn {
  height: 30px;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border: none;
  border-radius: 4px;
  background: transparent;
  color: var(--color-text-secondary);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
}

.tab-btn:hover {
  background: var(--color-surface-3);
  color: var(--color-text);
}

.tab-btn.active {
  background: var(--color-primary);
  color: white;
}

.badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  border-radius: 9px;
  background: rgba(255, 255, 255, 0.2);
  font-size: 10px;
  font-weight: 600;
}

.editor-content {
  flex: 1;
  overflow: hidden;
}

.tab-panel {
  height: 100%;
  padding: 12px;
  overflow: auto;
}

.body-type-selector {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.type-btn {
  padding: 6px 12px;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  background: transparent;
  color: var(--color-text-secondary);
  font-size: 12px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.type-btn:hover {
  border-color: var(--color-text-secondary);
}

.type-btn.active {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: white;
}

.body-editor {
  width: 100%;
  height: calc(100% - 50px);
  padding: 14px;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  background: var(--color-surface-2);
  color: inherit;
  font-family: 'JetBrains Mono', 'SF Mono', Monaco, monospace;
  font-size: 13px;
  line-height: 1.6;
  resize: none;
}

.body-editor:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-primary-alpha);
}

.body-editor::placeholder {
  color: var(--color-text-tertiary);
}

.binary-upload {
  display: flex;
  flex-direction: column;
  gap: 12px;
  height: calc(100% - 50px);
}

.file-list {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
  overflow: auto;
}

.file-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  background: var(--color-surface-2);
  border: 1px solid var(--color-border);
  border-radius: 6px;
}

.file-name {
  flex: 1;
  font-size: 13px;
  font-family: 'JetBrains Mono', 'SF Mono', Monaco, monospace;
  word-break: break-all;
}

.file-size {
  font-size: 12px;
  color: var(--color-text-secondary);
}

.btn-remove-file {
  padding: 4px;
  border: none;
  border-radius: 4px;
  background: transparent;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-remove-file:hover {
  background: var(--color-surface-3);
  color: var(--color-error);
}

.btn-upload {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border: 1px dashed var(--color-border);
  border-radius: 6px;
  background: transparent;
  color: var(--color-text-secondary);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-upload:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}
</style>
