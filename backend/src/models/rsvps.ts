import { db } from '../db.js';

export const createOrUpdateRSVP = (event_id: number, user_id: number, status: string) => {
    const existing = db.prepare('SELECT * FROM event_rsvps WHERE event_id = ? AND user_id = ?').get(event_id, user_id);

    if (existing) {
        const stmt = db.prepare('UPDATE event_rsvps SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE event_id = ? AND user_id = ?');
        return stmt.run(status, event_id, user_id);
    } else {
        const stmt = db.prepare('INSERT INTO event_rsvps (event_id, user_id, status) VALUES (?, ?, ?)');
        return stmt.run(event_id, user_id, status);
    }
};

export const getEventRSVPs = (event_id: number) => {
    const stmt = db.prepare(`
    SELECT er.*, u.name, u.avatar 
    FROM event_rsvps er
    JOIN users u ON er.user_id = u.id
    WHERE er.event_id = ?
    ORDER BY er.created_at DESC
  `);
    return stmt.all(event_id);
};

export const getUserRSVP = (event_id: number, user_id: number) => {
    const stmt = db.prepare('SELECT status FROM event_rsvps WHERE event_id = ? AND user_id = ?');
    return stmt.get(event_id, user_id);
};

export const getEventGoingCount = (event_id: number) => {
    const stmt = db.prepare('SELECT COUNT(*) as count FROM event_rsvps WHERE event_id = ? AND status = ?');
    return stmt.get(event_id, 'going') as any;
};

export const updateEventAttendingCount = (event_id: number, count: number) => {
    const stmt = db.prepare('UPDATE events SET attending = ? WHERE id = ?');
    return stmt.run(count, event_id);
};
