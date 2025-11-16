# EcoLoop

**Tagline:** "One person's waste is another's resource."

MERN stack application to reduce waste and promote a circular economy by connecting people to give, trade, or upcycle items instead of throwing them away.

---

## 🌟 Features

✅ Modern responsive UI with Tailwind CSS  
✅ **Dark/Light theme toggle** (persists in localStorage)  
✅ JWT authentication & protected routes  
✅ **Full CRUD operations** (Create, Read, Update, Delete items)  
✅ Cloudinary image uploads  
✅ Interactive map with item markers (Leaflet + OpenStreetMap)  
✅ Real-time messaging via Socket.io  
✅ Eco-points gamification & leaderboard  
✅ **🤖 AI Sustainability Chatbot (EcoBot)** with Google Gemini  
✅ **🎯 Personalized Recommendations** based on user preferences  
✅ **🌱 Carbon Savings Calculator** showing environmental impact  
✅ **📊 Admin Analytics Dashboard** with Chart.js visualizations  
✅ **🍞 Toast Notifications** for better UX feedback  
✅ Mobile-friendly design

---

## 🚀 Complete Setup Guide

### Step 1: Prerequisites

Install these before starting:

- **Node.js 18+** - [Download here](https://nodejs.org/)
- **Git** (to clone the repo)

### Step 2: Get Your API Credentials

You'll need free accounts for these services:

#### **MongoDB Atlas** (Database)

1. Sign up at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create a **free M0 cluster**
3. Go to **Database Access** → Create a database user (username + password)
4. Go to **Network Access** → Add IP Address → **Allow access from anywhere** (`0.0.0.0/0`)
5. Click **Connect** → **Connect your application** → Copy the connection string
6. It looks like: `mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`

#### **Cloudinary** (Image Storage)

1. Sign up at [cloudinary.com](https://cloudinary.com/)
2. Go to your **Dashboard**
3. Copy these 3 values:
   - Cloud Name
   - API Key
   - API Secret

#### **Google Gemini** (AI Chatbot - Optional)

1. Sign up at [ai.google.dev](https://ai.google.dev/)
2. Click **"Get API key in Google AI Studio"**
3. Create a new API key
4. Copy the key (starts with `AI...`)

**Note:** The chatbot will work without this key, but will show a setup message instead of AI responses.

---

### Step 3: Configure Environment Variables

#### Backend Configuration

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env` with your credentials:

```env
PORT=4000
MONGO_URI=mongodb+srv://youruser:yourpassword@cluster0.xxxxx.mongodb.net/ecoloop?retryWrites=true&w=majority
JWT_SECRET=change_this_to_a_random_secret_string_at_least_32_characters_long
CLOUDINARY_CLOUD_NAME=your_cloud_name_here
CLOUDINARY_API_KEY=your_api_key_here
CLOUDINARY_API_SECRET=your_api_secret_here
GEMINI_API_KEY=your_gemini_api_key_here_optional
```

**Important:**

- Replace `youruser` and `yourpassword` in MONGO_URI with your MongoDB credentials
- Generate a strong JWT_SECRET (or use: `openssl rand -base64 32`)

#### Frontend Configuration

```bash
cd frontend
cp .env.example .env
```

Edit `frontend/.env`:

```env
VITE_API_BASE=http://localhost:4000
VITE_CLOUDINARY_CLOUD_NAME=dt5gr9gqr
```

**Note:** Maps are focused on Kenya and use OpenStreetMap (no API key needed).

---

### Step 4: Install Dependencies

```bash
# Backend dependencies
cd backend
npm install

# Frontend dependencies
cd ../frontend
npm install
```

---

### Step 5: Seed Demo Data (Recommended)

This creates 3 demo users and 15 sample items:

```bash
cd backend
npm run seed
```

✅ **Success!** Demo accounts created:

- `alice@example.com` / `password123` (40 eco-points)
- `bob@example.com` / `password123` (25 eco-points)
- `charlie@example.com` / `password123` (10 eco-points)

---

### Step 6: Run the Application

**You need TWO terminal windows open:**

#### Terminal 1 - Start Backend

```bash
cd backend
npm run dev
```

✅ You should see:

```
API server running on port 4000
```

#### Terminal 2 - Start Frontend

```bash
cd frontend
npm run dev
```

✅ You should see:

```
VITE ready in XXX ms
Local: http://localhost:5173/
```

---

### Step 7: Access & Test the App

1. **Open your browser:** Go to `http://localhost:5173/`

2. **You'll see the Preview/Landing page** with:

   - Hero section
   - Feature cards (Post Items, Discover Nearby, Earn Eco-Points)
   - Impact statistics
   - "Login" and "Create Account" buttons

3. **Click "Login"** and use demo credentials:

   - Email: `alice@example.com`
   - Password: `password123`

4. **After login, you'll see the Discover page** with:

   - Interactive map showing item locations
   - 15 sample items with images
   - Filter by category and price type

5. **Test these features:**
   - 🌙 **Theme toggle:** Click moon/sun icon (top right nav) to switch dark/light mode
   - 🎯 **Recommendations:** See personalized item suggestions on Discover page
   - 🤖 **EcoBot:** Click "EcoBot 🌿" to chat with AI sustainability assistant
   - **Post Item:** Click "Post" → Fill form → Upload image → Publish (earns +10 eco-points)
   - **Item Details:** Click any item card to see full details + carbon savings estimate
   - **Edit/Delete:** In "My Items", edit or delete your listings
   - **My Items:** View items you've posted
   - **Leaderboard:** See rankings by eco-points
   - **Messages:** Real-time chat (requires receiver's user ID)
   - **Admin Dashboard:** View analytics charts and platform statistics

---

## 🎯 How to Use Key Features

### Posting an Item

1. Click **"Post"** in navbar
2. Fill in: Title, Description, Category, Condition, Type (Free/Exchange/Sell)
3. Upload a photo (stored in Cloudinary)
4. Click **"Publish Item"**
5. ✅ You earn **+10 eco-points** automatically!

### Editing/Deleting Items

1. Go to **"My Items"**
2. Click **"✏️ Edit"** to modify item details or upload new photo
3. Click **"🗑️ Delete"** to remove an item (with confirmation)

### Browsing Items

- Use filters to narrow by Category or Price Type
- Click **"Filter"** to refresh
- **Personalized recommendations** appear at the top based on your interests
- Map shows pins for items with locations
- Click any card to view details + **carbon savings impact**

### Using EcoBot 🌿 (AI Assistant)

1. Click **"EcoBot 🌿"** in navbar
2. Ask questions about:
   - Sustainability tips
   - How reusing helps the environment
   - Item categorization help
   - Circular economy concepts
3. Try quick prompts or type your own question
4. **Note:** Requires `GEMINI_API_KEY` in backend `.env`

### Messaging

- Need the receiver's MongoDB user ID (visible in seeded data or database)
- Type message and click "Send"
- Real-time delivery via Socket.io

### Theme Toggle

- Click 🌙 (moon) or ☀️ (sun) icon in navbar
- Theme persists across sessions (localStorage)

### Admin Dashboard

1. Navigate to `/admin` route
2. View platform statistics:
   - Total users, items, messages
   - Eco-points distribution
   - Items by category (bar chart)
   - Price type distribution (pie chart)
   - Top contributors leaderboard

---

## 📁 Project Structure

```
EcoLoop/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── env.js              # Environment config
│   │   ├── controllers/            # Business logic
│   │   │   ├── authController.js
│   │   │   ├── itemController.js
│   │   │   ├── messageController.js
│   │   │   ├── leaderboardController.js
│   │   │   ├── chatbotController.js  # AI chatbot
│   │   │   └── adminController.js    # Analytics
│   │   ├── middleware/
│   │   │   └── auth.js             # JWT verification
│   │   ├── models/                 # MongoDB schemas
│   │   │   ├── User.js
│   │   │   ├── Item.js
│   │   │   └── Message.js
│   │   ├── routes/                 # API endpoints
│   │   │   ├── authRoutes.js
│   │   │   ├── itemRoutes.js
│   │   │   ├── messageRoutes.js
│   │   │   ├── leaderboardRoutes.js
│   │   │   ├── chatbotRoutes.js
│   │   │   └── adminRoutes.js
│   │   ├── utils/
│   │   │   ├── jwt.js
│   │   │   └── cloudinary.js
│   │   ├── seed/
│   │   │   └── seed.js             # Demo data script
│   │   └── server.js               # Main entry point
│   ├── .env.example
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── MapView.jsx         # Leaflet map
│   │   ├── context/
│   │   │   ├── AuthContext.jsx     # Auth state
│   │   │   └── ThemeContext.jsx    # Dark/light theme
│   │   ├── pages/
│   │   │   ├── Preview.jsx         # Landing page
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Discover.jsx        # With recommendations
│   │   │   ├── PostItem.jsx
│   │   │   ├── EditItem.jsx        # Edit existing items
│   │   │   ├── ItemDetails.jsx     # With carbon calculator
│   │   │   ├── MyListings.jsx      # Edit/delete buttons
│   │   │   ├── Messages.jsx
│   │   │   ├── Chatbot.jsx         # AI assistant
│   │   │   ├── Leaderboard.jsx
│   │   │   └── AdminDashboard.jsx  # With charts
│   │   ├── services/
│   │   │   └── api.js              # Axios client
│   │   ├── App.jsx                 # Main router + toaster
│   │   ├── main.jsx                # React entry
│   │   └── index.css               # Global styles
│   ├── .env.example
│   └── package.json
│
└── README.md
```

---

## 🔧 API Endpoints

### Authentication

- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Login

### Items

- `GET /api/items` - List all items (with filters)
- `GET /api/items/recommendations` - Get personalized recommendations (auth)
- `GET /api/items/:id` - Get item details
- `POST /api/items` - Create item (auth required, +10 eco-points)
- `PUT /api/items/:id` - Update item (auth, owner only)
- `DELETE /api/items/:id` - Delete item (auth, owner only)

### Messages

- `POST /api/messages` - Send message (auth)
- `GET /api/messages/:userId` - Get user messages (auth)

### Leaderboard

- `GET /api/leaderboard` - Top users by eco-points (auth)

### Chatbot

- `POST /api/chatbot/chat` - Chat with AI assistant (auth)

### Admin

- `GET /api/admin/stats` - Get platform analytics (auth)

### Uploads

- `POST /api/uploads/signature` - Get Cloudinary upload signature

---

## 🐛 Troubleshooting

### Backend won't start

- ✅ Check `.env` file exists and has correct MongoDB URI
- ✅ Ensure MongoDB Atlas IP whitelist includes your IP
- ✅ Verify database user credentials are correct

### Frontend shows blank page

- ✅ Check backend is running on port 4000
- ✅ Verify `VITE_API_BASE=http://localhost:4000` in frontend `.env`
- ✅ Open browser console (F12) to see errors

### Image upload fails

- ✅ Check Cloudinary credentials in backend `.env`
- ✅ Verify `VITE_CLOUDINARY_CLOUD_NAME` matches backend

### Can't login with demo accounts

- ✅ Run `npm run seed` in backend folder first
- ✅ Check MongoDB connection is working

### Chatbot not responding

- ✅ Add `GEMINI_API_KEY` to backend `.env` file
- ✅ Get free API key at [ai.google.dev](https://ai.google.dev/)
- ✅ Chatbot will show setup instructions if key is missing

### Charts not displaying

- ✅ Make sure Chart.js is installed: `npm install chart.js react-chartjs-2`
- ✅ Check browser console for errors

---

## 🚢 Deployment

### Backend (Render/Railway/Fly.io)

1. Create a web service
2. Set environment variables from `.env`
3. Build command: `npm install`
4. Start command: `npm start`

### Frontend (Vercel/Netlify)

1. Connect your repo
2. Build command: `npm run build`
3. Output directory: `dist`
4. Set environment variables from `.env`

### Database

- Use MongoDB Atlas (already cloud-hosted)

---

## 📜 Scripts Reference

### Backend

```bash
npm run dev      # Start with nodemon (auto-restart)
npm start        # Start production
npm run seed     # Populate demo data
```

### Frontend

```bash
npm run dev      # Start dev server
npm run build    # Build for production
npm run preview  # Preview production build
```

---

## 🎨 Tech Stack

| Layer         | Technology                       |
| ------------- | -------------------------------- |
| Frontend      | React 18, Vite, Tailwind CSS     |
| Backend       | Node.js, Express                 |
| Database      | MongoDB (Mongoose)               |
| Auth          | JWT, bcrypt                      |
| Real-time     | Socket.io                        |
| Storage       | Cloudinary                       |
| Maps          | Leaflet + OpenStreetMap          |
| AI            | Google Gemini API                |
| Charts        | Chart.js, react-chartjs-2        |
| Notifications | react-hot-toast                  |
| Themes        | Dark/Light mode with Context API |

---

## 🌱 Future Enhancements

- AI image recognition (TensorFlow.js) to auto-categorize items
- Community challenges ("Save 10kg this month!")
- Push notifications for new messages
- PWA with offline support
- Advanced admin moderation (flagging, reports)
- User search for messaging
- Location-based distance UI with radius selector
- Image content moderation
- Multi-step post form with drag-and-drop
- Email notifications
- Social sharing features

---

## 📄 License

This project is open source and available under the MIT License.

---

## 🙋 Support

Having issues? Check:

1. All `.env` files are configured correctly
2. Both backend and frontend are running
3. MongoDB connection is active
4. API credentials are valid

**Still stuck?** Double-check the Troubleshooting section above!

---

**Built for SDG 12 — Responsible Consumption and Production 🌍**
