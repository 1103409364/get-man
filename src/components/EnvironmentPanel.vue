<template>
  <div class="environment-panel">
    <div class="env-header">
      <h3>环境变量</h3>
      <div class="env-actions">
        <select v-model="selectedEnvId" @change="switchEnvironment" class="env-select">
          <option :value="null">不使用环境</option>
          <option v-for="env in environments" :key="env.id" :value="env.id">{{ env.name }}</option>
        </select>
        <button class="btn-add" @click="showNewEnvDialog = true" title="新建环境">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
        </button>
      </div>
    </div>
    
    <div v-if="activeEnvironment" class="env-content">
      <div class="env-name-edit">
        <input 
          type="text" 
          v-model="activeEnvironment.name"
          @blur="updateEnvName"
          @keydown.enter="updateEnvName"
          class="env-name-input"
        />
        <button class="btn-delete-env" @click="deleteCurrentEnv" title="删除环境">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
          </svg>
        </button>
      </div>
      
      <div class="variables-editor">
        <KeyValueEditor 
          v-model="activeEnvironment.variables"
          placeholder-key="变量名"
          placeholder-value="变量值"
        />
        <button class="btn-save-vars" @click="saveVariables">保存变量</button>
      </div>
    </div>
    
    <div v-else class="env-empty">
      <p>选择或创建一个环境</p>
      <p class="hint">使用 &#x7B;&#x7B;variable&#x7D;&#x7D; 语法在 URL、头部或请求体中引用变量</p>
    </div>
    
    <div v-if="showNewEnvDialog" class="dialog-overlay" @click.self="showNewEnvDialog = false">
      <div class="dialog">
        <h3>新建环境</h3>
        <input 
          v-model="newEnvName"
          type="text"
          placeholder="环境名称（如：开发、测试、生产）"
          @keydown.enter="createNewEnv"
          autofocus
        />
        <div class="dialog-actions">
          <button class="btn-cancel" @click="showNewEnvDialog = false">取消</button>
          <button class="btn-confirm" @click="createNewEnv">创建</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { 
  state, 
  createEnvironment, 
  updateEnvironment, 
  deleteEnvironment, 
  setActiveEnvironment,
  loadEnvironments 
} from '../stores/store.js'
import KeyValueEditor from './KeyValueEditor.vue'

const showNewEnvDialog = ref(false)
const newEnvName = ref('')
const selectedEnvId = ref(null)

const environments = computed(() => state.environments)
const activeEnvironment = computed(() => state.activeEnvironment)

watch(() => state.activeEnvironment, (env) => {
  selectedEnvId.value = env?.id || null
}, { immediate: true })

async function createNewEnv() {
  if (!newEnvName.value) return
  
  const id = await createEnvironment(newEnvName.value)
  await setActiveEnvironment(id)
  newEnvName.value = ''
  showNewEnvDialog.value = false
}

async function switchEnvironment() {
  await setActiveEnvironment(selectedEnvId.value)
}

async function updateEnvName() {
  if (!activeEnvironment.value) return
  await updateEnvironment(activeEnvironment.value.id, { 
    name: activeEnvironment.value.name 
  })
}

async function saveVariables() {
  if (!activeEnvironment.value) return
  await updateEnvironment(activeEnvironment.value.id, { 
    variables: JSON.stringify(activeEnvironment.value.variables) 
  })
}

async function deleteCurrentEnv() {
  if (!activeEnvironment.value) return
  if (!confirm('确定删除此环境？')) return
  
  await deleteEnvironment(activeEnvironment.value.id)
}
</script>

<style scoped>
.environment-panel {
  background: var(--color-surface-1);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  max-height: calc(100vh - 160px);
  display: flex;
  flex-direction: column;
}

.env-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  border-bottom: 1px solid var(--color-border);
}

.env-header h3 {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
}

.env-actions {
  display: flex;
  gap: 8px;
}

.env-select {
  border: 1px solid var(--color-border);
  border-radius: 6px;
  background: var(--color-surface-2);
  color: inherit;
  font-size: 12px;
  cursor: pointer;
}

.env-select:focus {
  outline: none;
  border-color: var(--color-primary);
}

.btn-add {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border: none;
  border-radius: 6px;
  background: var(--color-primary);
  color: white;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-add:hover {
  filter: brightness(1.1);
}

.env-content {
  padding: 12px;
  overflow-y: auto;
  flex: 1;
  min-height: 0;
}

.env-name-edit {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

.env-name-input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  background: var(--color-surface-2);
  color: inherit;
  font-size: 13px;
  font-weight: 600;
}

.env-name-input:focus {
  outline: none;
  border-color: var(--color-primary);
}

.btn-delete-env {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: var(--color-text-tertiary);
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-delete-env:hover {
  background: var(--color-danger);
  color: white;
}

.variables-editor {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.btn-save-vars {
  padding: 10px 12px;
  border: none;
  border-radius: 6px;
  background: var(--color-primary);
  color: white;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-save-vars:hover {
  filter: brightness(1.1);
}

.env-empty {
  padding: 32px 16px;
  text-align: center;
  color: var(--color-text-tertiary);
}

.env-empty p {
  margin: 0;
}

.env-empty .hint {
  font-size: 12px;
  margin-top: 8px;
  font-family: 'JetBrains Mono', 'SF Mono', Monaco, monospace;
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
  box-sizing: border-box;
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
  padding: 8px 12px;
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
