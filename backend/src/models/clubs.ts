import { db } from '../db.js';

// Club Settings
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

// Club Join Requests
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

// Club Posts
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

// Club Events
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
