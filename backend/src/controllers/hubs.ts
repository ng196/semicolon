import { Request, Response } from 'express';
import * as model from '../models/index.js';

export const createHub = (req: Request, res: Response) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] 🏢 CREATE Hub Request:`, JSON.stringify(req.body, null, 2));

  try {
    const { name, type, description, creator_id, icon, specialization, year, color, interests } = req.body;

    console.log(`[${timestamp}] 💾 Creating hub in database...`);
    const result = model.createHub(name, type, description, creator_id, { icon, specialization, year, color });
    const hubId = result.lastInsertRowid;

    console.log(`[${timestamp}] ✅ Hub created with ID:`, hubId);
    console.log(`[${timestamp}] 📊 Changes:`, result.changes);

    // Add creator as leader for clubs, creator for projects
    const creatorRole = type === 'Club' ? 'leader' : 'creator';
    console.log(`[${timestamp}] 👤 Adding creator as ${creatorRole}...`);
    model.addHubMember(hubId as number, creator_id, creatorRole);

    // Create club settings if this is a club
    if (type === 'Club') {
      console.log(`[${timestamp}] ⚙️  Creating club settings...`);
      model.createClubSettings(hubId as number, false, true);
    }

    if (interests && Array.isArray(interests)) {
      console.log(`[${timestamp}] 🏷️  Adding ${interests.length} interests...`);
      interests.forEach((interest: string) => {
        model.addHubInterest(hubId as number, interest);
      });
    }

    console.log(`[${timestamp}] ✅ Hub creation complete`);
    res.status(201).json({ id: hubId, message: 'Hub created successfully' });
  } catch (error) {
    console.error(`[${timestamp}] ❌ Error creating hub:`, (error as Error).message);
    console.error(`[${timestamp}] 📚 Stack:`, (error as Error).stack);
    res.status(400).json({ error: (error as Error).message });
  }
};

export const getHub = (req: Request, res: Response) => {
  try {
    const hub = model.getHub(parseInt(req.params.id!));
    if (!hub) {
      return res.status(404).json({ error: 'Hub not found' });
    }
    res.json(hub);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const getAllHubs = (req: Request, res: Response) => {
  try {
    const { type } = req.query;
    const hubs = type ? model.getHubsByType(type as string) : model.getAllHubs();
    res.json(hubs);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const updateHub = (req: Request, res: Response) => {
  try {
    model.updateHub(parseInt(req.params.id!), req.body);
    res.json({ success: true, message: 'Hub updated successfully' });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};

export const deleteHub = (req: Request, res: Response) => {
  try {
    model.deleteHub(parseInt(req.params.id!));
    res.json({ success: true, message: 'Hub deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const getHubMembers = (req: Request, res: Response) => {
  try {
    const members = model.getHubMembers(parseInt(req.params.id!));
    res.json(members);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const addMember = (req: Request, res: Response) => {
  try {
    const { user_id, role } = req.body;
    model.addHubMember(parseInt(req.params.id!), user_id, role || 'member');
    res.status(201).json({ success: true, message: 'Member added successfully' });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};

export const removeMember = (req: Request, res: Response) => {
  try {
    const { user_id } = req.body;
    model.removeHubMember(parseInt(req.params.id!), user_id);
    res.json({ success: true, message: 'Member removed successfully' });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};

export const checkMembership = (req: Request, res: Response) => {
  try {
    const hubId = parseInt(req.params.id!);
    const userId = parseInt(req.params.userId!);
    const membership = model.checkHubMembership(hubId, userId);
    res.json(membership || { isMember: false });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};
