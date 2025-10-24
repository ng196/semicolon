import { db } from '../db.js';

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
