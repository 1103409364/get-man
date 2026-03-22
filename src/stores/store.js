import { reactive, watch } from "vue";
import db from "./db.js";

const HTTP_METHODS = [
  "GET",
  "POST",
  "PUT",
  "PATCH",
  "DELETE",
  "HEAD",
  "OPTIONS",
];
const BODY_TYPES = [
  "json",
  "form-data",
  "x-www-form-urlencoded",
  "raw",
  "binary",
];
const MAX_HISTORY = 100;

function getSystemTheme() {
  if (typeof window !== "undefined" && window.matchMedia) {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }
  return "dark";
}

function getInitialTheme() {
  const saved = localStorage.getItem("theme");
  if (saved) return saved;
  return "system";
}

const state = reactive({
  currentRequest: {
    id: null,
    name: "",
    method: "GET",
    url: "",
    headers: [],
    body: "",
    bodyType: "json",
    files: [],
  },
  response: null,
  loading: false,
  error: null,
  collections: [],
  history: [],
  environments: [],
  activeEnvironment: null,
  sidebarTab: "collections",
  theme: getInitialTheme(),
  systemTheme: getSystemTheme(),
});

function createDefaultEnvironment() {
  return {
    id: null,
    name: "新建环境",
    variables: [],
    isActive: false,
  };
}

function createDefaultRequest() {
  return {
    id: null,
    name: "",
    method: "GET",
    url: "",
    headers: [],
    body: "",
    bodyType: "json",
    files: [],
  };
}

async function loadCollections() {
  const collections = await db.collections.toArray();
  const requests = await db.requests.toArray();

  const buildTree = (parentId = null) => {
    return collections
      .filter((c) => c.parentId === parentId)
      .sort((a, b) => (a.order || 0) - (b.order || 0))
      .map((collection) => ({
        ...collection,
        children: buildTree(collection.id),
        requests: requests
          .filter((r) => r.collectionId === collection.id)
          .sort((a, b) => (a.order || 0) - (b.order || 0)),
      }));
  };

  state.collections = buildTree();
}

async function loadHistory() {
  const history = await db.history
    .orderBy("timestamp")
    .reverse()
    .limit(MAX_HISTORY)
    .toArray();
  state.history = history;
}

async function loadEnvironments() {
  const environments = await db.environments.toArray();
  state.environments = environments;
  state.activeEnvironment = environments.find((e) => e.isActive) || null;
}

async function addHistoryEntry(entry) {
  const count = await db.history.count();
  if (count >= MAX_HISTORY) {
    const oldest = await db.history
      .orderBy("timestamp")
      .limit(count - MAX_HISTORY + 1)
      .toArray();
    await Promise.all(oldest.map((h) => db.history.delete(h.id)));
  }

  const id = await db.history.add({
    ...entry,
    timestamp: Date.now(),
  });

  await loadHistory();
  return id;
}

async function clearHistory() {
  await db.history.clear();
  state.history = [];
}

async function deleteHistoryEntry(id) {
  await db.history.delete(id);
  await loadHistory();
}

async function createCollection(name, parentId = null) {
  const siblings = parentId
    ? await db.collections.where("parentId").equals(parentId).toArray()
    : await db.collections.filter((c) => c.parentId === null).toArray();
  const maxOrder =
    siblings.length > 0 ? Math.max(...siblings.map((s) => s.order || 0)) : -1;

  const id = await db.collections.add({
    name,
    parentId,
    order: maxOrder + 1,
  });

  await loadCollections();
  return id;
}

async function updateCollection(id, data) {
  await db.collections.update(id, data);
  await loadCollections();
}

async function deleteCollection(id) {
  const children = await db.collections
    .filter((c) => c.parentId === id)
    .toArray();
  const requests = await db.requests.where("collectionId").equals(id).toArray();

  for (const child of children) {
    await deleteCollection(child.id);
  }

  for (const request of requests) {
    await db.requests.delete(request.id);
  }

  await db.collections.delete(id);
  await loadCollections();
}

async function saveRequest(request, collectionId) {
  const siblings = await db.requests
    .where("collectionId")
    .equals(collectionId)
    .toArray();
  const maxOrder =
    siblings.length > 0 ? Math.max(...siblings.map((s) => s.order || 0)) : -1;

  const id = await db.requests.add({
    name: request.name || "Untitled Request",
    collectionId,
    method: request.method,
    url: request.url,
    headers: JSON.stringify(request.headers),
    body: request.body,
    bodyType: request.bodyType,
    order: maxOrder + 1,
  });

  await loadCollections();
  return id;
}

async function updateRequest(id, data) {
  await db.requests.update(id, data);
  await loadCollections();
}

async function deleteRequest(id) {
  await db.requests.delete(id);
  await loadCollections();
}

async function loadRequestToEditor(request) {
  state.currentRequest = {
    ...request,
    headers:
      typeof request.headers === "string"
        ? JSON.parse(request.headers)
        : request.headers,
    files: request.files || [],
  };
}

async function createEnvironment(name) {
  const id = await db.environments.add({
    name,
    variables: JSON.stringify([]),
    isActive: false,
  });
  await loadEnvironments();
  return id;
}

async function updateEnvironment(id, data) {
  await db.environments.update(id, data);
  await loadEnvironments();
}

async function deleteEnvironment(id) {
  await db.environments.delete(id);
  await loadEnvironments();
}

async function setActiveEnvironment(id) {
  await db.environments.toCollection().modify({ isActive: false });
  if (id) {
    await db.environments.update(id, { isActive: true });
  }
  await loadEnvironments();
}

function substituteVariables(text) {
  if (!text || !state.activeEnvironment) return text;

  let result = text;
  const variables = state.activeEnvironment.variables || [];

  for (const variable of variables) {
    const regex = new RegExp(`\\{\\{${variable.key}\\}\\}`, "g");
    result = result.replace(regex, variable.value || "");
  }

  return result;
}

function getEffectiveTheme() {
  if (state.theme === "system") {
    return state.systemTheme;
  }
  return state.theme;
}

watch(
  () => state.theme,
  (newTheme) => {
    localStorage.setItem("theme", newTheme);
    document.documentElement.setAttribute("data-theme", getEffectiveTheme());
  },
  { immediate: true },
);

watch(
  () => state.systemTheme,
  () => {
    if (state.theme === "system") {
      document.documentElement.setAttribute("data-theme", state.systemTheme);
    }
  },
);

function initThemeListener() {
  if (typeof window !== "undefined" && window.matchMedia) {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e) => {
      state.systemTheme = e.matches ? "dark" : "light";
    };
    handler(mediaQuery);
    mediaQuery.removeEventListener("change", handler);
    // 可能存在兼容性问题，部分浏览器无法触发 "change" 事件
    mediaQuery.addEventListener("change", handler);
  }
}

async function initStore() {
  initThemeListener();
  await Promise.all([loadCollections(), loadHistory(), loadEnvironments()]);
}

export {
  state,
  HTTP_METHODS,
  BODY_TYPES,
  MAX_HISTORY,
  createDefaultRequest,
  createDefaultEnvironment,
  initStore,
  initThemeListener,
  loadCollections,
  loadHistory,
  loadEnvironments,
  addHistoryEntry,
  clearHistory,
  deleteHistoryEntry,
  createCollection,
  updateCollection,
  deleteCollection,
  saveRequest,
  updateRequest,
  deleteRequest,
  loadRequestToEditor,
  createEnvironment,
  updateEnvironment,
  deleteEnvironment,
  setActiveEnvironment,
  substituteVariables,
};
