# Simplified Chinese UI recovery

Use this guide when Codex/ChatGPT for Windows displays English menus or settings unexpectedly.

The official Windows guide places the UI language control under **Settings → General → Language**: <https://learn.chatgpt.com/docs/app/windows>.

## Minimal recovery sequence

1. Run `scripts\diagnose-ui.ps1` and record the app version, Windows UI culture, and detected `--lang` values.
2. Open **Settings → General → Language**.
3. If it is not `简体中文`, select `简体中文`, reload once, and verify menus and the sidebar—not only chat content.
4. If it already says `简体中文` while the UI is English, select `Auto detect`, wait for the UI refresh, then select `简体中文` again.
5. Use `Ctrl+R` once. If unchanged, fully exit the app including tray processes, reopen it, and verify again.

## Interpret the result

- Windows UI culture is Chinese and renderer processes show `--lang=zh-CN`: the startup locale is already correct. Continued English UI points to translation-bundle loading, stale application state, or a version regression.
- The renderer language is not `zh-CN`: reselect the in-app language and restart before considering deeper repair.
- Chinese appears only in chat messages while menus remain English: the UI is not restored.

If the minimal sequence fails, collect a screenshot of the English UI with the `简体中文` setting visible and the diagnostic report. Check for an app update or report the regression. Reinstalling or removing local application data requires explicit user approval and a backup plan; it is not part of this default workflow.

## Avoid

- Do not rely on hard-coded mouse coordinates; DPI scaling and window size make them unsafe.
- Do not clear `.codex`, SQLite files, IndexedDB, or account storage just to change language.
- Do not keep repeating reload/restart after the same evidence recurs; escalate as a version-specific localization defect.
