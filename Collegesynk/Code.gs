/**
 * DAILY COLLEGE SYNC — Google Apps Script
 * Runs on a time-based trigger (set up for 6:00 AM and 6:00 PM).
 * Gmail -> Notion "College Tracker" + TickTick task + Google Calendar event.
 *
 * ============================ ONE-TIME SETUP ============================
 * 1. script.google.com -> New project. Paste this file in as Code.gs.
 * 2. File > Project Settings > Script Properties, add:
 *      CLAUDE_API_KEY   - from console.anthropic.com
 *      NOTION_TOKEN     - Notion integration token (notion.so/my-integrations)
 *      NOTION_DB_ID     - your "College Tracker" database ID
 *                         (share the database with your integration!)
 *      TICKTICK_TOKEN   - TickTick OAuth2 access token
 * 3. Enable Advanced Google Services: none needed — Gmail/Calendar are
 *    built in as GmailApp / CalendarApp.
 * 4. Run `setupTriggers()` once from the editor to install the 6 AM / 6 PM
 *    triggers. Run `main()` once manually to test and grant permissions.
 * ==========================================================================
 */

const CONFIG = {
  // Recommended Anthropic models: 'claude-3-5-haiku-20241022' or 'claude-3-haiku-20240307'
  CLAUDE_MODEL: 'claude-3-5-haiku-20241022',
  LOOKBACK_HOURS: 12,
  TICKTICK_PROJECT_ID: 'inbox', // or a real project id from TickTick
};

function setupTriggers() {
  ScriptApp.getProjectTriggers().forEach(t => ScriptApp.deleteTrigger(t));
  ScriptApp.newTrigger('main').timeBased().atHour(6).everyDays(1).create();
  ScriptApp.newTrigger('main').timeBased().atHour(18).everyDays(1).create();
}

function main() {
  const props = PropertiesService.getScriptProperties();
  const processed = JSON.parse(props.getProperty('PROCESSED_IDS') || '[]');
  const processedSet = new Set(processed);

  const emails = getRecentEmails(CONFIG.LOOKBACK_HOURS);
  const added = { assignments: 0, meetings: 0, docs: 0, courses: new Set() };

  emails.forEach(email => {
    if (processedSet.has(email.id)) return; // already handled

    const result = classifyEmail(email);
    processedSet.add(email.id); // mark seen regardless of relevance

    if (!result || !result.relevant) return;

    addNotionRow(email, result);
    createTickTickTask(email, result);
    if (result.eventDateTime) {
      createCalendarEvent(email, result);
      added.meetings++;
    } else if (result.category === 'Document') {
      added.docs++;
    } else {
      added.assignments++;
    }
    if (result.course) added.courses.add(result.course);
  });

  // cap stored IDs so properties don't grow forever
  const trimmed = Array.from(processedSet).slice(-500);
  props.setProperty('PROCESSED_IDS', JSON.stringify(trimmed));

  sendSummary(added);
}

function getRecentEmails(hours) {
  const after = new Date(Date.now() - hours * 3600 * 1000);
  const query = `newer_than:1d`; // Gmail search has no hour granularity; filter below
  const threads = GmailApp.search(query, 0, 50);
  const out = [];
  threads.forEach(thread => {
    thread.getMessages().forEach(msg => {
      if (msg.getDate() >= after) {
        out.push({
          id: msg.getId(),
          subject: msg.getSubject(),
          from: msg.getFrom(),
          date: msg.getDate(),
          body: msg.getPlainBody().slice(0, 3000), // keep prompt small
          link: `https://mail.google.com/mail/u/0/#all/${msg.getId()}`,
        });
      }
    });
  });
  return out;
}

/**
 * Calls Claude to decide relevance + extract structured fields.
 * Returns null on parse failure (fails safe: email is skipped, not lost —
 * it'll be picked up again next run since we haven't marked it relevant).
 */
