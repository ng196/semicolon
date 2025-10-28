import { Request, Response } from 'express';
import * as model from '../models/index.js';

export const createHub = async (req: Request, res: Response) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] 🏢 CREATE Hub Request:`, JSON.stringify(req.body, null, 2));

  try {
    const { name, type, description, creator_id, icon, specialization, year, color, interests } = req.body;

    console.log(`[${timestamp}] 💾 Creating hub in database...`);
    const result = await model.createHub(name, type, description, creator_id, { icon, specialization, year, color });
    const hubId = result.lastInsertRowid;

    console.log(`[${timestamp}] ✅ Hub created with ID:`, hubId);

    // Add creator as leader for clubs, creator for projects
    const creatorRole = type === 'Club' ? 'leader' : 'creator';
    console.log(`[${timestamp}] 👤 Adding creator as ${creatorRole}...`);
    await model.addHubMember(hubId as number, creator_id, creatorRole);

    // Create club settings if this is a club
    if (type === 'Club') {
      console.log(`[${timestamp}] ⚙️  Creating club settings...`);
      await model.createClubSettings(hubId as number, false, true);
    }

    if (interests && Array.isArray(interests)) {
      console.log(`[${timestamp}] 🏷️  Adding ${interests.length} interests...`);
      for (const interest of interests) {
        await model.addHubInterest(hubId as number, interest);
      }
    }

    console.log(`[${timestamp}] ✅ Hub creation complete`);
    res.status(201).json({ id: hubId, message: 'Hub created successfully' });
  } catch (error) {
    console.error(`[${timestamp}] ❌ Error creating hub:`, (error as Error).message);
    console.error(`[${timestamp}] 📚 Stack:`, (error as Error).stack);
    res.status(400).json({ error: (error as Error).message });
  }
};

export const getHub = async (req: Request, res: Response) => {
  try {
    const hub = await model.getHub(parseInt(req.params.id!));
    if (!hub) {
      return res.status(404).json({ error: 'Hub not found' });
    }
    res.json(hub);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const getAllHubs = async (req: Request, res: Response) => {
  const startTime = Date.now();
  const timestamp = new Date().toISOString();
  console.log(`\n🌐 [${timestamp}] GET /hubs request received`);

  try {
    const { type } = req.query;
    console.log(`📋 [getAllHubs] Query params: type=${type || 'all'}`);

    const hubs = type ? await model.getHubsByType(type as string) : await model.getAllHubs();

    const totalTime = Date.now() - startTime;
    console.log(`✅ [getAllHubs] Request completed in ${totalTime}ms`);
    console.log(`📦 [getAllHubs] Returning ${hubs.length} hubs\n`);

    if (totalTime > 2000) {
      console.warn(`⚠️  [getAllHubs] SLOW REQUEST WARNING: ${totalTime}ms`);
    }

    res.json(hubs);
  } catch (error) {
    const totalTime = Date.now() - startTime;
    console.error(`❌ [getAllHubs] Request failed after ${totalTime}ms:`, (error as Error).message);
    res.status(500).json({ error: (error as Error).message });
  }
};

export const updateHub = async (req: Request, res: Response) => {
  try {
    await model.updateHub(parseInt(req.params.id!), req.body);
    res.json({ success: true, message: 'Hub updated successfully' });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};

export const deleteHub = async (req: Request, res: Response) => {
  try {
    await model.deleteHub(parseInt(req.params.id!));
    res.json({ success: true, message: 'Hub deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const getHubMembers = async (req: Request, res: Response) => {
  try {
    const members = await model.getHubMembers(parseInt(req.params.id!));
    res.json(members);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const addMember = async (req: Request, res: Response) => {
  try {
    const { user_id, role } = req.body;
    await model.addHubMember(parseInt(req.params.id!), user_id, role || 'member');
    res.status(201).json({ success: true, message: 'Member added successfully' });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};

export const removeMember = async (req: Request, res: Response) => {
  try {
    const { user_id } = req.body;
    await model.removeHubMember(parseInt(req.params.id!), user_id);
    res.json({ success: true, message: 'Member removed successfully' });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};

export const checkMembership = async (req: Request, res: Response) => {
  try {
    const hubId = parseInt(req.params.id!);
    const userId = parseInt(req.params.userId!);
    const membership = await model.checkHubMembership(hubId, userId);
    res.json(membership || { isMember: false });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};
