# 🚀 EcoLoop Quick Start

Get EcoLoop running in under 10 minutes!

## Prerequisites

- Node.js 18+
- Git
- MongoDB Atlas account (free)
- Cloudinary account (free)
- Google Gemini API key (optional, for AI chatbot)

## 1. Clone & Install

```bash
git clone https://github.com/yourusername/ecoloop.git
cd ecoloop

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

## 2. Environment Setup

### Backend (.env)
```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:
```env
PORT=4000
MONGO_URI=mongodb+srv://youruser:yourpass@cluster.mongodb.net/ecoloop
JWT_SECRET=your_super_secret_jwt_key_here
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
GEMINI_API_KEY=your_gemini_key_optional
```

### Frontend (.env)
```bash
cd ../frontend
cp .env.example .env
```

Edit `frontend/.env`:
```env
VITE_API_BASE=http://localhost:4000
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
```

## 3. Database Setup

1. Create MongoDB Atlas cluster
2. Add IP whitelist: `0.0.0.0/0`
3. Create database user
4. Copy connection string to MONGO_URI

## 4. Seed Demo Data

```bash
cd backend
npm run seed
```

Creates demo users:
- alice@example.com / password123
- bob@example.com / password123
- charlie@example.com / password123

## 5. Run the App

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

## 6. Access

- Frontend: http://localhost:5173
- Backend API: http://localhost:4000

## 7. Test Features

1. Register/Login
2. Post an item with image
3. Browse items on map
4. Chat with EcoBot AI
5. Check admin dashboard
6. View carbon savings

## Troubleshooting

- **Port conflicts**: Change PORT in backend/.env
- **MongoDB connection**: Check IP whitelist and credentials
- **Image uploads**: Verify Cloudinary settings
- **AI Chatbot**: Add GEMINI_API_KEY for responses

## Next Steps

- Follow IMPLEMENTATION_GUIDE.md for advanced features
- Check FEATURES_CHECKLIST.md for completion status
- Review FIXES_APPLIED.md for known issues