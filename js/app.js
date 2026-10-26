(() => {
  const { $, $$, copy, download, store, esc, debounce } = Prism;
  let picked = store.get("gi:picked", ["Node", "Vite", "Env & secrets", "Logs", "macOS", "VS Code"]);
  const groups = {};
  for (const [n, t] of Object.entries(Core.TEMPLATES)) (groups[t.group] ||= []).push(n);
  function list() {
    const q = $("#search").value.toLowerCase();
    $("#groups").innerHTML = Object.entries(groups).map(([g, names]) => {
      const f = names.filter((n) => n.toLowerCase().includes(q)); if (!f.length) return "";
      return `<div class="grp"><h3>${g}</h3><div class="tpls">${f.map((n) => `<button class="tpl ${picked.includes(n) ? "on" : ""}" data-n="${esc(n)}">${esc(n)}</button>`).join("")}</div></div>`;
    }).join("") || '<div class="empty">No template matches</div>';
  }
  function render() {
    store.set("gi:picked", picked); store.set("gi:custom", $("#custom").value);
    const txt = Core.build(picked, $("#custom").value, { comments: $("#comments").checked });
    $("#out").innerHTML = txt.split("\n").map((l) => `<span class="${l.startsWith("#") ? "c" : l.startsWith("!") ? "n" : ""}">${esc(l)}</span>`).join("\n");
    $("#sel").innerHTML = picked.map((n) => `<span class="pill acc">${esc(n)}</span>`).join("");
    $("#count").textContent = `${txt.split("\n").filter((l) => l && !l.startsWith("#")).length} rules`;
    verdict();
  }
  function verdict() {
    const p = $("#path").value.trim(); if (!p) { $("#verdict").innerHTML = '<span class="muted small">Type a path to test it against the rules above.</span>'; return; }
    const r = Core.check(Core.build(picked, $("#custom").value), p);
    $("#verdict").innerHTML = r.ignored ? `<b class="y">Ignored</b> by rule <code>${esc(r.by)}</code>` : `<b class="n">Tracked</b>${r.by ? ` (re-included by <code>${esc(r.by)}</code>)` : " — no rule matches"}`;
  }
  $("#groups").onclick = (e) => { const b = e.target.closest(".tpl"); if (!b) return; const n = b.dataset.n; picked = picked.includes(n) ? picked.filter((x) => x !== n) : [...picked, n]; b.classList.toggle("on"); render(); };
  $("#search").addEventListener("input", list);
  $("#custom").addEventListener("input", debounce(render, 150));
  $("#comments").addEventListener("change", render);
  $("#path").addEventListener("input", debounce(verdict, 100));
  $("#copy").onclick = () => copy(Core.build(picked, $("#custom").value, { comments: $("#comments").checked }));
  $("#dl").onclick = () => download(".gitignore", Core.build(picked, $("#custom").value, { comments: $("#comments").checked }));
  $("#custom").value = store.get("gi:custom", "");
  $("#path").value = "src/.env.local";
  list(); render();
})();
