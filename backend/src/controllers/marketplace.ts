import { Request, Response } from 'express';
import * as model from '../models/index.js';
// import db from '../db.js';

export const getAllItems = async (req: Request, res: Response) => {
  try {
    const items = await model.getAllMarketplaceItems();
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const getItem = async (req: Request, res: Response) => {
  try {
    const item = await model.getMarketplaceItem(parseInt(req.params.id));
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const createItem = async (req: Request, res: Response) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] 🛒 CREATE Marketplace Item Request:`, JSON.stringify(req.body, null, 2));

  try {
    const { title, description, price, type, category, condition, image, seller_id, posted_at } = req.body;

    console.log(`[${timestamp}] 🔍 Fetching seller info for seller_id:`, seller_id || 1);

    // Fetch seller info from users table
    const seller = await model.getUser(seller_id || 1) as any;
    if (!seller) {
      console.error(`[${timestamp}] ❌ Seller not found:`, seller_id);
      return res.status(400).json({ error: 'Seller not found' });
    }

    console.log(`[${timestamp}] ✅ Seller found:`, seller.name);

    const result = await model.createMarketplaceItem({
      title,
      description,
      price,
      type,
      category,
      condition,
      image,
      seller_id: seller_id || 1,
      seller_name: seller.name,
      seller_avatar: seller.avatar,
      seller_rating: 4.5,
      posted_at: posted_at || 'just now'
    });

    console.log(`[${timestamp}] ✅ Marketplace item created with ID:`, result.lastInsertRowid);

    res.status(201).json({ id: result.lastInsertRowid, message: 'Item created successfully' });
  } catch (error) {
    console.error(`[${timestamp}] ❌ Error creating marketplace item:`, (error as Error).message);
    console.error(`[${timestamp}] 📚 Stack:`, (error as Error).stack);
    res.status(400).json({ error: (error as Error).message });
  }
};

export const updateItem = async (req: Request, res: Response) => {
  try {
    await model.updateMarketplaceItem(parseInt(req.params.id), req.body);
    res.json({ success: true, message: 'Item updated successfully' });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};

export const deleteItem = async (req: Request, res: Response) => {
  try {
    await model.deleteMarketplaceItem(parseInt(req.params.id));
    res.json({ success: true, message: 'Item deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};
