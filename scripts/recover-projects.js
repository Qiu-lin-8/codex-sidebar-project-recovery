"use strict";

const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { DatabaseSync } = require("node:sqlite");

function fail(message) {
  throw new Error(message);
}

const args = process.argv.slice(2);
let apply = false;
let codexHome = process.env.CODEX_HOME || path.join(os.homedir(), ".codex");
for (let index = 0; index < args.length; index += 1) {
  if (args[index] === "--apply") apply = true;
  else if (args[index] === "--codex-home" && args[index + 1]) codexHome = args[++index];
  else fail(`Unknown or incomplete argument: ${args[index]}`);
}

const statePath = path.join(codexHome, ".codex-global-state.json");
if (!fs.existsSync(statePath)) fail(`State file not found: ${statePath}`);
const state = JSON.parse(fs.readFileSync(statePath, "utf8"));
const cache = state["local-projects"];
if (cache != null && (typeof cache !== "object" || Array.isArray(cache))) {
  fail("Unexpected local-projects format; refusing to continue");
}
const cacheCount = Object.keys(cache || {}).length;

const databases = fs.readdirSync(codexHome)
  .filter((name) => /^state_\d+\.sqlite$/.test(name))
  .sort((a, b) => Number(b.match(/\d+/)[0]) - Number(a.match(/\d+/)[0]));
let selected;
for (const name of databases) {
  const dbPath = path.join(codexHome, name);
  const db = new DatabaseSync(dbPath, { readOnly: true });
  try {
    const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name IN ('projects','project_roots')").all();
    if (tables.length === 2) { selected = dbPath; break; }
  } finally { db.close(); }
}
if (!selected) fail("No state_*.sqlite database with projects and project_roots tables found");

const db = new DatabaseSync(selected, { readOnly: true });
let rows;
try {
  const integrity = db.prepare("PRAGMA integrity_check").get().integrity_check;
  if (integrity !== "ok") fail(`Database integrity check failed: ${integrity}`);
  rows = db.prepare(`SELECT p.id, p.name, p.position, p.created_at_ms, p.updated_at_ms,
                            r.position AS root_position, r.path
                       FROM projects p LEFT JOIN project_roots r ON r.project_id = p.id
                      ORDER BY p.position, r.position`).all();
} finally { db.close(); }

const projects = {};
const order = [];
for (const row of rows) {
  if (!projects[row.id]) {
    projects[row.id] = {
      id: row.id, name: row.name, rootPaths: [],
      createdAt: row.created_at_ms, updatedAt: row.updated_at_ms,
    };
    order.push(row.id);
  }
  if (row.path != null) projects[row.id].rootPaths.push(row.path);
}
const report = { database: selected, databaseProjects: order.length, cacheProjects: cacheCount,
  missingRootPaths: Object.values(projects).filter((project) => project.rootPaths.length === 0).length };
if (!apply) {
  console.log(JSON.stringify({ mode: "diagnose", ...report }, null, 2));
  process.exit(0);
}
if (process.platform !== "win32") fail("Apply mode is limited to Windows");
if (order.length === 0) fail("Database has no projects; refusing to write");
if (cacheCount !== 0) fail("local-projects is not empty; refusing to overwrite it");
if (report.missingRootPaths !== 0) fail("At least one project has no root path; refusing to write");

const stamp = new Date().toISOString().replace(/[:.]/g, "-");
const backupPath = `${statePath}.backup-${stamp}`;
fs.copyFileSync(statePath, backupPath, fs.constants.COPYFILE_EXCL);
state["local-projects"] = projects;
state["project-order"] = order;
const tempPath = `${statePath}.repair-${process.pid}.tmp`;
try {
  fs.writeFileSync(tempPath, JSON.stringify(state), { encoding: "utf8", flag: "wx" });
  fs.renameSync(tempPath, statePath);
} finally {
  if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
}
const verified = JSON.parse(fs.readFileSync(statePath, "utf8"));
if (Object.keys(verified["local-projects"] || {}).length !== order.length) {
  fail("Written cache verification failed; restore from backup before reopening Codex");
}
console.log(JSON.stringify({ mode: "repaired", ...report, restoredProjects: order.length, backupPath }, null, 2));
