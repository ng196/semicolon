import { db } from '../db.js';

export const createMarketplaceItem = (data: any) => {
    const stmt = db.prepare(`
    INSERT INTO marketplace_items (title, description, price, type, category, condition, image, seller_id, seller_name, seller_avatar, seller_rating, posted_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
    return stmt.run(
        data.title,
        data.description,
        data.price,
        data.type,
        data.category,
        data.condition,
        data.image || null,
        data.seller_id,
        data.seller_name,
        data.seller_avatar,
        data.seller_rating || 4.5,
        data.posted_at || 'just now'
    );
};

export const getMarketplaceItem = (id: number) => {
    const stmt = db.prepare('SELECT * FROM marketplace_items WHERE id = ?');
    return stmt.get(id);
};

export const getAllMarketplaceItems = () => {
    const stmt = db.prepare('SELECT * FROM marketplace_items ORDER BY created_at DESC');
    return stmt.all();
};

export const updateMarketplaceItem = (id: number, data: any) => {
    const fields = Object.keys(data).map(k => `${k} = ?`).join(', ');
    const values = [...Object.values(data), id];
    const stmt = db.prepare(`UPDATE marketplace_items SET ${fields} WHERE id = ?`);
    return stmt.run(...values);
};

export const deleteMarketplaceItem = (id: number) => {
    const stmt = db.prepare('DELETE FROM marketplace_items WHERE id = ?');
    return stmt.run(id);
};
