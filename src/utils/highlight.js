export default {
  async mounted(el, binding) {
    const modules = await import("highlight.js");
    const hljs = modules.default;

    const value = binding.value || el.textContent;

    if (binding.arg === "json") {
      el.innerHTML = hljs.highlight(value, { language: "json" }).value;
    } else if (binding.arg === "xml") {
      el.innerHTML = hljs.highlight(value, { language: "xml" }).value;
    } else if (binding.arg === "html") {
      el.innerHTML = hljs.highlight(value, { language: "html" }).value;
    } else {
      el.innerHTML = hljs.highlightAuto(value).value;
    }
  },

  updated(el, binding) {
    if (binding.value !== binding.oldValue) {
      this.mounted(el, binding);
    }
  },
};
