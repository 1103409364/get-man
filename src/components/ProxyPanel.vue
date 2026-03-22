<template>
  <div class="proxy-panel">
    <div class="proxy-header">
      <h3>代理设置</h3>
      <label class="toggle">
        <input type="checkbox" v-model="proxyEnabled" />
        <span class="toggle-slider"></span>
        <span class="toggle-label">{{ proxyEnabled ? '已启用' : '已禁用' }}</span>
      </label>
    </div>
    
    <div class="proxy-content" :class="{ disabled: !proxyEnabled }">
      <div class="field">
        <label>代理服务器地址</label>
        <input 
          v-model="proxyUrl"
          type="text"
          placeholder="例如：http://localhost:8080/proxy"
          :disabled="!proxyEnabled"
        />
      </div>
      
      <div class="help-text">
        <p>启用代理后，请求将通过代理服务器转发，解决跨域问题。</p>
        <p class="example">
          <strong>示例：</strong><br>
          原始请求：<code>https://api.example.com/users</code><br>
          代理请求：<code>http://localhost:8080/proxy/https://api.example.com/users</code>
        </p>
      </div>
      
      <div class="server-examples">
        <p><strong>快速启动代理服务器：</strong></p>
        <div class="code-block">
          <pre># Node.js (使用 cors-anywhere)
npx cors-anywhere

# 或使用 http-proxy-middleware 自建</pre>
          <button class="btn-copy" @click="copyCommand('npx cors-anywhere')">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { state } from '../stores/store.js'

const proxyEnabled = computed({
  get: () => state.proxyEnabled,
  set: (val) => { state.proxyEnabled = val }
})

const proxyUrl = computed({
  get: () => state.proxyUrl,
  set: (val) => { state.proxyUrl = val }
})

function copyCommand(cmd) {
  navigator.clipboard.writeText(cmd)
}
</script>

<style scoped>
.proxy-panel {
  background: var(--color-surface-1);
  border-radius: 12px;
  overflow: hidden;
}

.proxy-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-bottom: 1px solid var(--color-border);
}

.proxy-header h3 {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
}

.toggle {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
}

.toggle input {
  display: none;
}

.toggle-slider {
  position: relative;
  width: 40px;
  height: 22px;
  background: var(--color-surface-3);
  border-radius: 11px;
  transition: background 0.2s ease;
}

.toggle-slider::after {
  content: '';
  position: absolute;
  top: 3px;
  left: 3px;
  width: 16px;
  height: 16px;
  background: var(--color-text-secondary);
  border-radius: 50%;
  transition: all 0.2s ease;
}

.toggle input:checked + .toggle-slider {
  background: var(--color-primary);
}

.toggle input:checked + .toggle-slider::after {
  left: 21px;
  background: white;
}

.toggle-label {
  font-size: 12px;
  color: var(--color-text-secondary);
}

.proxy-content {
  padding: 16px;
}

.proxy-content.disabled {
  opacity: 0.5;
  pointer-events: none;
}

.field {
  margin-bottom: 16px;
}

.field label {
  display: block;
  margin-bottom: 8px;
  font-size: 12px;
  font-weight: 500;
  color: var(--color-text-secondary);
}

.field input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  background: var(--color-surface-2);
  color: inherit;
  font-size: 13px;
  font-family: 'JetBrains Mono', 'SF Mono', Monaco, monospace;
  box-sizing: border-box;
}

.field input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-primary-alpha);
}

.field input::placeholder {
  color: var(--color-text-tertiary);
}

.help-text {
  margin-bottom: 16px;
  padding: 12px;
  background: var(--color-surface-2);
  border-radius: 6px;
}

.help-text p {
  margin: 0;
  font-size: 12px;
  color: var(--color-text-secondary);
  line-height: 1.6;
}

.help-text .example {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid var(--color-border);
}

.help-text code {
  background: var(--color-surface-3);
  padding: 2px 6px;
  border-radius: 3px;
  font-family: 'JetBrains Mono', 'SF Mono', Monaco, monospace;
  font-size: 11px;
  word-break: break-all;
}

.server-examples p {
  margin: 0 0 8px;
  font-size: 12px;
  font-weight: 500;
  color: var(--color-text-secondary);
}

.code-block {
  position: relative;
  background: var(--color-surface-2);
  border-radius: 6px;
  padding: 12px;
}

.code-block pre {
  margin: 0;
  font-family: 'JetBrains Mono', 'SF Mono', Monaco, monospace;
  font-size: 11px;
  color: var(--color-text);
  white-space: pre-wrap;
}

.btn-copy {
  position: absolute;
  top: 8px;
  right: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 4px;
  background: transparent;
  color: var(--color-text-tertiary);
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-copy:hover {
  background: var(--color-surface-3);
  color: var(--color-text);
}
</style>
