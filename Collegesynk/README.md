# 🎓 Daily College Sync (Gmail -> Notion + TickTick + Google Calendar)

An automated Google Apps Script pipeline that filters and categorizes college/coursework emails with Claude AI and synchronizes actionable items into:
- 📑 **Notion Database** ("College Tracker")
- ✅ **TickTick Tasks** (with priority and due date)
- 📅 **Google Calendar Events** (for classes, meetings, and deadlines)
- 📬 **Daily Email Digest** (summary of synced items)

---

## 🛠️ Step-by-Step Setup Guide

### 1. Google Apps Script Project
1. Go to [script.google.com](https://script.google.com/) and click **New project**.
2. Copy the contents of [`Code.gs`](./Code.gs) and paste it into the editor.
3. In **Project Settings** (⚙️ gear icon), enable *"Show 'appsscript.json' manifest file in editor"* if you want to inspect scopes, or paste the scopes from [`appsscript.json`](./appsscript.json).

---

### 2. Configure Script Properties
In the Apps Script editor, go to **Project Settings** (⚙️) > **Script Properties** > **Add script property** and add the following keys:

| Property | Description | Example / Source |
|---|---|---|
| `CLAUDE_API_KEY` | Anthropic API Key | `sk-ant-api03-...` from [Anthropic Console](https://console.anthropic.com/) |
| `NOTION_TOKEN` | Notion Internal Integration Secret | `secret_...` from [Notion Integrations](https://www.notion.so/my-integrations) |
| `NOTION_DB_ID` | Notion Database ID | The 32-character ID in your database link |
| `TICKTICK_TOKEN` | TickTick OAuth2 Access Token | Bearer token from TickTick Open API |

---

### 3. Notion Database Structure
Create a Notion database named **"College Tracker"** with the following exact property names and types:

| Property Name | Property Type | Description |
|---|---|---|
| **Subject** | `Title` | Email subject line |
| **Sender** | `Text` (Rich Text) | Email sender address |
| **Summary** | `Text` (Rich Text) | One-sentence summary from Claude |
| **Course** | `Text` (Rich Text) | Extracted course name / code |
| **Category** | `Select` | `Assignment`, `Exam/Quiz`, `Meeting/Event`, `Document`, `Announcement` |
| **Email Link** | `URL` | Direct link to original Gmail message |
| **Due Date** | `Date` | Due date extracted by AI |

> ⚠️ **Important:** In your Notion database page, click **`•••` (top right)** > **Connections** / **Add connections** > Select your Notion integration, otherwise Apps Script will get a `404 Object Not Found` error.

---

### 4. TickTick OAuth Setup
1. Register a developer app at [developer.ticktick.com](https://developer.ticktick.com/).
2. Obtain your OAuth2 access token and set it in `TICKTICK_TOKEN`.
3. To customize the destination list, set `CONFIG.TICKTICK_PROJECT_ID` in `Code.gs` (defaults to `'inbox'`).

---

### 5. Running & Scheduling
1. **Initial Test & Permission Grant**:
   - In the Apps Script toolbar, select `main` from the dropdown and click **Run**.
   - Review and accept Google's permission prompt (access to Gmail and Calendar).
   - Check the **Execution log** at the bottom to verify success.
2. **Setup Automated Triggers**:
   - Select `setupTriggers` from the dropdown and click **Run**.
   - This automatically creates time-based triggers running at **6:00 AM** and **6:00 PM** daily.
