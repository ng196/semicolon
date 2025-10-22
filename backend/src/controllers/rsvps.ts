import { Request, Response } from 'express';
import { db } from '../db.js';

export const createOrUpdateRSVP = (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.id;
        const { event_id, status } = req.body;

        if (!userId) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        // Check if RSVP exists
        const existing = db.prepare('SELECT * FROM event_rsvps WHERE event_id = ? AND user_id = ?').get(event_id, userId);

        if (existing) {
            db.prepare('UPDATE event_rsvps SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE event_id = ? AND user_id = ?')
                .run(status, event_id, userId);
        } else {
            db.prepare('INSERT INTO event_rsvps (event_id, user_id, status) VALUES (?, ?, ?)')
                .run(event_id, userId, status);
        }

        // Update event attending count
        const goingCount = db.prepare('SELECT COUNT(*) as count FROM event_rsvps WHERE event_id = ? AND status = ?').get(event_id, 'going') as any;
        db.prepare('UPDATE events SET attending = ? WHERE id = ?').run(goingCount.count, event_id);

        res.json({ success: true, message: 'RSVP updated successfully' });
    } catch (error) {
        res.status(400).json({ error: (error as Error).message });
    }
};

export const getEventRSVPs = (req: Request, res: Response) => {
    try {
        const rsvps = db.prepare(`
            SELECT er.*, u.name, u.avatar 
            FROM event_rsvps er
            JOIN users u ON er.user_id = u.id
            WHERE er.event_id = ? AND er.status = 'going'
        `).all(req.params.eventId);

        res.json(rsvps);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
};

export const getUserRSVP = (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.id;
        if (!userId) {
            return res.json({ status: null });
        }

        const rsvp = db.prepare('SELECT status FROM event_rsvps WHERE event_id = ? AND user_id = ?')
            .get(req.params.eventId, userId) as any;

        res.json({ status: rsvp?.status || null });
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
};
