# Missing ChatGPT mode

Use this guide when the app opens in Codex or ChatGPT Work and the ordinary ChatGPT chat interface appears missing.

## Distinguish the two cases

1. Open the product or mode selector.
2. If `ChatGPT` is present, select it and verify that a normal new chat opens. This is a view-selection issue.
3. If the selector shows only `ChatGPT Work` and `Codex`, inspect the account/workspace menu in both the desktop app and ChatGPT web.
4. Switch to the personal workspace if it is available, then reopen the selector.

## Work-only state

An observed failure mode is a server-managed Work-only capability that hides ordinary ChatGPT even while the local composer preference still says `chat`. Restarting can make the issue reappear because capabilities are fetched again. Editing local preferences, clearing the frontend cache, or forcing a mode value cannot reliably override that server state.

If no personal workspace is available, stop local repair attempts. The next action belongs to the workspace administrator or OpenAI support. Record the app version, account/workspace name, selector screenshot, and whether web ChatGPT shows the same limitation. Do not include tokens, cookies, or private chat titles.

## Avoid

- Do not sign out or delete AppData as a first step.
- Do not create replacement chats or projects to test recovery.
- Do not claim success merely because the app returned to the ChatGPT Work screen; verify that ordinary `ChatGPT` is actually present in the selector.
