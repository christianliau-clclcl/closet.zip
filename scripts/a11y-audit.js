// Accessibility check (Milestone 18a, 2026-10-06). Not part of the app and
// not a library: paste it into the browser console (or the browser pane's
// JavaScript tool) on any page or open panel. It returns a list of problems;
// an empty list means the page passed. It checks images without alt text,
// buttons and links without a name, fields without a label, duplicate IDs,
// one main heading per page, positive tabindex, and text contrast (4.5:1,
// or 3:1 for large text) against the first solid background behind it.
// Keyboard focus and Reduce motion still need checking by hand.
(() => {
  const visible = (el) => {
    const r = el.getBoundingClientRect();
    const s = getComputedStyle(el);
    return r.width > 0 && r.height > 0 && s.visibility !== "hidden" && s.display !== "none" && !el.closest("[aria-hidden=true]");
  };
  const describe = (el) =>
    `${el.tagName.toLowerCase()}${el.id ? "#" + el.id : ""} "${(el.textContent || "").trim().slice(0, 40)}"`;
  const nameOf = (el) => {
    const label = el.getAttribute("aria-label");
    if (label && label.trim()) return label.trim();
    const by = el.getAttribute("aria-labelledby");
    if (by) return by.split(" ").map((id) => document.getElementById(id)?.textContent || "").join(" ").trim();
    const text = (el.textContent || "").trim();
    if (text) return text;
    const img = el.querySelector("img[alt]");
    return img ? img.getAttribute("alt").trim() : "";
  };
  const problems = [];

  // Images: every <img> needs alt (empty is fine for decoration).
  for (const img of document.querySelectorAll("img")) {
    if (!img.hasAttribute("alt")) problems.push(`image without alt: ${img.src.slice(0, 60)}`);
  }

  // Buttons and links need a name.
  for (const el of document.querySelectorAll("button, a[href], [role=button]")) {
    if (!el.closest("[aria-hidden=true]") && !nameOf(el)) problems.push(`no accessible name: ${describe(el)}`);
  }

  // Form fields need a label.
  for (const el of document.querySelectorAll("input:not([type=hidden]), textarea, select")) {
    const labelled =
      el.getAttribute("aria-label") ||
      el.getAttribute("aria-labelledby") ||
      (el.id && document.querySelector(`label[for="${CSS.escape(el.id)}"]`)) ||
      el.closest("label");
    if (!labelled) problems.push(`field without label: ${el.outerHTML.slice(0, 80)}`);
  }

  // Duplicate IDs break labels and aria references.
  const ids = new Map();
  for (const el of document.querySelectorAll("[id]")) ids.set(el.id, (ids.get(el.id) || 0) + 1);
  for (const [id, n] of ids) if (n > 1) problems.push(`duplicate id: ${id} ×${n}`);

  // One main heading per page (dialogs aside).
  const h1s = [...document.querySelectorAll("h1")].filter((h) => !h.closest("dialog"));
  if (h1s.length !== 1) problems.push(`h1 count: ${h1s.length} (${h1s.map((h) => h.textContent.trim()).join(" / ")})`);

  // Positive tabindex scrambles keyboard order.
  for (const el of document.querySelectorAll("[tabindex]")) {
    if (Number(el.getAttribute("tabindex")) > 0) problems.push(`positive tabindex: ${describe(el)}`);
  }

  // Text contrast: each element with its own visible text, against the first
  // solid background behind it. 4.5:1 for normal text, 3:1 from 24px (or 18.66px bold).
  const rgb = (c) => (c.match(/[\d.]+/g) || []).map(Number);
  const lum = ([r, g, b]) =>
    [r, g, b]
      .map((v) => v / 255)
      .map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4))
      .reduce((sum, v, i) => sum + v * [0.2126, 0.7152, 0.0722][i], 0);
  const background = (el) => {
    for (let node = el; node; node = node.parentElement) {
      const c = rgb(getComputedStyle(node).backgroundColor);
      if (c.length >= 3 && (c[3] === undefined || c[3] > 0.5)) return c;
    }
    return [247, 245, 243]; // the canvas
  };
  const seen = new Set();
  for (const el of document.querySelectorAll("body *")) {
    const ownText = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
    if (!ownText || !visible(el) || el.closest("[disabled], :disabled")) continue;
    const s = getComputedStyle(el);
    let fg = rgb(s.color);
    const bg = background(el);
    if (fg[3] !== undefined && fg[3] < 1) fg = fg.slice(0, 3).map((v, i) => v * fg[3] + bg[i] * (1 - fg[3]));
    const [a, b] = [lum(fg), lum(bg)].sort((x, y) => y - x);
    const ratio = (a + 0.05) / (b + 0.05);
    const size = parseFloat(s.fontSize);
    const large = size >= 24 || (size >= 18.66 && Number(s.fontWeight) >= 700);
    const need = large ? 3 : 4.5;
    const key = `${s.color} on ${bg.join(",")}`;
    if (ratio < need && !seen.has(key)) {
      seen.add(key);
      problems.push(`contrast ${ratio.toFixed(2)}:1 (needs ${need}): ${describe(el)} — ${key}`);
    }
  }
  return problems;
})();
