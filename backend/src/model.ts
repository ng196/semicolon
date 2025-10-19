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
