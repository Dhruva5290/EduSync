import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { User } from '../types';

let _sbClient: SupabaseClient | null = null;

function getClient(): SupabaseClient | null {
  if (_sbClient) return _sbClient;
  const url =
    process.env.VITE_SUPABASE_URL ||
    process.env.SUPABASE_URL ||
    'https://zuqtefefgnsqxmzetlqe.supabase.co';
  const key =
    process.env.VITE_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp1cXRlZmVmZ25zcXhtemV0bHFlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg0MTYzODUsImV4cCI6MjEwMzk5MjM4NX0.GI_PspNcrW6fFDWPi7cibrAFAK2vN_yfadDxhr5Tuz0';
  if (!url || !key) return null;
  _sbClient = createClient(url, key);
  return _sbClient;
}

/**
 * Persist or update a user record in the Supabase Cloud Store.
 * This guarantees the user is saved forever and accessible from any device or serverless cold-start.
 */
export async function persistUserToCloud(user: User): Promise<boolean> {
  const sb = getClient();
  if (!sb) return false;

  try {
    const userTitle = `__EDUSYNC_USER__:${user.id}`;
    const cleanUsername = (user.username || '').toLowerCase().trim();
    const cleanEmail = (user.email || '').toLowerCase().trim();
    const cleanInstId = (user.institutionalId || '').toLowerCase().trim();

    const existing = await sb.from('notes').select('id').eq('title', userTitle);
    
    if (existing.data && existing.data.length > 0) {
      const { error } = await sb
        .from('notes')
        .update({
          generalised_notes: JSON.stringify(user),
          status: 'ready',
          metadata: {
            entity_type: 'edusync_user',
            user_id: user.id,
            username: cleanUsername,
            email: cleanEmail,
            institutional_id: cleanInstId,
            role: user.role,
            name: user.name,
            last_saved_at: new Date().toISOString()
          },
          updated_at: new Date().toISOString()
        })
        .eq('id', existing.data[0].id);

      if (error) {
        console.warn(`[Supabase Users] Error updating user ${user.id}:`, error.message);
        return false;
      }
      return true;
    } else {
      const { error } = await sb
        .from('notes')
        .insert([{
          title: userTitle,
          generalised_notes: JSON.stringify(user),
          status: 'ready',
          metadata: {
            entity_type: 'edusync_user',
            user_id: user.id,
            username: cleanUsername,
            email: cleanEmail,
            institutional_id: cleanInstId,
            role: user.role,
            name: user.name,
            created_at: new Date().toISOString()
          }
        }]);

      if (error) {
        console.warn(`[Supabase Users] Error inserting user ${user.id}:`, error.message);
        return false;
      }
      return true;
    }
  } catch (err) {
    console.warn(`[Supabase Users] Exception persisting user ${user.id}:`, err);
    return false;
  }
}

/**
 * Load all user accounts from the Supabase Cloud Store.
 */
export async function loadUsersFromCloud(): Promise<User[]> {
  const sb = getClient();
  if (!sb) return [];

  try {
    const { data, error } = await sb
      .from('notes')
      .select('generalised_notes')
      .contains('metadata', { entity_type: 'edusync_user' });

    if (error || !data) {
      return [];
    }

    const users: User[] = [];
    for (const row of data) {
      try {
        if (row.generalised_notes) {
          const u = JSON.parse(row.generalised_notes) as User;
          if (u && u.id && u.role) {
            users.push(u);
          }
        }
      } catch (parseErr) {
        // Skip malformed entries safely
      }
    }
    return users;
  } catch (err) {
    console.warn('[Supabase Users] Error loading cloud users:', err);
    return [];
  }
}

/**
 * Query the cloud directly to find a user by username, email, ID, or institutionalId.
 * Used during login to authenticate users across devices even on fresh serverless instances.
 */
export async function findUserInCloud(loginId: string): Promise<User | null> {
  const sb = getClient();
  if (!sb || !loginId) return null;

  const normalized = loginId.trim().toLowerCase();

  try {
    const cloudUsers = await loadUsersFromCloud();
    const matched = cloudUsers.find(u =>
      (u.username && u.username.toLowerCase() === normalized) ||
      (u.email && u.email.toLowerCase() === normalized) ||
      (u.institutionalId && u.institutionalId.toLowerCase() === normalized) ||
      (u.id && u.id.toLowerCase() === normalized) ||
      (u.name && u.name.toLowerCase() === normalized)
    );
    return matched || null;
  } catch (err) {
    console.warn('[Supabase Users] Exception looking up cloud user:', err);
    return null;
  }
}

/**
 * Delete a user account from the cloud store.
 * Strictly called only when the Dean/Admin deletes a user from the Institutional Directory.
 */
export async function deleteUserFromCloud(userId: string): Promise<boolean> {
  const sb = getClient();
  if (!sb || !userId) return false;

  try {
    const userTitle = `__EDUSYNC_USER__:${userId}`;
    await sb.from('notes').delete().eq('title', userTitle);
    return true;
  } catch (err) {
    console.warn(`[Supabase Users] Error deleting user ${userId}:`, err);
    return false;
  }
}
