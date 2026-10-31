# Codex / ChatGPT Windows UI Recovery

A safety-first Codex skill for three recurring Windows desktop failures:

- **Projects → No projects** while the local SQLite project records still exist.
- The ordinary **ChatGPT** mode disappears and only **ChatGPT Work** / **Codex** remain.
- The interface stays English even though **简体中文** is selected.

The original guarded sidebar-project recovery remains intact. The repository now also includes decision guides for Chat-mode and language failures plus a privacy-safe diagnostic script.

## Install

```powershell
npx skills add Qiu-lin-8/codex-sidebar-project-recovery -g
```

Or copy this repository into your Codex skills directory and invoke `$codex-sidebar-project-recovery`.

## Quick diagnosis

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\diagnose-ui.ps1
```

The report shows only application version, Windows UI culture, detected renderer language flags, and whether the Codex state file exists. It does not print tokens, chats, project names, command lines, or state-file contents.

For an empty Projects list, run the existing read-only database/cache check:

```powershell
node --experimental-sqlite .\scripts\recover-projects.js
```

Only if its guard conditions pass, fully exit Codex/ChatGPT and run `scripts\restore-after-exit.cmd`. See [SKILL.md](SKILL.md) for the complete decision flow and rollback rules.

## Test

```powershell
node --experimental-sqlite .\scripts\test-recovery.js
powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\diagnose-ui.ps1 -Json
```

The project-recovery test uses disposable synthetic data. This repository contains no personal project data, tokens, screenshots, logs, or backups.
