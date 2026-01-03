# 🎬 Movie Info App

A modern, dynamic movie discovery web application that allows users to explore trending movies, watch trailers, and manage their personal favorites and watchlists.

![Project Status](https://img.shields.io/badge/Status-Active-success)
![License](https://img.shields.io/badge/License-MIT-blue)

## ✨ Features

*   **🎥 Movie Discovery**: Browse Trending, Top Rated, and Upcoming movies using the TMDB API.
*   **🔍 Search & Filter**: Powerful search functionality to find movies by title, genre, or actor.
*   **👤 User Authentication**: Secure Login and Registration system powered by **Supabase**.
*   **❤️ Favorites & Watchlist**: Authenticated users can save movies to their personal lists (stored in Supabase Database).
*   **💬 Reviews & Ratings**: Users can leave ratings and reviews for movies.
*   **🎞️ Trailer Feed**: A TikTok/YouTube Shorts style vertical scrolling feed for watching movie trailers.
*   **🎭 Cast & Crew**: Detailed profiles for actors with their biography and filmography.
*   **🛠️ Admin Panel**: Special dashboard for administrators to manage users and content.
*   **📱 Responsive Design**: Fully optimized for Desktop, Tablet, and Mobile devices.

## 🛠️ Tech Stack

### Frontend
*   **React.js** (Vite)
*   **Tailwind CSS** (Styling)
*   **Framer Motion** (Animations)
*   **React Router** (Navigation)
*   **Axios** (API Requests)

### Backend
*   **Node.js & Express**
*   **Supabase** (Database & Auth Helper)
*   **TMDB API** (Movie Data Source)

## 🚀 How It Was Built

This project was built to demonstrate a full-stack migration and modern web development practices:
1.  **Migration**: Originally built with MongoDB, migrated to **Supabase** (PostgreSQL) for better scalability and relational data handling.
2.  **Architecture**: Uses a **Client-Server** architecture where the Frontend talks to a Node.js Backend, which then securely communicates with Supabase and TMDB.
3.  **UI/UX**: Focuses on a premium "Dark Mode" aesthetic with glassmorphism effects and smooth transitions.

## ⚙️ Installation & Setup

1.  **Clone the repository**
    ```bash
    git clone https://github.com/semsurti4307-pixel/Movie-Info.git
    cd Movie-Info
    ```

2.  **Install Dependencies**
    *   Client:
        ```bash
        cd client
        npm install
        ```
    *   Server:
        ```bash
        cd ../server
        npm install
        ```

3.  **Environment Variables**
    Create `.env` files in both `client` and `server` directories with your keys (Supabase, TMDB).

4.  **Run the App**
    *   Start Server: `cd server && npm start`
    *   Start Client: `cd client && npm run dev`

---
*Built with ❤️ by Sem Surti*
