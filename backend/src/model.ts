import { db } from './db.js';

// User Models
export const createUser = (email: string, password_hash: string, username: string, name: string) => {
  const stmt = db.prepare('INSERT INTO users (email, password_hash, username, name) VALUES (?, ?, ?, ?)');
  return stmt.run(email, password_hash, username, name);
};

export const getUser = (id: number) => {
  const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
  return stmt.get(id);
};

export const getUserByEmail = (email: string) => {
  const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
  return stmt.get(email);
};

export const getAllUsers = () => {
  const stmt = db.prepare('SELECT id, email, username, name, avatar, specialization, year, interests, online_status, last_seen, attendance_rate, created_at FROM users');
  return stmt.all();
};

export const updateUser = (id: number, data: any) => {
  const fields = Object.keys(data).map(k => `${k} = ?`).join(', ');
  const values = [...Object.values(data), id];
  const stmt = db.prepare(`UPDATE users SET ${fields} WHERE id = ?`);
  return stmt.run(...values);
};

export const deleteUser = (id: number) => {
  const stmt = db.prepare('DELETE FROM users WHERE id = ?');
  return stmt.run(id);
};

// Hub Models
export const createHub = (name: string, type: string, description: string, creator_id: number, data: any = {}) => {
  const stmt = db.prepare(`
    INSERT INTO hubs (name, type, description, creator_id, icon, specialization, year, color)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  return stmt.run(name, type, description, creator_id, data.icon || null, data.specialization || null, data.year || null, data.color || null);
};

export const getHub = (id: number) => {
  const stmt = db.prepare('SELECT * FROM hubs WHERE id = ?');
  const hub = stmt.get(id);
  if (hub) {
    const membersStmt = db.prepare('SELECT COUNT(*) as count FROM hub_members WHERE hub_id = ?');
    const membersCount = membersStmt.get(id) as any;
    const interestsStmt = db.prepare('SELECT interest FROM hub_interests WHERE hub_id = ?');
    const interests = interestsStmt.all(id);
    return { ...hub, members: membersCount.count, interests: interests.map((i: any) => i.interest) };
  }
  return null;
};

export const getAllHubs = () => {
  const stmt = db.prepare('SELECT * FROM hubs');
  const hubs = stmt.all();
  return hubs.map((hub: any) => {
    const membersStmt = db.prepare('SELECT COUNT(*) as count FROM hub_members WHERE hub_id = ?');
    const membersCount = membersStmt.get(hub.id) as any;
    const interestsStmt = db.prepare('SELECT interest FROM hub_interests WHERE hub_id = ?');
    const interests = interestsStmt.all(hub.id);
    return { ...hub, members: membersCount.count, interests: interests.map((i: any) => i.interest) };
  });
};

export const getHubsByType = (type: string) => {
  const stmt = db.prepare('SELECT * FROM hubs WHERE type = ?');
  const hubs = stmt.all(type);
  return hubs.map((hub: any) => {
    const membersStmt = db.prepare('SELECT COUNT(*) as count FROM hub_members WHERE hub_id = ?');
    const membersCount = membersStmt.get(hub.id) as any;
    const interestsStmt = db.prepare('SELECT interest FROM hub_interests WHERE hub_id = ?');
    const interests = interestsStmt.all(hub.id);
    return { ...hub, members: membersCount.count, interests: interests.map((i: any) => i.interest) };
  });
};

export const updateHub = (id: number, data: any) => {
  const fields = Object.keys(data).map(k => `${k} = ?`).join(', ');
  const values = [...Object.values(data), id];
  const stmt = db.prepare(`UPDATE hubs SET ${fields} WHERE id = ?`);
  return stmt.run(...values);
};

export const deleteHub = (id: number) => {
  const stmt = db.prepare('DELETE FROM hubs WHERE id = ?');
  return stmt.run(id);
};

// Hub Members
export const addHubMember = (hub_id: number, user_id: number, role: string = 'member') => {
  const stmt = db.prepare('INSERT INTO hub_members (hub_id, user_id, role) VALUES (?, ?, ?)');
  return stmt.run(hub_id, user_id, role);
};

export const removeHubMember = (hub_id: number, user_id: number) => {
  const stmt = db.prepare('DELETE FROM hub_members WHERE hub_id = ? AND user_id = ?');
  return stmt.run(hub_id, user_id);
};

export const getHubMembers = (hub_id: number) => {
  const stmt = db.prepare(`
    SELECT u.id, u.name, u.username, u.avatar, u.specialization, u.year, hm.role, hm.joined_at
    FROM hub_members hm
    JOIN users u ON hm.user_id = u.id
    WHERE hm.hub_id = ?
  `);
  return stmt.all(hub_id);
};

// Hub Interests
export const addHubInterest = (hub_id: number, interest: string) => {
  const stmt = db.prepare('INSERT INTO hub_interests (hub_id, interest) VALUES (?, ?)');
  return stmt.run(hub_id, interest);
};

export const getHubInterests = (hub_id: number) => {
  const stmt = db.prepare('SELECT interest FROM hub_interests WHERE hub_id = ?');
  return stmt.all(hub_id);
};

// ============================================
// Club Settings Models
// ============================================

export const createClubSettings = (hub_id: number, is_private: boolean = false, auto_approve_members: boolean = true) => {
  const stmt = db.prepare('INSERT INTO club_settings (hub_id, is_private, auto_approve_members) VALUES (?, ?, ?)');
  return stmt.run(hub_id, is_private ? 1 : 0, auto_approve_members ? 1 : 0);
};

export const getClubSettings = (hub_id: number) => {
  const stmt = db.prepare('SELECT * FROM club_settings WHERE hub_id = ?');
  return stmt.get(hub_id);
};

export const updateClubSettings = (hub_id: number, data: any) => {
  const fields = Object.keys(data).map(k => `${k} = ?`).join(', ');
  const values = [...Object.values(data), hub_id];
  const stmt = db.prepare(`UPDATE club_settings SET ${fields} WHERE hub_id = ?`);
  return stmt.run(...values);
};

// ============================================
// Club Join Requests Models
// ============================================

export const createJoinRequest = (club_id: number, user_id: number, message: string = '') => {
  const stmt = db.prepare('INSERT INTO club_join_requests (club_id, user_id, message) VALUES (?, ?, ?)');
  return stmt.run(club_id, user_id, message);
};

export const getJoinRequest = (id: number) => {
  const stmt = db.prepare(`
    SELECT jr.*, u.name as user_name, u.username, u.avatar as user_avatar
    FROM club_join_requests jr
    JOIN users u ON jr.user_id = u.id
    WHERE jr.id = ?
  `);
  return stmt.get(id);
};

export const getClubJoinRequests = (club_id: number, status: string = 'pending') => {
  const stmt = db.prepare(`
    SELECT jr.*, u.name as user_name, u.username, u.avatar as user_avatar
    FROM club_join_requests jr
    JOIN users u ON jr.user_id = u.id
    WHERE jr.club_id = ? AND jr.status = ?
    ORDER BY jr.requested_at DESC
  `);
  return stmt.all(club_id, status);
};

export const getUserJoinRequests = (user_id: number) => {
  const stmt = db.prepare(`
    SELECT jr.*, h.name as club_name, h.icon as club_icon
    FROM club_join_requests jr
    JOIN hubs h ON jr.club_id = h.id
    WHERE jr.user_id = ?
    ORDER BY jr.requested_at DESC
  `);
  return stmt.all(user_id);
};

export const updateJoinRequest = (id: number, status: string, reviewed_by: number) => {
  const stmt = db.prepare(`
    UPDATE club_join_requests 
    SET status = ?, reviewed_by = ?, reviewed_at = CURRENT_TIMESTAMP 
    WHERE id = ?
  `);
  return stmt.run(status, reviewed_by, id);
};

// ============================================
// Club Posts Models
// ============================================

export const createClubPost = (club_id: number, author_id: number, title: string, content: string, type: string = 'general') => {
  const stmt = db.prepare('INSERT INTO club_posts (club_id, author_id, title, content, type) VALUES (?, ?, ?, ?, ?)');
  return stmt.run(club_id, author_id, title, content, type);
};

export const getClubPost = (id: number) => {
  const stmt = db.prepare(`
    SELECT cp.*, u.name as author_name, u.username as author_username, u.avatar as author_avatar
    FROM club_posts cp
    JOIN users u ON cp.author_id = u.id
    WHERE cp.id = ?
  `);
  return stmt.get(id);
};

export const getClubPosts = (club_id: number) => {
  const stmt = db.prepare(`
    SELECT cp.*, u.name as author_name, u.username as author_username, u.avatar as author_avatar
    FROM club_posts cp
    JOIN users u ON cp.author_id = u.id
    WHERE cp.club_id = ?
    ORDER BY cp.pinned DESC, cp.created_at DESC
  `);
  return stmt.all(club_id);
};

export const updateClubPost = (id: number, data: any) => {
  const fields = Object.keys(data).map(k => `${k} = ?`).join(', ');
  const values = [...Object.values(data), id];
  const stmt = db.prepare(`UPDATE club_posts SET ${fields}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`);
  return stmt.run(...values);
};

export const deleteClubPost = (id: number) => {
  const stmt = db.prepare('DELETE FROM club_posts WHERE id = ?');
  return stmt.run(id);
};

export const pinClubPost = (id: number, pinned: boolean) => {
  const stmt = db.prepare('UPDATE club_posts SET pinned = ? WHERE id = ?');
  return stmt.run(pinned ? 1 : 0, id);
};

// ============================================
// Club Events Models
// ============================================

export const createClubEvent = (event_id: number, club_id: number, visibility: string = 'public', target_audience: string = '') => {
  const stmt = db.prepare('INSERT INTO club_events (event_id, club_id, visibility, target_audience) VALUES (?, ?, ?, ?)');
  return stmt.run(event_id, club_id, visibility, target_audience);
};

export const getClubEvents = (club_id: number) => {
  const stmt = db.prepare(`
    SELECT e.*, ce.visibility, ce.target_audience
    FROM club_events ce
    JOIN events e ON ce.event_id = e.id
    WHERE ce.club_id = ?
    ORDER BY e.date ASC, e.time ASC
  `);
  return stmt.all(club_id);
};

export const getEventClub = (event_id: number) => {
  const stmt = db.prepare(`
    SELECT h.*, ce.visibility, ce.target_audience
    FROM club_events ce
    JOIN hubs h ON ce.club_id = h.id
    WHERE ce.event_id = ?
  `);
  return stmt.get(event_id);
};

export const updateClubEventVisibility = (id: number, visibility: string) => {
  const stmt = db.prepare('UPDATE club_events SET visibility = ? WHERE id = ?');
  return stmt.run(visibility, id);
};

// ============================================
// Club Permission Helpers
// ============================================

export const getUserClubRole = (club_id: number, user_id: number) => {
  const stmt = db.prepare('SELECT role FROM hub_members WHERE hub_id = ? AND user_id = ?');
  const result = stmt.get(club_id, user_id) as any;
  return result ? result.role : null;
};

export const isClubMember = (club_id: number, user_id: number) => {
  const stmt = db.prepare('SELECT COUNT(*) as count FROM hub_members WHERE hub_id = ? AND user_id = ?');
  const result = stmt.get(club_id, user_id) as any;
  return result.count > 0;
};

export const canManageMembers = (club_id: number, user_id: number) => {
  const role = getUserClubRole(club_id, user_id);
  return role === 'leader' || role === 'admin';
};

export const canManagePosts = (club_id: number, user_id: number) => {
  const role = getUserClubRole(club_id, user_id);
  return role === 'leader' || role === 'admin' || role === 'moderator';
};
