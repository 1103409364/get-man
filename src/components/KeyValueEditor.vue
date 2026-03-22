<template>
  <div class="key-value-editor">
    <div class="editor-header">
      <span class="col-key">Key</span>
      <span class="col-value">Value</span>
      <span class="col-actions"></span>
    </div>
    <div class="editor-rows">
      <div
        v-for="(item, index) in modelValue"
        :key="index"
        class="editor-row"
        :class="{ disabled: item.enabled === false }"
      >
        <input
          type="text"
          :value="item.key"
          @input="updateItem(index, 'key', $event.target.value)"
          :placeholder="placeholderKey"
          class="input-key"
        />
        <input
          type="text"
          :value="item.value"
          @input="updateItem(index, 'value', $event.target.value)"
          :placeholder="placeholderValue"
          class="input-value"
        />
        <div class="row-actions">
          <button
            class="btn-icon"
            :class="{ active: item.enabled !== false }"
            @click="toggleEnabled(index)"
            :title="item.enabled !== false ? '禁用' : '启用'"
          >
            <svg
              v-if="item.enabled !== false"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            <svg
              v-else
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"
              />
              <line x1="1" y1="1" x2="23" y2="23" />
            </svg>
          </button>
          <button
            class="btn-icon btn-danger"
            @click="removeItem(index)"
            title="删除"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      </div>
      <div class="editor-row editor-row-new">
        <input
          type="text"
          v-model="newKey"
          :placeholder="placeholderKey"
          class="input-key"
          @keydown.enter="addItem"
        />
        <input
          type="text"
          v-model="newValue"
          :placeholder="placeholderValue"
          class="input-value"
          @keydown.enter="addItem"
        />
        <div class="row-actions">
          <button
            class="btn-icon btn-add"
            @click="addItem"
            :disabled="!newKey"
            title="添加"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";

const props = defineProps({
  modelValue: { type: Array, default: () => [] },
  placeholderKey: { type: String, default: "Key" },
  placeholderValue: { type: String, default: "Value" },
});

const emit = defineEmits(["update:modelValue"]);

const newKey = ref("");
const newValue = ref("");

function updateItem(index, field, value) {
  const updated = [...props.modelValue];
  updated[index] = { ...updated[index], [field]: value };
  emit("update:modelValue", updated);
}

function removeItem(index) {
  const updated = props.modelValue.filter((_, i) => i !== index);
  emit("update:modelValue", updated);
}

function toggleEnabled(index) {
  const updated = [...props.modelValue];
  updated[index] = {
    ...updated[index],
    enabled: updated[index].enabled === false ? true : false,
  };
  emit("update:modelValue", updated);
}

function addItem() {
  if (!newKey.value) return;

  const updated = [
    ...props.modelValue,
    {
      key: newKey.value,
      value: newValue.value,
      enabled: true,
    },
  ];
  emit("update:modelValue", updated);
  newKey.value = "";
  newValue.value = "";
}
</script>

<style scoped>
.key-value-editor {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.editor-header {
  display: grid;
  grid-template-columns: 1fr 1fr 60px;
  gap: 8px;
  padding: 0 4px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--color-text-secondary);
}

.editor-rows {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.editor-row {
  display: grid;
  grid-template-columns: 1fr 1fr 60px;
  gap: 8px;
  align-items: center;
}

.editor-row.disabled {
  opacity: 0.4;
}

.editor-row.disabled input {
  text-decoration: line-through;
}

input {
  background: var(--color-surface-2);
  border: 1px solid var(--color-border);
  border-radius: 4px;
  padding: 6px 10px;
  font-size: 13px;
  font-family: "JetBrains Mono", "SF Mono", Monaco, monospace;
  color: inherit;
  transition: all 0.2s ease;
}

input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 2px var(--color-primary-alpha);
}

input::placeholder {
  color: var(--color-text-tertiary);
}

.row-actions {
  display: flex;
  gap: 4px;
  justify-content: flex-end;
}

.btn-icon {
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

.btn-icon:hover {
  background: var(--color-surface-3);
  color: var(--color-text);
}

.btn-icon.active {
  color: var(--color-primary);
}

.btn-icon.btn-danger:hover {
  color: var(--color-danger);
}

.btn-icon.btn-add:hover:not(:disabled) {
  color: var(--color-success);
}

.btn-icon:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}
</style>
