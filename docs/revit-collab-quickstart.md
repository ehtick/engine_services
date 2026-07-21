# That Open — Revit Collaboration Quickstart (for AI assistants)

You are an AI assistant. A user pointed you at this guide so you can set up or join
**real‑time Revit collaboration** through the That Open platform. Follow the steps
**in order**. Ask the user for anything you don't already have. Do **exactly** what each
step says — don't improvise, don't skip the verification lines, and don't call platform
APIs directly. Everything is done with the `thatopen` CLI.

## What this does
Multiple people work on **one shared Revit central model** using Revit's native
worksharing. The central lives on the That Open platform. Each person has their own
local; when they **sync**, their changes go up and their teammates' changes come down.
All syncs are automatically **queued**, so the central never conflicts or diverges.

## Rules (read first, follow throughout)
- **Never** print, echo, store, or commit the user's access token.
- **Ask, don't assume.** If you're missing a value (project id, file path, central name),
  ask the user for it before running a command.
- **Use only the `thatopen` CLI** commands in this guide. Don't hand‑edit files or call
  HTTP APIs.
- Revit‑specific work (enable worksharing, create local, sync) happens **inside the That
  Open Revit add‑in**; the CLI drives it. The user must have Revit open with the add‑in.
- After each command, **check the output** matches what this guide says before moving on.

---

## Step 0 — Prerequisites (check, don't assume)

1. **Node.js 18+** — run `node -v`. If missing, ask the user to install Node.js, then continue.
2. **The CLI** — install/upgrade it:
   ```
   npm install -g @thatopen/services@latest
   ```
   Verify with `thatopen --version`.
3. **Revit 2026 is open** on this machine. Ask the user to confirm.
4. **The That Open Revit add‑in is installed.** Ask the user:
   *"Do you already have the That Open Revit add‑in installed?"*
   - **If no / not sure — the plugin files ship in the SAME folder as this guide**
     (this guide travels inside the plugin zip). Install it:
     1. In this folder, right‑click `install.ps1` → **Run with PowerShell**
        (or run `powershell -ExecutionPolicy Bypass -File .\install.ps1`).
     2. **Restart Revit 2026.** If Revit warns the add‑in is from an unknown publisher,
        choose **"Always Load"**.
     - *If you have only this guide and not the plugin files, download the plugin zip here,
       unzip it, and run `install.ps1`:*
       **https://drive.google.com/file/d/1HL_Ti7N_qN0Q-X7vNYOQst3yEgIY-xXO/view?usp=drive_link**
5. **Verify the add‑in is running** — run:
   ```
   thatopen revit status
   ```
   It should print JSON containing `"loaded": true`. If instead you see
   *"The That Open Revit add‑in is not running"*, the user must open Revit 2026 (with the
   add‑in installed) and — if they just installed it — **restart Revit**. Then retry.

---

## Step 1 — Log in

Ask the user for their **platform access token**:
*"Please paste your That Open access token (dashboard → Data → API Tokens → Create → copy)."*
**Never echo the token back.** Then run:
```
thatopen login --token <TOKEN>
```
- For the **dev** environment, add: `--api-url https://dev.platform.thatopen.com`
- Success looks like: `Logged in successfully. Config saved to ~/.thatopen/config.json`.

---

## Step 2 — Which project?

Ask the user for the **platform Project ID** they want to collaborate in
(they can find it in the platform dashboard / project settings / project URL).
Remember it as `<PROJECT>` for the commands below.

---

## Step 3 — Publish or Join?

Ask the user:
*"Do you want to **(A) share a Revit model** with your team for the first time, or
**(B) join a shared model** a teammate already uploaded?"*

### 3A — Share a model (publisher)
Use this when the user has a Revit file on their machine they want the team to work on.
It works whether the file is a **normal (non‑workshared) model** or already a **central** —
both are fine.

1. Ask for the **absolute path** to the `.rvt` on this machine → `<FILE>`.
2. Ask for a **short name** for this shared central, e.g. `tower-central` → `<DOC>`.
   (This is how teammates will refer to it when they join. Keep it lowercase, no spaces.)
3. Run:
   ```
   thatopen revit publish-central --project <PROJECT> --doc <DOC> --file "<FILE>"
   ```
   This enables worksharing, saves it as a central, uploads it, and opens **your** local in
   Revit. It can take a bit (Revit is doing the worksharing conversion).
4. Success prints `Published. Central: ... (version N).` Tell the user their teammates can
   now join with:
   ```
   thatopen revit join --project <PROJECT> --doc <DOC>
   ```

### 3B — Join a shared model (collaborator)
Use this when a teammate has already published a central to this project.

1. Ask for the **central name** the publisher gave them → `<DOC>`.
2. Run:
   ```
   thatopen revit join --project <PROJECT> --doc <DOC>
   ```
   This downloads the central, creates the user's **local**, and opens it in Revit.
   Success prints `Joined. Your local was created and opened in Revit: ...`.

---

## Step 4 — Work, then sync

Tell the user: **model normally** in the local that Revit just opened.
When they want to **send their changes to the team and pull the team's changes**, run:
```
thatopen revit sync
```
…or click **"Sync to team"** in the **"That Open"** panel of Revit's **Add‑Ins** tab.
Success prints `Synced.  vN → vM.` Everyone's syncs are queued automatically — no conflicts.

They can keep working and sync as often as they like. Repeat this step.

---

## Special case — the user already has their local open
If the user **already has their local `.rvt` open in Revit** from a previous session, they
do **not** need to log in / join again. The open file already knows its project and central.
Just tell them to run `thatopen revit sync` (or click **"Sync to team"**) — it reads
everything it needs from the open local.

---

## Troubleshooting
- **"The That Open Revit add‑in is not running"** → open Revit 2026 with the add‑in
  installed; if just installed, restart Revit; then retry.
- **"Not logged in"** → do Step 1.
- **publish/join says a value is missing** → you omitted an `--option`. Re‑run with all of
  `--project`, `--doc`, and (for publish) `--file`.
- **"Could not reach the Revit add‑in"** → Revit was closed. Reopen it and retry.

## Rules recap (for the AI)
- Ask for every value you don't have — never guess a project id, file path, or central name.
- Never echo or store the user's token.
- Only use the `thatopen` CLI commands shown here; verify each command's output before
  proceeding.
