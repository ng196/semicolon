import { Request, Response } from 'express';
import * as model from '../models/index.js';

export const createUser = async (req: Request, res: Response) => {
  try {
    const { email, password_hash, username, name } = req.body;
    const result = await model.createUser(email, password_hash, username, name);
    res.status(201).json({ id: result.lastInsertRowid, message: 'User created successfully' });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};

export const getUser = async (req: Request, res: Response) => {
  try {
    const user = await model.getUser(parseInt(req.params.id!));
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const getAllUsers = async (_req: Request, res: Response) => {
  try {
    const users = await model.getAllUsers();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    await model.updateUser(parseInt(req.params.id!), req.body);
    res.json({ success: true, message: 'User updated successfully' });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    await model.deleteUser(parseInt(req.params.id!));
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};
