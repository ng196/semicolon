import { Request, Response } from 'express';
import * as model from '../models/index.js';

export const getAllRequests = async (req: Request, res: Response) => {
  try {
    const requests = await model.getAllRequests();
    res.json(requests);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const getRequest = async (req: Request, res: Response) => {
  try {
    const request = await model.getRequest(parseInt(req.params.id));
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }
    res.json(request);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const createRequest = async (req: Request, res: Response) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] 📋 CREATE Request:`, JSON.stringify(req.body, null, 2));

  try {
    const { title, description, type, submitted_to, category, submitter_id, supporters, required, progress, resolution, response_time, submitted_at } = req.body;

    console.log(`[${timestamp}] 🔍 Fetching submitter info for submitter_id:`, submitter_id || 1);

    const submitter = await model.getUser(submitter_id || 1) as any;
    if (!submitter) {
      console.error(`[${timestamp}] ❌ Submitter not found:`, submitter_id);
      return res.status(400).json({ error: 'Submitter not found' });
    }

    console.log(`[${timestamp}] ✅ Submitter found:`, submitter.name);
    console.log(`[${timestamp}] 💾 Inserting request into database...`);

    const result = await model.createRequest({
      title,
      description,
      type,
      submitted_to,
      category,
      submitter_id: submitter_id || 1,
      submitter_name: submitter.name,
      submitter_avatar: submitter.avatar,
      supporters,
      required,
      progress,
      resolution,
      response_time,
      submitted_at
    });

    console.log(`[${timestamp}] ✅ Request created with ID:`, result.lastInsertRowid);

    res.status(201).json({ id: result.lastInsertRowid, message: 'Request created successfully' });
  } catch (error) {
    console.error(`[${timestamp}] ❌ Error creating request:`, (error as Error).message);
    console.error(`[${timestamp}] 📚 Stack:`, (error as Error).stack);
    res.status(400).json({ error: (error as Error).message });
  }
};

export const updateRequest = async (req: Request, res: Response) => {
  try {
    await model.updateRequest(parseInt(req.params.id), req.body);
    res.json({ success: true, message: 'Request updated successfully' });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};

export const deleteRequest = async (req: Request, res: Response) => {
  try {
    await model.deleteRequest(parseInt(req.params.id));
    res.json({ success: true, message: 'Request deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};
