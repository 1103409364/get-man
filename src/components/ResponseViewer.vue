<template>
  <div class="response-viewer" v-if="response">
    <div class="response-bar">
      <div class="response-status" :class="statusClass">
        <span class="status-code">{{ response.status }}</span>
        <span class="status-text">{{ response.statusText }}</span>
      </div>
      <div class="response-meta">
        <span class="meta-item">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12 6 12 12 16 14"/>
          </svg>
          {{ response.time }}ms
        </span>
        <span class="meta-item">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          {{ formatSize(response.size) }}
        </span>
      </div>
      <div class="response-tabs">
        <button 
          v-for="tab in tabs" 
          :key="tab.id"
          class="tab-btn"
          :class="{ active: activeTab === tab.id }"
          @click="activeTab = tab.id"
        >
          {{ tab.label }}
        </button>
      </div>
    </div>
    
    <div class="response-content" v-show="activeTab === 'body'">
      <div class="response-toolbar">
        <div class="view-modes">
          <button 
            v-for="mode in viewModes" 
            :key="mode.id"
            class="mode-btn"
            :class="{ active: viewMode === mode.id }"
            @click="viewMode = mode.id"
          >
            {{ mode.label }}
          </button>
        </div>
        <button class="btn-copy" @click="copyResponse" title="复制">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
          </svg>
        </button>
      </div>
      <div class="response-body">
        <pre v-if="viewMode === 'pretty'" class="code-block"><code v-html="highlightedBody"></code></pre>
        <pre v-else class="code-block raw">{{ response.body }}</pre>
      </div>
    </div>
    
    <div class="response-content" v-show="activeTab === 'headers'">
      <div class="headers-list">
        <div v-for="[key, value] in response.headers" :key="key" class="header-item">
          <span class="header-key">{{ key }}</span>
          <span class="header-value">{{ value }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import hljs from 'highlight.js/lib/core'
import json from 'highlight.js/lib/languages/json'
import xml from 'highlight.js/lib/languages/xml'

hljs.registerLanguage('json', json)
hljs.registerLanguage('xml', xml)

const props = defineProps({
  response: { type: Object, default: null }
})

const activeTab = ref('body')
const viewMode = ref('pretty')

const tabs = [
  { id: 'body', label: 'Body' },
  { id: 'headers', label: 'Headers' }
]

const viewModes = [
  { id: 'pretty', label: 'Pretty' },
  { id: 'raw', label: 'Raw' }
]

const statusClass = computed(() => {
  const status = props.response?.status || 0
  if (status >= 200 && status < 300) return 'status-success'
  if (status >= 300 && status < 400) return 'status-redirect'
  if (status >= 400 && status < 500) return 'status-client-error'
  if (status >= 500) return 'status-server-error'
  return 'status-error'
})

const highlightedBody = computed(() => {
  if (!props.response?.body) return ''
  
  try {
    const body = props.response.body
    if (body.trim().startsWith('{') || body.trim().startsWith('[')) {
      return hljs.highlight(body, { language: 'json' }).value
    }
    if (body.trim().startsWith('<')) {
      return hljs.highlight(body, { language: 'xml' }).value
    }
    return hljs.highlightAuto(body).value
  } catch {
    return props.response.body
  }
})

function formatSize(bytes) {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

function copyResponse() {
  navigator.clipboard.writeText(props.response?.body || '')
}
</script>

<style scoped>
.response-viewer {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--color-surface-1);
}

.response-bar {
  height: 54px;
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 0 12px;
  border-bottom: 1px solid var(--color-border);
  background: var(--color-surface-2);
}

.response-status {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 12px;
  border-radius: 6px;
  font-family: 'JetBrains Mono', 'SF Mono', Monaco, monospace;
  font-weight: 600;
}

.status-code {
  font-size: 14px;
}

.status-text {
  font-size: 12px;
  opacity: 0.8;
}

.status-success { background: rgba(34, 197, 94, 0.15); color: #22c55e; }
.status-redirect { background: rgba(59, 130, 246, 0.15); color: #3b82f6; }
.status-client-error { background: rgba(249, 115, 22, 0.15); color: #f97316; }
.status-server-error { background: rgba(239, 68, 68, 0.15); color: #ef4444; }
.status-error { background: rgba(239, 68, 68, 0.15); color: #ef4444; }

.response-meta {
  display: flex;
  gap: 16px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--color-text-secondary);
}

.response-tabs {
  margin-left: auto;
  display: flex;
  gap: 4px;
}

.tab-btn {
   height: 30px;
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  background: transparent;
  color: var(--color-text-secondary);
  font-size: 12px;
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

.response-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.response-toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  border-bottom: 1px solid var(--color-border);
}

.view-modes {
  display: flex;
  gap: 4px;
}

.mode-btn {
  padding: 4px 10px;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  background: transparent;
  color: var(--color-text-secondary);
  font-size: 11px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.mode-btn:hover {
  border-color: var(--color-text-secondary);
}

.mode-btn.active {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: white;
}

.btn-copy {
  margin-left: auto;
  padding: 6px;
  border: none;
  border-radius: 4px;
  background: transparent;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-copy:hover {
  background: var(--color-surface-3);
  color: var(--color-text);
}

.response-body {
  flex: 1;
  overflow: auto;
  padding: 12px;
}

.code-block {
  margin: 0;
  padding: 0;
  font-family: 'JetBrains Mono', 'SF Mono', Monaco, monospace;
  font-size: 12px;
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-all;
}

.code-block :deep(.hljs) {
  background: transparent;
}

.code-block.raw {
  white-space: pre;
}

.headers-list {
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  overflow: auto;
}

.header-item {
  display: grid;
  grid-template-columns: 200px 1fr;
  gap: 16px;
  padding: 8px 12px;
  background: var(--color-surface-2);
  border-radius: 4px;
}

.header-key {
  font-family: 'JetBrains Mono', 'SF Mono', Monaco, monospace;
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text);
}

.header-value {
  font-family: 'JetBrains Mono', 'SF Mono', Monaco, monospace;
  font-size: 12px;
  color: var(--color-text-secondary);
  word-break: break-all;
}
</style>
