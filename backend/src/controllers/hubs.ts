import { Request, Response } from 'express';
import * as model from '../model.js';

export const createHub = (req: Request, res: Response) => {
  try {
    const { name, type, description, creator_id, icon, specialization, year, color, interests } = req.body;
    const result = model.createHub(name, type, description, creator_id, { icon, specialization, year, color });
    const hubId = result.lastInsertRowid;
    
    model.addHubMember(hubId as number, creator_id, 'creator');
    
    if (interests && Array.isArray(interests)) {
      interests.forEach((interest: string) => {
        model.addHubInterest(hubId as number, interest);
      });
    }
    
    res.status(201).json({ id: hubId, message: 'Hub created successfully' });
  } catch (error) {
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
