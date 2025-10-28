import { Request, Response } from 'express';
import * as model from '../models/index.js';

export const getAllEvents = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const events = await model.getAllEvents(userId);
    res.json(events);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const getEvent = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const event = await model.getEvent(parseInt(req.params.id), userId);

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Check visibility permissions
    const clubEvent = await model.getClubEventInfo(parseInt(req.params.id)) as any;
    if (clubEvent) {
      const membership = await model.getUserClubRole(clubEvent.club_id, userId || 0);

      if (clubEvent.visibility === 'private' && (!membership || !['leader', 'admin', 'creator'].includes(membership))) {
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

export const createEvent = async (req: Request, res: Response) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] 📅 CREATE Event Request:`, JSON.stringify(req.body, null, 2));

  try {
    const userId = (req as any).user?.id;
    const { name, category, description, date, time, location, club_id, visibility, target_audience, specialization, capacity, color } = req.body;

    console.log(`[${timestamp}] 👤 User ID:`, userId);

    if (!userId) {
      console.error(`[${timestamp}] ❌ No user ID - authentication required`);
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Check if user has permission to create events for this club
    if (club_id) {
      console.log(`[${timestamp}] 🔍 Checking permissions for club_id:`, club_id);
      const role = await model.getUserClubRole(club_id, userId);

      console.log(`[${timestamp}] 👥 Role:`, role);

      if (!role || !['leader', 'admin', 'creator'].includes(role)) {
        console.error(`[${timestamp}] ❌ Insufficient permissions. Role:`, role);
        return res.status(403).json({ error: 'Only club leaders, admins, and creators can create events' });
      }
    }

    // Get club name for organizer field
    const club = await model.getHub(club_id) as any;
    const organizer = club ? club.name : 'Unknown';
    console.log(`[${timestamp}] 🏢 Organizer:`, organizer);

    // Create event
    console.log(`[${timestamp}] 💾 Inserting event into database...`);
    const result = await model.createEvent({
      name,
      category,
      description,
      date,
      time,
      location,
      organizer,
      specialization,
      capacity,
      color
    });

    console.log(`[${timestamp}] ✅ Event created with ID:`, result.lastInsertRowid);

    // Link event to club
    if (club_id) {
      console.log(`[${timestamp}] 🔗 Linking event to club...`);
      await model.linkEventToClub(result.lastInsertRowid as number, club_id, visibility, target_audience);
      console.log(`[${timestamp}] ✅ Event linked to club`);
    }

    res.status(201).json({ id: result.lastInsertRowid, message: 'Event created successfully' });
  } catch (error) {
    console.error(`[${timestamp}] ❌ Error creating event:`, (error as Error).message);
    console.error(`[${timestamp}] 📚 Stack:`, (error as Error).stack);
    res.status(400).json({ error: (error as Error).message });
  }
};

export const updateEvent = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { visibility, target_audience, ...eventData } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Check permissions
    const clubEvent = await model.getClubEventInfo(parseInt(req.params.id)) as any;
    if (clubEvent) {
      const role = await model.getUserClubRole(clubEvent.club_id, userId);

      if (!role || !['leader', 'admin', 'creator'].includes(role)) {
        return res.status(403).json({ error: 'Only club leaders, admins, and creators can edit events' });
      }
    }

    // Update event
    if (Object.keys(eventData).length > 0) {
      await model.updateEvent(parseInt(req.params.id), eventData);
    }

    // Update club event settings
    if (clubEvent && (visibility || target_audience)) {
      const updates: any = {};
      if (visibility) updates.visibility = visibility;
      if (target_audience) updates.target_audience = target_audience;

      if (Object.keys(updates).length > 0) {
        await model.updateClubEventSettings(parseInt(req.params.id), updates);
      }
    }

    res.json({ success: true, message: 'Event updated successfully' });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};

export const deleteEvent = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Check permissions
    const clubEvent = await model.getClubEventInfo(parseInt(req.params.id)) as any;
    if (clubEvent) {
      const role = await model.getUserClubRole(clubEvent.club_id, userId);

      if (!role || !['leader', 'admin', 'creator'].includes(role)) {
        return res.status(403).json({ error: 'Only club leaders, admins, and creators can delete events' });
      }
    }

    await model.deleteEvent(parseInt(req.params.id));
    res.json({ success: true, message: 'Event deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const getDashboardEvents = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const events = await model.getDashboardEvents(userId);
    res.json(events);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};
