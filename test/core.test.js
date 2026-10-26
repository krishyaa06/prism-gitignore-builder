const test = require("node:test");
const assert = require("node:assert/strict");
const C = require("../js/core.js");

test("build merges and dedupes", () => {
  const g = C.build(["Vite", "Astro"], "uploads/\ndist/");
  assert.equal(g.split("\n").filter((l) => l === "dist/").length, 1);
  assert.match(g, /# ── Custom ──\nuploads\//);
});
test("no comments mode", () => {
  assert.ok(!C.build(["macOS"], "", { comments: false }).includes("#"));
});
test("pattern matching", () => {
  const rules = C.build(["Node", "Env & secrets", "VS Code"]);
  assert.equal(C.check(rules, "node_modules/react/index.js").ignored, true);
  assert.equal(C.check(rules, "packages/a/node_modules/x.js").ignored, true);
  assert.equal(C.check(rules, ".env.local").ignored, true);
  assert.equal(C.check(rules, ".env.example").ignored, false);
  assert.equal(C.check(rules, ".vscode/settings.json").ignored, false);
  assert.equal(C.check(rules, ".vscode/launch.json").ignored, true);
  assert.equal(C.check(rules, "src/index.js").ignored, false);
});
test("anchored and globstar", () => {
  assert.equal(C.check("/build\n", "build/x").ignored, true);
  assert.equal(C.check("/build\n", "src/build/x").ignored, false);
  assert.equal(C.check("**/*.rs.bk\n", "a/b/c.rs.bk").ignored, true);
  assert.equal(C.check("*.py[cod]\n", "x/y.pyc").ignored, true);
});
test("every template has rules", () => {
  for (const [n, t] of Object.entries(C.TEMPLATES)) assert.ok(t.rules.length > 0, n);
});
