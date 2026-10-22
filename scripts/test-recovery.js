"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");
const { DatabaseSync } = require("node:sqlite");

const fixture = path.join(__dirname, "..", ".test-fixture");
const statePath = path.join(fixture, ".codex-global-state.json");
const script = path.join(__dirname, "recover-projects.js");
fs.mkdirSync(fixture, { recursive: true });
try {
  fs.writeFileSync(statePath, JSON.stringify({ "local-projects": {}, retained: "yes" }));
  const db = new DatabaseSync(path.join(fixture, "state_5.sqlite"));
  db.exec(`CREATE TABLE projects (id TEXT, name TEXT, position INTEGER, created_at_ms INTEGER, updated_at_ms INTEGER);
           CREATE TABLE project_roots (project_id TEXT, position INTEGER, path TEXT);
           INSERT INTO projects VALUES ('one','Example',0,100,200);
           INSERT INTO project_roots VALUES ('one',0,'C:\\example');`);
  db.close();
  const run = (...args) => spawnSync(process.execPath,
    ["--experimental-sqlite", script, "--codex-home", fixture, ...args], { encoding: "utf8" });
  const diagnosis = run();
  assert.equal(diagnosis.status, 0, diagnosis.stderr);
  assert.equal(JSON.parse(diagnosis.stdout).databaseProjects, 1);
  const repair = run("--apply");
  assert.equal(repair.status, 0, repair.stderr);
  const report = JSON.parse(repair.stdout);
  assert.equal(report.restoredProjects, 1);
  assert.equal(fs.existsSync(report.backupPath), true);
  const state = JSON.parse(fs.readFileSync(statePath, "utf8"));
  assert.equal(state.retained, "yes");
  assert.deepEqual(state["project-order"], ["one"]);
  assert.deepEqual(state["local-projects"].one.rootPaths, ["C:\\example"]);
  const repeat = run("--apply");
  assert.notEqual(repeat.status, 0, "repeat repair should refuse nonempty cache");
  console.log("PASS: read-only diagnosis, repair, backup, preservation, repeat-write guard");
} finally {
  fs.rmSync(fixture, { recursive: true, force: true });
}
