<template>
  <div class="collection-item" :style="{ paddingLeft: depth * 16 + 12 + 'px' }">
    <div class="collection-header" :class="{ expanded: isExpanded }">
      <button class="btn-expand" @click="isExpanded = !isExpanded">
        <svg 
          width="12" 
          height="12" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          stroke-width="2"
          :style="{ transform: isExpanded ? 'rotate(90deg)' : '' }"
        >
          <polyline points="9 18 15 12 9 6"/>
        </svg>
      </button>
      <div class="collection-icon">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
        </svg>
      </div>
      <span class="collection-name">{{ collection.name }}</span>
      <div class="collection-actions">
        <button class="btn-action" @click.stop="$emit('add-subfolder', collection.id)" title="添加子集合">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
            <line x1="12" y1="11" x2="12" y2="17"/>
            <line x1="9" y1="14" x2="15" y2="14"/>
          </svg>
        </button>
        <button class="btn-action" @click.stop="$emit('save-request', collection.id)" title="保存请求到此">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
        </button>
        <button class="btn-action btn-danger" @click.stop="$emit('edit-collection', collection)" title="编辑">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
        </button>
        <button class="btn-action btn-danger" @click.stop="$emit('delete-collection', collection.id)" title="删除">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
          </svg>
        </button>
      </div>
    </div>
    
    <div v-if="isExpanded" class="collection-children">
      <CollectionItem
        v-for="child in collection.children"
        :key="child.id"
        :collection="child"
        :depth="depth + 1"
        @select-request="$emit('select-request', $event)"
        @edit-collection="$emit('edit-collection', $event)"
        @delete-collection="$emit('delete-collection', $event)"
        @add-subfolder="$emit('add-subfolder', $event)"
        @save-request="$emit('save-request', $event)"
      />
      
      <div 
        v-for="request in collection.requests" 
        :key="request.id"
        class="request-item"
        :style="{ paddingLeft: (depth + 1) * 16 + 12 + 'px' }"
        @click="$emit('select-request', request)"
      >
        <div class="request-method" :class="'method-' + request.method.toLowerCase()">{{ request.method }}</div>
        <span class="request-name">{{ request.name || 'Untitled' }}</span>
        <button class="btn-request-delete" @click.stop="deleteRequestItem(request.id)">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { deleteRequest } from '../stores/store.js'

const props = defineProps({
  collection: { type: Object, required: true },
  depth: { type: Number, default: 0 }
})

defineEmits(['select-request', 'edit-collection', 'delete-collection', 'add-subfolder', 'save-request'])

const isExpanded = ref(true)

async function deleteRequestItem(id) {
  if (confirm('确定删除此请求？')) {
    await deleteRequest(id)
  }
}
</script>

<style scoped>
.collection-item {
  user-select: none;
}

.collection-header {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 8px;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.15s ease;
}

.collection-header:hover {
  background: var(--color-surface-3);
}

.btn-expand {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border: none;
  border-radius: 3px;
  background: transparent;
  color: var(--color-text-tertiary);
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-expand svg {
  transition: transform 0.15s ease;
}

.collection-icon {
  color: var(--color-text-secondary);
}

.collection-name {
  flex: 1;
  font-size: 13px;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.collection-actions {
  display: flex;
  gap: 2px;
  opacity: 0;
  transition: opacity 0.15s ease;
}

.collection-header:hover .collection-actions {
  opacity: 1;
}

.btn-action {
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
  transition: all 0.15s ease;
}

.btn-action:hover {
  background: var(--color-surface-2);
  color: var(--color-text);
}

.btn-action.btn-danger:hover {
  color: var(--color-danger);
}

.collection-children {
  margin-top: 4px;
}

.request-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.15s ease;
}

.request-item:hover {
  background: var(--color-surface-3);
}

.request-method {
  font-family: 'JetBrains Mono', 'SF Mono', Monaco, monospace;
  font-size: 9px;
  font-weight: 700;
  padding: 2px 5px;
  border-radius: 3px;
  text-transform: uppercase;
}

.method-get { background: rgba(34, 197, 94, 0.15); color: #22c55e; }
.method-post { background: rgba(249, 115, 22, 0.15); color: #f97316; }
.method-put { background: rgba(59, 130, 246, 0.15); color: #3b82f6; }
.method-patch { background: rgba(168, 85, 247, 0.15); color: #a855f7; }
.method-delete { background: rgba(239, 68, 68, 0.15); color: #ef4444; }
.method-head, .method-options { background: rgba(34, 197, 94, 0.15); color: #22c55e; }

.request-name {
  flex: 1;
  font-size: 12px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.btn-request-delete {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border: none;
  border-radius: 3px;
  background: transparent;
  color: var(--color-text-tertiary);
  cursor: pointer;
  opacity: 0;
  transition: all 0.15s ease;
}

.request-item:hover .btn-request-delete {
  opacity: 1;
}

.btn-request-delete:hover {
  background: var(--color-danger);
  color: white;
}
</style>
