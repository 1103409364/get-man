<template>
  <div class="method-select" :class="{ focused: isFocused }">
    <select
      :value="modelValue"
      @input="$emit('update:modelValue', $event.target.value)"
      @focus="isFocused = true"
      @blur="isFocused = false"
      :class="methodClass"
    >
      <option v-for="method in methods" :key="method" :value="method">
        {{ method }}
      </option>
    </select>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";

const props = defineProps({
  modelValue: { type: String, default: "GET" },
  methods: {
    type: Array,
    default: () => ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"],
  },
});

defineEmits(["update:modelValue"]);

const isFocused = ref(false);

const methodClass = computed(() => {
  const method = props.modelValue.toLowerCase();
  return {
    "method-get": method === "get",
    "method-post": method === "post",
    "method-put": method === "put",
    "method-patch": method === "patch",
    "method-delete": method === "delete",
    "method-head": method === "head",
    "method-options": method === "options",
  };
});
</script>

<style scoped>
.method-select {
  position: relative;
}

.method-select select {
  height: 30px;
  appearance: none;
  background: var(--color-surface-2);
  border: 1px solid var(--color-border);
  border-radius: 6px;
  padding: 0 32px 0 12px;
  font-size: 13px;
  font-weight: 600;
  font-family: "JetBrains Mono", "SF Mono", Monaco, monospace;
  cursor: pointer;
  color: inherit;
  transition: all 0.2s ease;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23888' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 10px center;
}

.method-select select:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-primary-alpha);
}

.method-get {
  color: var(--color-method-get);
}
.method-post {
  color: var(--color-method-post);
}
.method-put {
  color: var(--color-method-put);
}
.method-patch {
  color: var(--color-method-patch);
}
.method-delete {
  color: var(--color-method-delete);
}
.method-head {
  color: var(--color-method-get);
}
.method-options {
  color: var(--color-method-get);
}
</style>
