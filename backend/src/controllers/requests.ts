import { Request, Response } from 'express';
import { db } from '../db.js';

export const getAllRequests = (req: Request, res: Response) => {
  try {
    const requests = db.prepare('SELECT * FROM requests ORDER BY created_at DESC').all();
    res.json(requests);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const getRequest = (req: Request, res: Response) => {
  try {
    const request = db.prepare('SELECT * FROM requests WHERE id = ?').get(req.params.id);
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }
    res.json(request);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const createRequest = (req: Request, res: Response) => {
  try {
    const { title, description, type, submitted_to, category, submitter_id, supporters, required, progress, resolution, response_time, submitted_at } = req.body;
    
    // Fetch submitter info from users table
    const submitter = db.prepare('SELECT name, avatar FROM users WHERE id = ?').get(submitter_id || 1) as any;
    if (!submitter) {
      return res.status(400).json({ error: 'Submitter not found' });
    }
    
    const result = db.prepare(`
      INSERT INTO requests (title, description, type, submitted_to, category, submitter_id, submitter_name, submitter_avatar, supporters, required, progress, resolution, response_time, submitted_at, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      title,
      description,
      type,
      submitted_to,
      category,
      submitter_id || 1,
      submitter.name,
      submitter.avatar,
      supporters || 0,
      required || 30,
      progress || 0,
      resolution || null,
      response_time || null,
      submitted_at || 'just now',
      'Pending'
    );
    
    res.status(201).json({ id: result.lastInsertRowid, message: 'Request created successfully' });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};

export const updateRequest = (req: Request, res: Response) => {
  try {
    const fields = Object.keys(req.body).map(k => `${k} = ?`).join(', ');
    const values = [...Object.values(req.body), req.params.id];
    db.prepare(`UPDATE requests SET ${fields} WHERE id = ?`).run(...values);
    res.json({ success: true, message: 'Request updated successfully' });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};

export const deleteRequest = (req: Request, res: Response) => {
  try {
    db.prepare('DELETE FROM requests WHERE id = ?').run(req.params.id);
    res.json({ success: true, message: 'Request deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};
