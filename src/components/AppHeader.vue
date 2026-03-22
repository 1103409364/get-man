<template>
  <header class="app-header" data-tauri-drag-region>
    <div class="header-brand" data-tauri-drag-region>
      <div class="logo">
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
        >
          <path
            d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"
          />
          <polyline points="7.5 4.21 12 6.81 16.5 4.21" />
          <polyline points="7.5 19.79 7.5 14.6 3 12" />
          <polyline points="21 12 16.5 14.6 16.5 19.79" />
          <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
          <line x1="12" y1="22.08" x2="12" y2="12" />
        </svg>
      </div>
      <h1 class="app-title">Getman</h1>
    </div>

<div class="header-actions">
    <button
      class="btn-theme"
      @click="cycleTheme"
      :title="themeTitle"
    >
      <svg
        v-if="effectiveTheme === 'dark'"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
      >
        <circle cx="12" cy="12" r="5" />
        <line x1="12" y1="1" x2="12" y2="3" />
        <line x1="12" y1="21" x2="12" y2="23" />
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
        <line x1="1" y1="12" x2="3" y2="12" />
        <line x1="21" y1="12" x2="23" y2="12" />
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
      </svg>
      <svg
        v-else
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
      >
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
      </svg>
      <span v-if="theme === 'system'" class="theme-badge">A</span>
    </button>

      <div
        class="env-indicator"
        v-if="activeEnvironment"
        :title="'当前环境: ' + activeEnvironment.name"
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="16" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
        {{ activeEnvironment.name }}
      </div>

      <div class="window-controls">
        <button
          class="btn-control btn-minimize"
          @click="minimizeWindow"
          title="最小化"
        >
          <svg width="12" height="12" viewBox="0 0 12 12">
            <rect x="2" y="5.5" width="8" height="1" fill="currentColor" />
          </svg>
        </button>
        <button
          class="btn-control btn-maximize"
          @click="toggleMaximize"
          title="最大化"
        >
          <svg width="12" height="12" viewBox="0 0 12 12">
            <rect
              x="2"
              y="2"
              width="8"
              height="8"
              fill="none"
              stroke="currentColor"
              stroke-width="1.2"
              rx="1"
            />
          </svg>
        </button>
        <button class="btn-control btn-close" @click="closeWindow" title="关闭">
          <svg width="12" height="12" viewBox="0 0 12 12">
            <path
              d="M2.5 2.5L9.5 9.5M9.5 2.5L2.5 9.5"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
            />
          </svg>
        </button>
      </div>
    </div>
  </header>
</template>

<script setup>
import { computed } from "vue";
import { state } from "../stores/store.js";
import { getCurrentWindow } from "@tauri-apps/api/window";

const appWindow = getCurrentWindow();
const theme = computed(() => state.theme);
const systemTheme = computed(() => state.systemTheme);
const activeEnvironment = computed(() => state.activeEnvironment);

const effectiveTheme = computed(() => {
  return theme.value === 'system' ? systemTheme.value : theme.value
});

const themeTitle = computed(() => {
  const labels = {
    'system': '跟随系统',
    'dark': '深色模式',
    'light': '浅色模式'
  };
  const current = labels[theme.value] || theme.value;
  const next = {
    'system': 'dark',
    'dark': 'light',
    'light': 'system'
  };
  return `当前: ${current} (点击切换到 ${labels[next[theme.value]]})`;
});

function cycleTheme() {
  const order = ['system', 'dark', 'light'];
  const currentIndex = order.indexOf(state.theme);
  state.theme = order[(currentIndex + 1) % order.length];
}

async function minimizeWindow() {
  try {
    await appWindow.minimize();
  } catch (e) {
    console.error("minimize error:", e);
  }
}

async function toggleMaximize() {
  try {
    await appWindow.toggleMaximize();
  } catch (e) {
    console.error("toggleMaximize error:", e);
  }
}

async function closeWindow() {
  try {
    await appWindow.close();
  } catch (e) {
    console.error("close error:", e);
  }
}
</script>

<style scoped>
.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 6px;
  height: 40px;
  background: var(--color-surface-2);
  border-bottom: 1px solid var(--color-border);
  user-select: none;
}

.header-brand {
  display: flex;
  align-items: center;
  gap: 6px;
}

.logo {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  color: var(--color-primary);
}

.app-title {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  background: linear-gradient(
    135deg,
    var(--color-primary),
    var(--color-primary-dark)
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.btn-theme {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 6px;
  background: var(--color-surface-3);
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all 0.15s ease;
}

.theme-badge {
  position: absolute;
  top: -2px;
  right: -2px;
  width: 12px;
  height: 12px;
  font-size: 8px;
  font-weight: 700;
  line-height: 12px;
  text-align: center;
  border-radius: 50%;
  background: var(--color-primary);
  color: white;
}

.btn-theme:hover {
  background: var(--color-surface-1);
  color: var(--color-text);
}

.env-indicator {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 5px 10px;
  background: var(--color-primary-alpha);
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  color: var(--color-primary);
}

.window-controls {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: 8px;
}

.btn-control {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 6px;
  background: var(--color-surface-3);
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-control:hover {
  background: var(--color-surface-1);
  color: var(--color-text);
}

.btn-close:hover {
  background: #ef4444;
  color: white;
}

.btn-maximize:hover {
  background: var(--color-primary-alpha);
  color: var(--color-primary);
}
</style>
