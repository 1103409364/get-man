<script setup>
import { onMounted, ref, computed } from "vue";
import { state, initStore } from "./stores/store.js";
import AppHeader from "./components/AppHeader.vue";
import Sidebar from "./components/Sidebar.vue";
import RequestEditor from "./components/RequestEditor.vue";
import ResponseViewer from "./components/ResponseViewer.vue";
import EnvironmentPanel from "./components/EnvironmentPanel.vue";

const showEnvPanel = ref(false);

const response = computed(() => state.response);
const error = computed(() => state.error);
const loading = computed(() => state.loading);

onMounted(async () => {
  await initStore();
});
</script>

<template>
  <div class="app-container" :data-theme="state.theme">
    <AppHeader />
    <main class="app-main">
      <Sidebar />
      <div class="main-content">
        <div class="request-response-panels">
          <div class="panel request-panel">
            <RequestEditor />
          </div>
          <div class="panel response-panel">
            <div v-if="loading" class="loading-state">
              <div class="spinner"></div>
              <p>发送请求中...</p>
            </div>
            <div v-else-if="error" class="error-state">
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.5"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
              </svg>
              <p>{{ error }}</p>
            </div>
            <ResponseViewer v-else-if="response" :response="response" />
            <div v-else class="empty-state">
              <svg
                width="64"
                height="64"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1"
              >
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
              <p>发送请求查看响应</p>
              <p class="hint">输入 URL 并点击发送按钮</p>
            </div>
          </div>
        </div>
        <div class="floating-buttons">
          <button
            class="btn-float"
            :class="{ active: showEnvPanel }"
            @click="showEnvPanel = !showEnvPanel"
            title="环境变量"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <circle cx="12" cy="12" r="3" />
              <path
                d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"
              />
            </svg>
            环境变量
          </button>
        </div>
        <transition name="slide">
          <div v-if="showEnvPanel" class="panel-container">
            <EnvironmentPanel />
          </div>
        </transition>
      </div>
    </main>
  </div>
</template>

<style scoped>
.app-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: var(--color-bg);
  /* border-radius: 12px; */
  overflow: hidden;
}

.app-main {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
}

.request-response-panels {
  flex: 1;
  display: flex;
  flex-direction: column;

  overflow: hidden;
}

@media (min-width: 1024px) {
  .request-response-panels {
    flex-direction: row;
  }
}

.panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.request-panel {
  min-height: 300px;
}

@media (min-width: 1024px) {
  .request-panel {
    min-height: auto;
  }
}

.response-panel {
  min-height: 200px;
}

@media (min-width: 1024px) {
  .response-panel {
    min-height: auto;
  }
}

.loading-state,
.error-state,
.empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  color: var(--color-text-tertiary);
  background: var(--color-surface-1);
  padding: 32px;
}

.loading-state p,
.error-state p,
.empty-state p {
  margin: 0;
}

.empty-state .hint {
  font-size: 12px;
  opacity: 0.7;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--color-border);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.error-state svg {
  color: var(--color-danger);
}

.error-state p {
  color: var(--color-danger);
  font-weight: 500;
}

.floating-buttons {
  position: absolute;
  bottom: 20px;
  right: 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  z-index: 100;
}

.btn-float {
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border: none;
  border-radius: 8px;
  background: var(--color-surface-2);
  color: var(--color-text-secondary);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: all 0.2s ease;
}

.btn-float:hover {
  background: var(--color-surface-3);
  color: var(--color-text);
}

.btn-float.active {
  background: var(--color-primary);
  color: white;
}

.btn-float .indicator {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 8px;
  height: 8px;
  background: #22c55e;
  border-radius: 50%;
}

.panel-container {
  position: absolute;
  bottom: 70px;
  right: 20px;
  /* width: 400px; */
  max-height: calc(100vh - 140px);
  overflow: visible;
  z-index: 100;
}

@media (max-width: 768px) {
  .panel-container {
    width: calc(100% - 40px);
    left: 20px;
    right: 20px;
  }
}

.slide-enter-active,
.slide-leave-active {
  transition: all 0.25s ease;
}

.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>
