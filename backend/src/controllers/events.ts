import { Request, Response } from 'express';
import { db } from '../db.js';

export const getAllEvents = (req: Request, res: Response) => {
  try {
    const events = db.prepare('SELECT * FROM events ORDER BY date ASC').all();
    res.json(events);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const getEvent = (req: Request, res: Response) => {
  try {
    const event = db.prepare('SELECT * FROM events WHERE id = ?').get(req.params.id);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    res.json(event);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const createEvent = (req: Request, res: Response) => {
  try {
    const { name, category, description, date, time, location, organizer, specialization, capacity, color } = req.body;
    const result = db.prepare(`
      INSERT INTO events (name, category, description, date, time, location, organizer, specialization, capacity, color)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(name, category, description, date, time, location, organizer, specialization || null, capacity || 100, color || null);
    
    res.status(201).json({ id: result.lastInsertRowid, message: 'Event created successfully' });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};

export const updateEvent = (req: Request, res: Response) => {
  try {
    const fields = Object.keys(req.body).map(k => `${k} = ?`).join(', ');
    const values = [...Object.values(req.body), req.params.id];
    db.prepare(`UPDATE events SET ${fields} WHERE id = ?`).run(...values);
    res.json({ success: true, message: 'Event updated successfully' });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};

export const deleteEvent = (req: Request, res: Response) => {
  try {
    db.prepare('DELETE FROM events WHERE id = ?').run(req.params.id);
    res.json({ success: true, message: 'Event deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};
