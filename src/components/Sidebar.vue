<template>
  <div class="sidebar">
    <div class="sidebar-header">
      <div class="sidebar-tabs">
        <button 
          class="tab-btn"
          :class="{ active: tab === 'collections' }"
          @click="tab = 'collections'"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
          </svg>
          集合
        </button>
        <button 
          class="tab-btn"
          :class="{ active: tab === 'history' }"
          @click="tab = 'history'"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12 6 12 12 16 14"/>
          </svg>
          历史
        </button>
      </div>
      <button 
        v-if="tab === 'collections'"
        class="btn-add"
        @click="showNewCollectionDialog = true"
        title="新建集合"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="12" y1="5" x2="12" y2="19"/>
          <line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
      </button>
      <button 
        v-if="tab === 'history'"
        class="btn-clear"
        @click="clearHistory"
        title="清空历史"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="3 6 5 6 21 6"/>
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
        </svg>
      </button>
    </div>
    
    <div class="sidebar-content">
      <div v-if="tab === 'collections'" class="collections-list">
        <CollectionItem 
          v-for="collection in collections" 
          :key="collection.id"
          :collection="collection"
          :depth="0"
          @select-request="selectRequest"
          @edit-collection="editCollection"
          @delete-collection="deleteCollectionItem"
          @add-subfolder="addSubfolder"
          @save-request="saveRequestDialog"
        />
        <div v-if="!collections.length" class="empty-state">
          <p>暂无集合</p>
          <p class="hint">点击上方 + 创建新集合</p>
        </div>
      </div>
      
      <div v-if="tab === 'history'" class="history-list">
        <div 
          v-for="item in history" 
          :key="item.id"
          class="history-item"
          @click="loadFromHistory(item)"
        >
          <div class="history-method" :class="'method-' + item.method.toLowerCase()">{{ item.method }}</div>
          <div class="history-info">
            <div class="history-url">{{ item.url }}</div>
            <div class="history-meta">
              <span>{{ formatTime(item.timestamp) }}</span>
              <span v-if="item.status" :class="getStatusClass(item.status)">{{ item.status }}</span>
              <span v-else class="status-error">Error</span>
            </div>
          </div>
          <button class="btn-delete" @click.stop="deleteHistory(item.id)">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <div v-if="!history.length" class="empty-state">
          <p>暂无历史记录</p>
        </div>
      </div>
    </div>
    
    <div v-if="showNewCollectionDialog" class="dialog-overlay" @click.self="showNewCollectionDialog = false">
      <div class="dialog">
        <h3>新建集合</h3>
        <input 
          v-model="newCollectionName"
          type="text"
          placeholder="集合名称"
          @keydown.enter="createCollectionItem"
          autofocus
        />
        <div class="dialog-actions">
          <button class="btn-cancel" @click="showNewCollectionDialog = false">取消</button>
          <button class="btn-confirm" @click="createCollectionItem">创建</button>
        </div>
      </div>
    </div>
    
    <div v-if="showSaveDialog" class="dialog-overlay" @click.self="showSaveDialog = false">
      <div class="dialog">
        <h3>保存请求</h3>
        <input 
          v-model="saveRequestName"
          type="text"
          placeholder="请求名称"
          @keydown.enter="confirmSaveRequest"
          autofocus
        />
        <div class="dialog-actions">
          <button class="btn-cancel" @click="showSaveDialog = false">取消</button>
          <button class="btn-confirm" @click="confirmSaveRequest">保存</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { state, createCollection, deleteCollection, updateCollection, saveRequest, deleteHistoryEntry, clearHistory as clearHistoryStore, loadRequestToEditor } from '../stores/store.js'
import CollectionItem from './CollectionItem.vue'

const emit = defineEmits(['load-request'])

const tab = ref('collections')
const showNewCollectionDialog = ref(false)
const newCollectionName = ref('')
const showSaveDialog = ref(false)
const saveRequestName = ref('')
const saveTargetCollectionId = ref(null)

const collections = computed(() => state.collections)
const history = computed(() => state.history)

async function createCollectionItem() {
  if (!newCollectionName.value) return
  await createCollection(newCollectionName.value)
  newCollectionName.value = ''
  showNewCollectionDialog.value = false
}

async function deleteCollectionItem(id) {
  if (confirm('确定删除此集合及其所有内容？')) {
    await deleteCollection(id)
  }
}

function editCollection(collection) {
  const newName = prompt('集合名称', collection.name)
  if (newName && newName !== collection.name) {
    updateCollection(collection.id, { name: newName })
  }
}

