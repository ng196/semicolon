import { db } from '../db.js';

export const createRequest = (data: any) => {
    const stmt = db.prepare(`
    INSERT INTO requests (title, description, type, submitted_to, category, submitter_id, submitter_name, submitter_avatar, supporters, required, progress, resolution, response_time, submitted_at, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
    return stmt.run(
        data.title,
        data.description,
        data.type,
        data.submitted_to,
        data.category,
        data.submitter_id,
        data.submitter_name,
        data.submitter_avatar,
        data.supporters || 0,
        data.required || 30,
        data.progress || 0,
        data.resolution || null,
        data.response_time || null,
        data.submitted_at || 'just now',
        'Pending'
    );
};

export const getRequest = (id: number) => {
    const stmt = db.prepare('SELECT * FROM requests WHERE id = ?');
    return stmt.get(id);
};

export const getAllRequests = () => {
    const stmt = db.prepare('SELECT * FROM requests ORDER BY created_at DESC');
    return stmt.all();
};

export const updateRequest = (id: number, data: any) => {
    const fields = Object.keys(data).map(k => `${k} = ?`).join(', ');
    const values = [...Object.values(data), id];
    const stmt = db.prepare(`UPDATE requests SET ${fields} WHERE id = ?`);
    return stmt.run(...values);
};

export const deleteRequest = (id: number) => {
    const stmt = db.prepare('DELETE FROM requests WHERE id = ?');
    return stmt.run(id);
};
