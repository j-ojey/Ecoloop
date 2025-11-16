import mongoose from 'mongoose';
import { config } from '../config/env.js';
import { User } from '../models/User.js';
import { Item } from '../models/Item.js';
import { Message } from '../models/Message.js';
import bcrypt from 'bcrypt';

async function run() {
  await mongoose.connect(config.mongoUri);
  console.log('Connected to MongoDB');

  // Clear existing minimal collections (avoid dropping indexes)
  await Promise.all([
    User.deleteMany({}),
    Item.deleteMany({}),
    Message.deleteMany({})
  ]);

  // Create users
  const pass = await bcrypt.hash('password123', 10);
  const users = await User.insertMany([
    { name: 'Alice', email: 'alice@example.com', passwordHash: pass, ecoPoints: 40, location: { coordinates: [ -0.09, 51.505 ] } },
    { name: 'Bob', email: 'bob@example.com', passwordHash: pass, ecoPoints: 25, location: { coordinates: [ -73.935242, 40.73061 ] } },
    { name: 'Charlie', email: 'charlie@example.com', passwordHash: pass, ecoPoints: 10, location: { coordinates: [ 2.3522, 48.8566 ] } }
  ]);

  const categories = ['Clothes', 'Electronics', 'Furniture', 'Other'];
  const conditions = ['New', 'Good', 'Used'];
  const priceTypes = ['Free', 'Exchange', 'Sell'];

  const sampleItems = [];
  for (let i = 0; i < 15; i++) {
    const owner = users[i % users.length];
    sampleItems.push({
      title: `Sample Item ${i + 1}`,
      description: 'Reusable item that reduces waste and promotes circular economy.',
      category: categories[i % categories.length],
      condition: conditions[i % conditions.length],
      priceType: priceTypes[i % priceTypes.length],
      price: priceTypes[i % priceTypes.length] === 'Sell' ? Math.round(Math.random() * 20) + 5 : 0,
      ownerId: owner._id,
      imageUrl: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
      location: { coordinates: owner.location.coordinates }
    });
  }

  const items = await Item.insertMany(sampleItems);

  // Messages between first two users
  await Message.insertMany([
    { senderId: users[0]._id, receiverId: users[1]._id, content: 'Hi Bob, is Sample Item 2 still available?' },
    { senderId: users[1]._id, receiverId: users[0]._id, content: 'Yes! Want to pick it up tomorrow?' },
    { senderId: users[0]._id, receiverId: users[1]._id, content: 'Perfect, thanks for keeping it out of landfill.' }
  ]);

  console.log('Seed completed:', { users: users.length, items: items.length });
  await mongoose.disconnect();
}

run().catch(err => { console.error(err); process.exit(1); });
