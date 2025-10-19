import { Request, Response } from 'express';
import { db } from '../db.js';

export const getAllItems = (req: Request, res: Response) => {
  try {
    const items = db.prepare('SELECT * FROM marketplace_items ORDER BY created_at DESC').all();
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const getItem = (req: Request, res: Response) => {
  try {
    const item = db.prepare('SELECT * FROM marketplace_items WHERE id = ?').get(req.params.id);
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const createItem = (req: Request, res: Response) => {
  try {
    const { title, description, price, type, category, condition, image, seller_id, posted_at } = req.body;
    
    // Fetch seller info from users table
    const seller = db.prepare('SELECT name, avatar FROM users WHERE id = ?').get(seller_id || 1) as any;
    if (!seller) {
      return res.status(400).json({ error: 'Seller not found' });
    }
    
    const result = db.prepare(`
      INSERT INTO marketplace_items (title, description, price, type, category, condition, image, seller_id, seller_name, seller_avatar, seller_rating, posted_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      title, 
      description, 
      price, 
      type, 
      category, 
      condition, 
      image || null, 
      seller_id || 1, 
      seller.name,
      seller.avatar,
      4.5, // Default rating
      posted_at || 'just now'
    );
    
    res.status(201).json({ id: result.lastInsertRowid, message: 'Item created successfully' });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};

export const updateItem = (req: Request, res: Response) => {
  try {
    const fields = Object.keys(req.body).map(k => `${k} = ?`).join(', ');
    const values = [...Object.values(req.body), req.params.id];
    db.prepare(`UPDATE marketplace_items SET ${fields} WHERE id = ?`).run(...values);
    res.json({ success: true, message: 'Item updated successfully' });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};

export const deleteItem = (req: Request, res: Response) => {
  try {
    db.prepare('DELETE FROM marketplace_items WHERE id = ?').run(req.params.id);
    res.json({ success: true, message: 'Item deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};
