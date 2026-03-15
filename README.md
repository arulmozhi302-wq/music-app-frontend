🎵 TuneFlow – MERN Music Streaming App

TuneFlow is a full-stack music streaming application built using the MERN stack.
Users can browse songs, stream music, create playlists, like tracks, and interact through comments.

The project demonstrates full-stack development, API integration, authentication, and cloud media storage.

🚀 Live Demo

Frontend

https://music-app-frontend-roan.vercel.app

Backend API

https://music-app-backend-tawny.vercel.app

API Example

/api/songs

🛠 Tech Stack

Frontend
    React
    Vite
    Tailwind CSS
    Axios

Backend
    Node.js    
    Express.js    
    JWT Authentication

Database
    MongoDB    
    MongoDB Atlas

Media Storage
    Cloudinary

Deployment
    Vercel
    

✨ Features

🎵 Stream songs

❤️ Like songs

💬 Comment on tracks

📂 Create playlists

🔐 User authentication (JWT)

☁ Cloud audio storage using Cloudinary

📊 Play count tracking

📱 Responsive UI

📁 Project Structure
TuneFlow
│
├── frontend
│   ├── src
│   ├── components
│   ├── pages
│   └── services
│
├── backend
│   ├── models
│   ├── routes
│   ├── middleware
│   ├── config
│   └── server.js
⚙️ Environment Variables

Frontend .env

VITE_API_URL=https://music-app-backend-tawny.vercel.app/api

Backend .env

MONGODB_URI=your_mongodb_connection
JWT_SECRET=your_secret
CLOUDINARY_CLOUD_NAME=your_cloud
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret

📦 Installation

Clone the repository
git clone https://github.com/yourusername/tuneflow.git

Install dependencies
    npm install

Run backend
    npm run dev

Run frontend
    npm run dev

📡 API Endpoints

Songs

GET /api/songs
POST /api/songs
GET /api/songs/:id

Auth

POST /api/auth/register
POST /api/auth/login

Playlists

GET /api/playlists
POST /api/playlists
👨‍💻 Author


Arulmozhi D
Frontend Developer | MERN Stack Developer
