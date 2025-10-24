import { db } from '../db.js';

export const createEvent = (data: any) => {
    const stmt = db.prepare(`
    INSERT INTO events (name, category, description, date, time, location, organizer, specialization, capacity, color)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
    return stmt.run(
        data.name,
        data.category,
        data.description,
        data.date,
        data.time,
        data.location,
        data.organizer,
        data.specialization || null,
        data.capacity || 100,
        data.color || null
    );
};

export const getEvent = (id: number, userId?: number) => {
    const stmt = db.prepare(`
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
  `);
    return stmt.get(userId || 0, id);
};

export const getAllEvents = (userId?: number) => {
    const stmt = db.prepare(`
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
  `);
    return stmt.all(userId || 0);
};

export const getDashboardEvents = (userId?: number) => {
    const stmt = db.prepare(`
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
  `);
    return stmt.all(userId || 0);
};

export const updateEvent = (id: number, data: any) => {
    const fields = Object.keys(data).map(k => `${k} = ?`).join(', ');
    const values = [...Object.values(data), id];
    const stmt = db.prepare(`UPDATE events SET ${fields} WHERE id = ?`);
    return stmt.run(...values);
};

export const deleteEvent = (id: number) => {
    const stmt = db.prepare('DELETE FROM events WHERE id = ?');
    return stmt.run(id);
};

export const linkEventToClub = (event_id: number, club_id: number, visibility: string = 'public', target_audience?: string) => {
    const stmt = db.prepare(`
    INSERT INTO club_events (event_id, club_id, visibility, target_audience)
    VALUES (?, ?, ?, ?)
  `);
    return stmt.run(event_id, club_id, visibility, target_audience || null);
};

export const updateClubEventSettings = (event_id: number, data: any) => {
    const fields = Object.keys(data).map(k => `${k} = ?`).join(', ');
    const values = [...Object.values(data), event_id];
    const stmt = db.prepare(`UPDATE club_events SET ${fields} WHERE event_id = ?`);
    return stmt.run(...values);
};

export const getClubEventInfo = (event_id: number) => {
    const stmt = db.prepare('SELECT * FROM club_events WHERE event_id = ?');
    return stmt.get(event_id);
};
