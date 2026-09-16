import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { PluginConnection } from '../types';
import { db, savePluginsToDisk } from './db';

const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
const googleRedirectUri = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/api/auth/google/callback';

export class SyncService {
  private getOAuthClient(plugin: PluginConnection): OAuth2Client {
    const client = new OAuth2Client(googleClientId, googleClientSecret, googleRedirectUri);
    if (plugin.accessToken || plugin.refreshToken) {
      client.setCredentials({
        access_token: plugin.accessToken,
        refresh_token: plugin.refreshToken,
        expiry_date: plugin.tokenExpiry,
      });
    }
    return client;
  }

  public async syncPlugin(plugin: PluginConnection): Promise<number> {
    if (plugin.status !== 'connected' || !plugin.accessToken) {
      return 0; // Skip disconnected plugins
    }

    try {
      let itemsSynced = 0;
      const auth = this.getOAuthClient(plugin);

      if (plugin.pluginId.includes('gmail')) {
        itemsSynced += await this.syncGmail(plugin, auth);
      } else if (plugin.pluginId.includes('calendar')) {
        itemsSynced += await this.syncCalendar(plugin, auth);
      } else if (plugin.pluginId.includes('classroom')) {
        itemsSynced += await this.syncClassroom(plugin, auth);
      } else if (plugin.pluginId.includes('drive')) {
        itemsSynced += await this.syncDrive(plugin, auth);
      }

      // Update plugin sync info
      plugin.lastSync = 'Just now';
      
      const syncItem: any = {
        id: `sync-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ', Today',
        status: 'success',
        summary: `Automated sync completed: ${itemsSynced} items updated.`,
        itemsSynced,
      };
      plugin.syncHistory = [syncItem, ...(plugin.syncHistory || [])].slice(0, 20);
      savePluginsToDisk(db.plugins);

      return itemsSynced;
    } catch (e: any) {
      console.error(`Sync error for ${plugin.name}:`, e);
      const errorItem: any = {
        id: `sync-err-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ', Today',
        status: 'error',
        summary: `Sync failed: ${e.message}`,
        itemsSynced: 0,
      };
      plugin.syncHistory = [errorItem, ...(plugin.syncHistory || [])].slice(0, 20);
      savePluginsToDisk(db.plugins);
      return 0;
    }
  }

  private async syncGmail(plugin: PluginConnection, auth: OAuth2Client): Promise<number> {
    const gmail = google.gmail({ version: 'v1', auth: auth as any });
    let count = 0;
    try {
      const res = await gmail.users.messages.list({
        userId: 'me',
        maxResults: 10,
        q: 'subject:(assignment OR exam OR deadline OR schedule)',
      });

      const messages = res.data.messages || [];
      for (const msg of messages) {
        if (!msg.id) continue;
        const msgRes = await gmail.users.messages.get({ userId: 'me', id: msg.id });
        const headers = msgRes.data.payload?.headers || [];
        const subject = headers.find((h: any) => h.name === 'Subject')?.value || 'No Subject';
        const from = headers.find((h: any) => h.name === 'From')?.value || 'Unknown';
        
        console.log(`Synced Gmail: ${subject} from ${from}`);
        count++;
      }
    } catch (e) {
      console.warn('Gmail API error (ensure scope and API enabled):', e);
      throw e;
    }
    return count;
  }

  private async syncCalendar(plugin: PluginConnection, auth: OAuth2Client): Promise<number> {
    const calendar = google.calendar({ version: 'v3', auth: auth as any });
    let count = 0;
    try {
      const res = await calendar.events.list({
        calendarId: 'primary',
        timeMin: new Date().toISOString(),
        maxResults: 20,
        singleEvents: true,
        orderBy: 'startTime',
      });

      const events = res.data.items || [];
      for (const event of events) {
        if (!event.id || !event.summary) continue;
        console.log(`Synced Event: ${event.summary} at ${event.start?.dateTime || event.start?.date}`);
        count++;
      }
    } catch (e) {
      console.warn('Calendar API error:', e);
      throw e;
    }
    return count;
  }

  private async syncClassroom(plugin: PluginConnection, auth: OAuth2Client): Promise<number> {
    const classroom = google.classroom({ version: 'v1', auth: auth as any });
    let count = 0;
    try {
      const res = await classroom.courses.list({
        studentId: 'me',
        courseStates: ['ACTIVE'],
      });

      const courses = res.data.courses || [];
      for (const course of courses) {
        if (!course.id) continue;
        console.log(`Synced Course: ${course.name}`);
        count++;
        
        const cwRes = await classroom.courses.courseWork.list({
          courseId: course.id,
        });
        const coursework = cwRes.data.courseWork || [];
        for (const cw of coursework) {
          console.log(`Synced Coursework: ${cw.title}`);
          count++;
        }
      }
    } catch (e) {
      console.warn('Classroom API error:', e);
      throw e;
    }
    return count;
  }

  private async syncDrive(plugin: PluginConnection, auth: OAuth2Client): Promise<number> {
    const drive = google.drive({ version: 'v3', auth: auth as any });
    let count = 0;
    try {
      const res = await drive.files.list({
        pageSize: 10,
        fields: 'nextPageToken, files(id, name)',
        q: "mimeType='application/pdf' or mimeType='application/vnd.google-apps.presentation'",
      });
      const files = res.data.files || [];
      for (const file of files) {
        console.log(`Synced Drive File: ${file.name}`);
        count++;
      }
    } catch (e) {
      console.warn('Drive API error:', e);
      throw e;
    }
    return count;
  }
}

export const syncService = new SyncService();
