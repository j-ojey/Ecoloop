import { Item } from '../models/Item.js';
import { User } from '../models/User.js';
import { calculateEcoPoints } from '../utils/ecoPoints.js';

export const createItem = async (req, res) => {
  try {
    const { title, description, category, condition, priceType, price, town, lat, lng, imageUrl } = req.body;
    if (!town || town.trim() === '') return res.status(400).json({ message: 'Town is required' });
    const item = await Item.create({
      title,
      description,
      category,
      condition,
      priceType,
      price: price || 0,
      ownerId: req.user.id,
      town,
      imageUrl,
      location: { coordinates: lng && lat ? [lng, lat] : undefined }
    });
    // Award eco-points based on CO2 savings for contributing an item
    const ecoPoints = calculateEcoPoints(category, 'create');
    await User.findByIdAndUpdate(req.user.id, { $inc: { ecoPoints } });
    res.status(201).json(item);
  } catch (e) {
    res.status(500).json({ message: 'Server error', error: e.message });
  }
};

export const getItems = async (req, res) => {
  try {
    const { category, priceType, town, condition, minPrice, maxPrice, lat, lng, radiusKm, sortBy } = req.query;
    const filter = {};
    if (category) filter.category = category;
    if (priceType) filter.priceType = priceType;
    if (condition) filter.condition = condition;
    if (minPrice || minPrice === '0') filter.price = { ...filter.price, $gte: Number(minPrice) };
    if (maxPrice) filter.price = { ...filter.price, $lte: Number(maxPrice) };
    if (town) filter.town = town;
    if (lat && lng && radiusKm) {
      filter.location = {
        $nearSphere: {
          $geometry: { type: 'Point', coordinates: [Number(lng), Number(lat)] },
          $maxDistance: Number(radiusKm) * 1000
        }
      };
    }
    // Sort options
    const sortObj = {};
    if (sortBy === 'oldest') sortObj.createdAt = 1;
    else if (sortBy === 'priceAsc') sortObj.price = 1;
    else if (sortBy === 'priceDesc') sortObj.price = -1;
    else sortObj.createdAt = -1; // newest default

    const items = await Item.find(filter).sort(sortObj).limit(100).populate('ownerId', 'name');
    res.json(items);
  } catch (e) {
    res.status(500).json({ message: 'Server error', error: e.message });
  }
};

export const getTowns = async (req, res) => {
  try {
    // Major towns in Kenya
    const majorTowns = [
      'Nairobi',
      'Mombasa',
      'Kisumu',
      'Nakuru',
      'Eldoret',
      'Thika',
      'Malindi',
      'Kitale',
      'Garissa',
      'Kakamega',
      'Voi',
      'Naivasha',
      'Kericho',
      'Meru',
      'Nyeri',
      'Embu',
      'Machakos',
      'Kajiado',
      'Lamu',
      'Wajir',
      'Mandera',
      'Marsabit',
      'Isiolo',
      'Samburu',
      'Turkana',
      'West Pokot',
      'Trans Nzoia',
      'Uasin Gishu',
      'Nandi',
      'Baringo',
      'Laikipia',
      'Narok',
      'Kiambu',
      'Murang\'a',
      'Kirinyaga',
      'Nyandarua',
      'Taita Taveta',
      'Kwale',
      'Kilifi',
      'Tana River',
      'Other'
    ];
    res.json(majorTowns);
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
    const { title, description, category, condition, priceType, price, town, imageUrl } = req.body;

    const item = await Item.findById(id);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // Check ownership
    if (item.ownerId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to edit this item' });
    }

    Object.assign(item, { title, description, category, condition, priceType, price, town, imageUrl });
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
    
    // Get user's interests
    const user = await User.findById(userId);
    const userInterests = user.interests || [];
    
    // If user has interests, recommend based on them
    if (userInterests.length > 0) {
      const recommendations = await Item.find({
        category: { $in: userInterests },
        ownerId: { $ne: userId },
        status: 'available'
      })
        .limit(6)
        .populate('ownerId', 'name')
        .sort({ createdAt: -1 });
      
      // If not enough recommendations, fill with recent items
      if (recommendations.length < 6) {
        const additionalItems = await Item.find({
          ownerId: { $ne: userId },
          status: 'available',
          _id: { $nin: recommendations.map(r => r._id) }
        })
          .limit(6 - recommendations.length)
          .populate('ownerId', 'name')
          .sort({ createdAt: -1 });
        recommendations.push(...additionalItems);
      }
      
      return res.json(recommendations);
    }
    
    // Fallback: Get user's posted items to understand preferences
    const userItems = await Item.find({ ownerId: userId });
    
    // Get categories user is interested in
    const userCategories = [...new Set(userItems.map(item => item.category))];
    
    // If user has no items, recommend recent popular items
    if (userCategories.length === 0) {
      const recommendations = await Item.find({ ownerId: { $ne: userId }, status: 'available' })
        .limit(6)
        .populate('ownerId', 'name')
        .sort({ createdAt: -1 });
      return res.json(recommendations);
    }
    
    // Find similar items from other users based on category preferences
    const recommendations = await Item.find({
      category: { $in: userCategories },
      ownerId: { $ne: userId },
      status: 'available'
    })
      .limit(6)
      .populate('ownerId', 'name')
      .sort({ createdAt: -1 });
    
    // If not enough recommendations, fill with recent items
    if (recommendations.length < 6) {
      const additionalItems = await Item.find({
        ownerId: { $ne: userId },
        status: 'available',
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

export const updateItemStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate status
    if (!['available', 'sold', 'exchanged'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const item = await Item.findById(id);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // Check ownership
    if (item.ownerId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this item' });
    }

    item.status = status;
    await item.save();

    // Award eco-points based on CO2 savings for successful exchange/sale
    if (status === 'sold' || status === 'exchanged') {
      const ecoPoints = calculateEcoPoints(item.category, 'complete');
      await User.findByIdAndUpdate(req.user.id, { $inc: { ecoPoints } });
    }

    res.json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