function classifyEmail(email) {
  const apiKey = PropertiesService.getScriptProperties().getProperty('CLAUDE_API_KEY');
  if (!apiKey) {
    Logger.log('CLAUDE_API_KEY is not configured in Script Properties.');
    return null;
  }

  const prompt = `You are filtering one college email for a first-year ` +
    `engineering student. Decide if it is a course assignment/deadline/` +
    `announcement, a meeting/event invitation addressed to the student, ` +
    `or a new document/link shared with them. Ignore club recruitment ` +
    `spam, admin notices unrelated to coursework, and events restricted ` +
    `to other cohorts.\n\nSubject: ${email.subject}\nFrom: ${email.from}\n` +
    `Body:\n${email.body}\n\n` +
    `Reply with ONLY compact JSON, no markdown fences:\n` +
    `{"relevant": true|false, "category": "Assignment"|"Exam/Quiz"|` +
    `"Meeting/Event"|"Document"|"Announcement", "course": "string or null", ` +
    `"dueDate": "YYYY-MM-DD or null", "eventDateTime": ` +
    `"YYYY-MM-DDTHH:MM:SS or null (only if a specific date+time is given)", ` +
    `"summary": "one sentence"}`;

  const res = UrlFetchApp.fetch('https://api.anthropic.com/v1/messages', {
    method: 'post',
    contentType: 'application/json',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    payload: JSON.stringify({
      model: CONFIG.CLAUDE_MODEL,
      max_tokens: 300,
      messages: [{ role: 'user', content: prompt }],
    }),
    muteHttpExceptions: true,
  });

  try {
    const json = JSON.parse(res.getContentText());
    if (json.error) {
      Logger.log(`Claude API error: ${JSON.stringify(json.error)}`);
      return null;
    }
    const text = json.content[0].text;
    return JSON.parse(text.replace(/```json|```/g, '').trim());
  } catch (e) {
    Logger.log(`Classify failed for "${email.subject}": ${e}`);
    return null;
  }
}

function addNotionRow(email, result) {
  const props = PropertiesService.getScriptProperties();
  const token = props.getProperty('NOTION_TOKEN');
  const dbId = props.getProperty('NOTION_DB_ID');

  if (!token || !dbId) {
    Logger.log('NOTION_TOKEN or NOTION_DB_ID missing.');
    return;
  }

  const body = {
    parent: { database_id: dbId },
    properties: {
      Subject: { title: [{ text: { content: email.subject || 'No Subject' } }] },
      Sender: { rich_text: [{ text: { content: email.from || '' } }] },
      Summary: { rich_text: [{ text: { content: result.summary || '' } }] },
      Course: { rich_text: [{ text: { content: result.course || '' } }] },
      Category: { select: { name: result.category } },
      'Email Link': { url: email.link },
      ...(result.dueDate && {
        'Due Date': { date: { start: result.dueDate } },
      }),
    },
  };

  const res = UrlFetchApp.fetch('https://api.notion.com/v1/pages', {
    method: 'post',
    contentType: 'application/json',
    headers: {
      Authorization: `Bearer ${token}`,
      'Notion-Version': '2022-06-28',
    },
    payload: JSON.stringify(body),
    muteHttpExceptions: true,
  });

  if (res.getResponseCode() >= 400) {
    Logger.log(`Failed to add row to Notion: ${res.getContentText()}`);
  }
}

function createTickTickTask(email, result) {
  const token = PropertiesService.getScriptProperties().getProperty('TICKTICK_TOKEN');
  if (!token) {
    Logger.log('TICKTICK_TOKEN missing.');
    return;
  }

  const dueDate = result.eventDateTime || result.dueDate;
  const hoursUntilDue = dueDate
    ? (new Date(dueDate) - new Date()) / 3600000
    : Infinity;

  const body = {
    title: email.subject,
    content: result.summary,
    projectId: CONFIG.TICKTICK_PROJECT_ID,
    priority: hoursUntilDue <= 48 ? 5 : 1,
    tags: result.course ? [result.course] : [],
    ...(dueDate && { dueDate: new Date(dueDate).toISOString() }),
  };

  const res = UrlFetchApp.fetch('https://api.ticktick.com/open/v1/task', {
    method: 'post',
    contentType: 'application/json',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    payload: JSON.stringify(body),
    muteHttpExceptions: true,
  });

  if (res.getResponseCode() >= 400) {
    Logger.log(`Failed to create TickTick task: ${res.getContentText()}`);
  }
}

function createCalendarEvent(email, result) {
  try {
    const start = new Date(result.eventDateTime);
    const end = new Date(start.getTime() + 60 * 60 * 1000); // default 1hr
    CalendarApp.getDefaultCalendar().createEvent(email.subject, start, end, {
      description: `${result.summary}\n\nOriginal email: ${email.link}`,
    });
  } catch (e) {
    Logger.log(`Failed to create calendar event: ${e}`);
  }
}

function sendSummary(added) {
  const parts = [];
  if (added.assignments) parts.push(`${added.assignments} assignment(s)/deadline(s)`);
  if (added.meetings) parts.push(`${added.meetings} meeting(s)/event(s)`);
  if (added.docs) parts.push(`${added.docs} new doc link(s)`);

  const msg = parts.length
    ? `Added ${parts.join(', ')}${added.courses.size ? ' — courses: ' + Array.from(added.courses).join(', ') : ''}.`
    : 'No new items.';

  GmailApp.sendEmail(Session.getActiveUser().getEmail(), 'College Sync Summary', msg);
}
