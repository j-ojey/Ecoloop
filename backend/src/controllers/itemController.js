import { Item } from '../models/Item.js';
import { User } from '../models/User.js';

export const createItem = async (req, res) => {
  try {
    const { title, description, category, condition, priceType, price, lat, lng, imageUrl } = req.body;
    const item = await Item.create({
      title,
      description,
      category,
      condition,
      priceType,
      price: price || 0,
      ownerId: req.user.id,
      imageUrl,
      location: { coordinates: lng && lat ? [lng, lat] : undefined }
    });
    // Award eco-points for contributing an item
    await User.findByIdAndUpdate(req.user.id, { $inc: { ecoPoints: 10 } });
    res.status(201).json(item);
  } catch (e) {
    res.status(500).json({ message: 'Server error', error: e.message });
  }
};

export const getItems = async (req, res) => {
  try {
    const { category, priceType, lat, lng, radiusKm } = req.query;
    const filter = {};
    if (category) filter.category = category;
    if (priceType) filter.priceType = priceType;
    if (lat && lng && radiusKm) {
      filter.location = {
        $nearSphere: {
          $geometry: { type: 'Point', coordinates: [Number(lng), Number(lat)] },
          $maxDistance: Number(radiusKm) * 1000
        }
      };
    }
    const items = await Item.find(filter).sort({ createdAt: -1 }).limit(100).populate('ownerId', 'name');
    res.json(items);
  } catch (e) {
    res.status(500).json({ message: 'Server error', error: e.message });
  }
};

export const getItemById = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id).populate('ownerId', 'name');
    if (!item) return res.status(404).json({ message: 'Not found' });
    res.json(item);
  } catch (e) {
    res.status(500).json({ message: 'Server error', error: e.message });
  }
};

export const updateItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, category, condition, priceType, price, imageUrl } = req.body;

    const item = await Item.findById(id);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // Check ownership
    if (item.ownerId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to edit this item' });
    }

    Object.assign(item, { title, description, category, condition, priceType, price, imageUrl });
    await item.save();

    res.json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteItem = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await Item.findById(id);

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    if (item.ownerId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this item' });
    }

    await item.deleteOne();
    res.json({ message: 'Item deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getRecommendations = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get user's posted items to understand preferences
    const userItems = await Item.find({ ownerId: userId });
    
    // Get categories user is interested in
    const userCategories = [...new Set(userItems.map(item => item.category))];
    
    // If user has no items, recommend recent popular items
    if (userCategories.length === 0) {
      const recommendations = await Item.find({ ownerId: { $ne: userId } })
        .limit(6)
        .populate('ownerId', 'name')
        .sort({ createdAt: -1 });
      return res.json(recommendations);
    }
    
    // Find similar items from other users based on category preferences
    const recommendations = await Item.find({
      category: { $in: userCategories },
      ownerId: { $ne: userId }
    })
      .limit(6)
      .populate('ownerId', 'name')
      .sort({ createdAt: -1 });
    
    // If not enough recommendations, fill with recent items
    if (recommendations.length < 6) {
      const additionalItems = await Item.find({
        ownerId: { $ne: userId },
        _id: { $nin: recommendations.map(r => r._id) }
      })
        .limit(6 - recommendations.length)
        .populate('ownerId', 'name')
        .sort({ createdAt: -1 });
      recommendations.push(...additionalItems);
    }
    
    res.json(recommendations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


