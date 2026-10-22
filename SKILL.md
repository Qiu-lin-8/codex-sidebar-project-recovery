---
name: codex-sidebar-project-recovery
description: Diagnose and safely repair an empty Codex desktop Projects sidebar on Windows when existing project records remain in the local SQLite database but the frontend local-projects cache is empty. Use for missing Codex sidebar projects after an app update or restart; preserve user data and require full app exit before any repair.
---

# Codex sidebar project recovery (Windows)

Recover the sidebar only after verifying the underlying projects still exist. This skill addresses one observed cache-migration failure, not every missing-project scenario.

## Safety sequence

1. Confirm the same Codex account is selected and the **Projects** section is expanded. Do not create replacement projects or reinstall the app.
2. Run `node --experimental-sqlite scripts/recover-projects.js` to diagnose. Requires Node.js with `node:sqlite` (tested with Node 22). The script only prints counts and paths; it never prints project names.
3. Proceed only if SQLite integrity is `ok`, database project count is positive, and `local-projects` count is zero. If these conditions do not hold, stop and investigate rather than forcing this repair.
4. Tell the user what will change: only `.codex-global-state.json` gets a timestamped backup and its `local-projects` / `project-order` keys are rebuilt from the read-only SQLite project records. Do not change SQLite, thread assignments, project folders, or account settings.
5. **Fully exit Codex/ChatGPT desktop, including tray processes.** Do not run the write step from an active Codex chat: the running app can overwrite the repaired cache on exit.
6. From Windows Explorer, double-click `scripts\restore-after-exit.cmd`. It refuses to run while `ChatGPT` or `Codex` processes remain, runs the guarded repair, and leaves the app closed.
7. Reopen Codex manually. Verify the sidebar shows the expected projects and that existing project chats open. Keep the backup until verified.

## Recovery and limits

- The diagnostic script accepts `--codex-home <path>` when Codex uses a nonstandard data directory. Pass the same option to `restore-after-exit.ps1` via PowerShell if needed; do not edit hardcoded paths.
- If the script reports a nonempty `local-projects` cache, missing database, unexpected schema, corrupt SQLite, or projects with no root path, stop. This procedure does not cover those cases.
- If Codex still opens with an empty sidebar after a successful write, close it and compare the cache counts again. A zero count means another running process or app migration rewrote the state; do not keep rerunning blindly.
- To roll back while Codex is fully closed, copy the exact backup reported by the script over `.codex-global-state.json`. Never delete `state_*.sqlite` or the project directories.
- The project roots and project names may be private. Do not publish diagnostics, database files, backups, screenshots, or user-specific paths.
