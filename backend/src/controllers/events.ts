import { Request, Response } from 'express';
import { db } from '../db.js';

export const getAllEvents = (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;

    // Get events with club information
    const events = db.prepare(`
      SELECT 
        e.*,
        ce.club_id,
        ce.visibility,
        ce.target_audience,
        h.name as club_name,
        h.icon as club_icon,
        h.color as club_color,
        CASE 
          WHEN hm.role IN ('leader', 'admin', 'creator') THEN 1
          ELSE 0
        END as can_edit
      FROM events e
      LEFT JOIN club_events ce ON e.id = ce.event_id
      LEFT JOIN hubs h ON ce.club_id = h.id
      LEFT JOIN hub_members hm ON h.id = hm.hub_id AND hm.user_id = ?
      WHERE 
        ce.visibility = 'public'
        OR (ce.visibility = 'members_only' AND hm.user_id IS NOT NULL)
        OR (ce.visibility = 'private' AND hm.role IN ('leader', 'admin', 'creator'))
        OR ce.visibility IS NULL
      ORDER BY e.date ASC
    `).all(userId || 0);

    res.json(events);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const getEvent = (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;

    const event = db.prepare(`
      SELECT 
        e.*,
        ce.club_id,
        ce.visibility,
        ce.target_audience,
        h.name as club_name,
        h.icon as club_icon,
        h.color as club_color,
        CASE 
          WHEN hm.role IN ('leader', 'admin', 'creator') THEN 1
          ELSE 0
        END as can_edit
      FROM events e
      LEFT JOIN club_events ce ON e.id = ce.event_id
      LEFT JOIN hubs h ON ce.club_id = h.id
      LEFT JOIN hub_members hm ON h.id = hm.hub_id AND hm.user_id = ?
      WHERE e.id = ?
    `).get(userId || 0, req.params.id);

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Check visibility permissions
    const clubEvent = db.prepare('SELECT * FROM club_events WHERE event_id = ?').get(req.params.id) as any;
    if (clubEvent) {
      const membership = db.prepare('SELECT role FROM hub_members WHERE hub_id = ? AND user_id = ?')
        .get(clubEvent.club_id, userId || 0) as any;

      if (clubEvent.visibility === 'private' && (!membership || !['leader', 'admin', 'creator'].includes(membership.role))) {
        return res.status(403).json({ error: 'Access denied' });
      }

      if (clubEvent.visibility === 'members_only' && !membership) {
        return res.status(403).json({ error: 'Access denied. Join the club to view this event.' });
      }
    }

    res.json(event);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const createEvent = (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { name, category, description, date, time, location, club_id, visibility, target_audience, specialization, capacity, color } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Check if user has permission to create events for this club
    if (club_id) {
      const membership = db.prepare('SELECT role FROM hub_members WHERE hub_id = ? AND user_id = ?')
        .get(club_id, userId) as any;

      if (!membership || !['leader', 'admin', 'creator'].includes(membership.role)) {
        return res.status(403).json({ error: 'Only club leaders, admins, and creators can create events' });
      }
    }

    // Get club name for organizer field
    const club = db.prepare('SELECT name FROM hubs WHERE id = ?').get(club_id) as any;
    const organizer = club ? club.name : 'Unknown';

    // Create event
    const result = db.prepare(`
      INSERT INTO events (name, category, description, date, time, location, organizer, specialization, capacity, color)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(name, category, description, date, time, location, organizer, specialization || null, capacity || 100, color || null);

    // Link event to club
    if (club_id) {
      db.prepare(`
        INSERT INTO club_events (event_id, club_id, visibility, target_audience)
        VALUES (?, ?, ?, ?)
      `).run(result.lastInsertRowid, club_id, visibility || 'public', target_audience || null);
    }

    res.status(201).json({ id: result.lastInsertRowid, message: 'Event created successfully' });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};

export const updateEvent = (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { visibility, target_audience, ...eventData } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Check permissions
    const clubEvent = db.prepare('SELECT club_id FROM club_events WHERE event_id = ?').get(req.params.id) as any;
    if (clubEvent) {
      const membership = db.prepare('SELECT role FROM hub_members WHERE hub_id = ? AND user_id = ?')
        .get(clubEvent.club_id, userId) as any;

      if (!membership || !['leader', 'admin', 'creator'].includes(membership.role)) {
        return res.status(403).json({ error: 'Only club leaders, admins, and creators can edit events' });
      }
    }

    // Update event
    if (Object.keys(eventData).length > 0) {
      const fields = Object.keys(eventData).map(k => `${k} = ?`).join(', ');
      const values = [...Object.values(eventData), req.params.id];
      db.prepare(`UPDATE events SET ${fields} WHERE id = ?`).run(...values);
    }

    // Update club event settings
    if (clubEvent && (visibility || target_audience)) {
      const updates: string[] = [];
      const values: any[] = [];

      if (visibility) {
        updates.push('visibility = ?');
        values.push(visibility);
      }
      if (target_audience) {
        updates.push('target_audience = ?');
        values.push(target_audience);
      }

      if (updates.length > 0) {
        values.push(req.params.id);
        db.prepare(`UPDATE club_events SET ${updates.join(', ')} WHERE event_id = ?`).run(...values);
      }
    }

    res.json({ success: true, message: 'Event updated successfully' });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};

export const deleteEvent = (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Check permissions
    const clubEvent = db.prepare('SELECT club_id FROM club_events WHERE event_id = ?').get(req.params.id) as any;
    if (clubEvent) {
      const membership = db.prepare('SELECT role FROM hub_members WHERE hub_id = ? AND user_id = ?')
        .get(clubEvent.club_id, userId) as any;

      if (!membership || !['leader', 'admin', 'creator'].includes(membership.role)) {
        return res.status(403).json({ error: 'Only club leaders, admins, and creators can delete events' });
      }
    }

    db.prepare('DELETE FROM events WHERE id = ?').run(req.params.id);
    res.json({ success: true, message: 'Event deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

// Get events for dashboard (upcoming events prioritizing user's clubs)
export const getDashboardEvents = (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;

    const events = db.prepare(`
      SELECT 
        e.*,
        ce.club_id,
        ce.visibility,
        h.name as club_name,
        h.icon as club_icon,
        h.color as club_color,
        CASE WHEN hm.user_id IS NOT NULL THEN 1 ELSE 0 END as is_member
      FROM events e
      LEFT JOIN club_events ce ON e.id = ce.event_id
      LEFT JOIN hubs h ON ce.club_id = h.id
      LEFT JOIN hub_members hm ON h.id = hm.hub_id AND hm.user_id = ?
      WHERE 
        (ce.visibility = 'public' OR (ce.visibility = 'members_only' AND hm.user_id IS NOT NULL) OR ce.visibility IS NULL)
        AND date(e.date) >= date('now')
      ORDER BY is_member DESC, e.date ASC
      LIMIT 3
    `).all(userId || 0);

    res.json(events);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};
