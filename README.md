# Codex sidebar project recovery

A guarded Windows skill for the case where Codex desktop shows **Projects → No projects**, although local SQLite still contains the projects. Based on a real recovery; not a universal fix.

## Install

Copy this repository folder into your Codex skills directory as `codex-sidebar-project-recovery`, or point your agent at [`SKILL.md`](SKILL.md). Requires Windows and Node.js 22+ with `node:sqlite` support.

## Use

First run a read-only diagnosis:

```powershell
node --experimental-sqlite .\scripts\recover-projects.js
```

If the report says the database is healthy, projects exist, and the cache is empty, fully exit Codex/ChatGPT desktop. Then double-click `scripts\restore-after-exit.cmd` in File Explorer. Reopen Codex and verify the list. The script makes a timestamped backup before writing. See [`SKILL.md`](SKILL.md) for guards, limitations, and rollback.

This repository contains no personal project data, tokens, or backup files.

## Test

`node --experimental-sqlite .\scripts\test-recovery.js` runs against a disposable synthetic database; it does not touch your Codex data.