function addSubfolder(parentId) {
  const name = prompt('子集合名称')
  if (name) {
    createCollection(name, parentId)
  }
}

function saveRequestDialog(collectionId) {
  saveTargetCollectionId.value = collectionId
  saveRequestName.value = state.currentRequest.name || ''
  showSaveDialog.value = true
}

async function confirmSaveRequest() {
  if (!saveRequestName.value) return
  
  const request = {
    ...state.currentRequest,
    name: saveRequestName.value
  }
  
  await saveRequest(request, saveTargetCollectionId.value)
  saveRequestName.value = ''
  showSaveDialog.value = false
}

function selectRequest(request) {
  loadRequestToEditor(request)
}

async function loadFromHistory(item) {
  try {
    const requestData = JSON.parse(item.request)
    loadRequestToEditor(requestData)
  } catch {
    console.error('Failed to parse history item')
  }
}

async function deleteHistory(id) {
  await deleteHistoryEntry(id)
}

async function clearHistory() {
  if (confirm('确定清空所有历史记录？')) {
    await clearHistoryStore()
  }
}

function formatTime(timestamp) {
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now - date
  
  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return Math.floor(diff / 60000) + '分钟前'
  if (diff < 86400000) return Math.floor(diff / 3600000) + '小时前'
  return date.toLocaleDateString()
}

function getStatusClass(status) {
  if (status >= 200 && status < 300) return 'status-success'
  if (status >= 400) return 'status-error'
  return ''
}
</script>

<style scoped>
.sidebar {
  width: 280px;
  display: flex;
  flex-direction: column;
  background: var(--color-surface-1);
  border-right: 1px solid var(--color-border);
}

.sidebar-header {
  height: 54px;
  display: flex;
  align-items: center;
  padding: 0 12px;
  gap: 8px;
  border-bottom: 1px solid var(--color-border);
}

.sidebar-tabs {
  display: flex;
  flex: 1;
  gap: 4px;
}

.tab-btn {
  height: 30px;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border: none;
  border-radius: 6px;
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

.btn-add, .btn-clear {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-add:hover, .btn-clear:hover {
  background: var(--color-surface-3);
  color: var(--color-text);
}

.sidebar-content {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.history-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  background: var(--color-surface-2);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.history-item:hover {
  background: var(--color-surface-3);
}

.history-method {
  font-family: 'JetBrains Mono', 'SF Mono', Monaco, monospace;
  font-size: 10px;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 3px;
  text-transform: uppercase;
}

.method-get { background: rgba(34, 197, 94, 0.15); color: #22c55e; }
.method-post { background: rgba(249, 115, 22, 0.15); color: #f97316; }
.method-put { background: rgba(59, 130, 246, 0.15); color: #3b82f6; }
.method-patch { background: rgba(168, 85, 247, 0.15); color: #a855f7; }
.method-delete { background: rgba(239, 68, 68, 0.15); color: #ef4444; }

.history-info {
  flex: 1;
  min-width: 0;
}

.history-url {
  font-size: 12px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.history-meta {
  display: flex;
  gap: 8px;
  font-size: 10px;
  color: var(--color-text-tertiary);
  margin-top: 2px;
}

.status-success { color: #22c55e; }
.status-error { color: #ef4444; }

.btn-delete {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border: none;
  border-radius: 4px;
  background: transparent;
  color: var(--color-text-tertiary);
  cursor: pointer;
  opacity: 0;
  transition: all 0.15s ease;
}

.history-item:hover .btn-delete {
  opacity: 1;
}

.btn-delete:hover {
  background: var(--color-danger);
  color: white;
}

.empty-state {
  text-align: center;
  padding: 32px 16px;
  color: var(--color-text-tertiary);
}

.empty-state p {
  margin: 0;
}

.empty-state .hint {
  font-size: 12px;
  margin-top: 8px;
}

.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.dialog {
  background: var(--color-surface-2);
  border-radius: 12px;
  padding: 24px;
  min-width: 320px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
}

.dialog h3 {
  margin: 0 0 16px;
  font-size: 16px;
  font-weight: 600;
}

.dialog input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  background: var(--color-surface-1);
  color: inherit;
  font-size: 14px;
  margin-bottom: 16px;
}

.dialog input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-primary-alpha);
}

.dialog-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

.btn-cancel, .btn-confirm {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-cancel {
  background: var(--color-surface-3);
  color: var(--color-text);
}

.btn-cancel:hover {
  background: var(--color-surface-1);
}

.btn-confirm {
  background: var(--color-primary);
  color: white;
}

.btn-confirm:hover {
  filter: brightness(1.1);
}
</style>
