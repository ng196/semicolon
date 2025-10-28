import { Request, Response } from 'express';
import * as model from '../models/index.js';

export const createOrUpdateRSVP = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.id;
        const { event_id, status } = req.body;

        if (!userId) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        await model.createOrUpdateRSVP(event_id, userId, status);

        // Update event attending count
        const goingCount = await model.getEventGoingCount(event_id);
        await model.updateEventAttendingCount(event_id, goingCount.count);

        res.json({ success: true, message: 'RSVP updated successfully' });
    } catch (error) {
        res.status(400).json({ error: (error as Error).message });
    }
};

export const getEventRSVPs = async (req: Request, res: Response) => {
    try {
        const rsvps = await model.getEventRSVPs(parseInt(req.params.eventId));
        res.json(rsvps);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
};

export const getUserRSVP = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.id;

        if (!userId) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        const rsvp = await model.getUserRSVP(parseInt(req.params.eventId), userId) as any;

        res.json({ status: rsvp?.status || null });
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
};
