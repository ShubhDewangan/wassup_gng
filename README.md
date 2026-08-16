![Node](https://img.shields.io/badge/Node.js-18-green)
![React](https://img.shields.io/badge/React-18-blue)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-brightgreen)
![Socket.IO](https://img.shields.io/badge/Socket.IO-realtime-black)
![License](https://img.shields.io/badge/license-MIT-lightgrey)

<div align="center">
  <!-- <img src="assets/logo.png" width="100" alt="Wassup logo" /> -->
  <h1>Wassup?!</h1>
  <p>Real-time chat app built with React, Node.js, WebSockets, MongoDB, and quick auth using google Authentication.</p>
</div>

---

<!-- <p align="center">
  <img src="assets/demo.gif" width="650" alt="Wassup demo" />
</p> -->

## All About WASSUP?!

Wassup is a real-time messaging app that lets users sign in with their Google account and chat instantly over WebSocket connections. Built to explore full-stack real-time architecture — Socket.IO for live message delivery, Google OAuth for auth, and MongoDB for Database.

**[Live Demo →](https://wassupgng.vercel.app)**

## Features

- Sign in with Google — quick 2-3 click signup, no remembering the password!
- Real-time one-to-one and group messaging over WebSockets
- Online/offline presence indicators
- Typing indicators
- Persistent chat history stored in MongoDB
- Responsive UI, works on mobile and desktop

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React, WebSocket API |
| Backend | Node.js, Express, WebSocket |
| Database | MongoDB (Mongoose) |
| Auth | Google OAuth 2.0 (Passport.js) |
| Deployment | Vercel (frontend), Render/Railway (backend) |

email-pass is also an option to be opened in future but currently not in use (already coded but not linked)

## Getting Started

### Prerequisites

- Node.js v18+
- A MongoDB Atlas cluster (or local MongoDB instance)
- A Google Cloud project with OAuth 2.0 credentials ([console.cloud.google.com](https://console.cloud.google.com))

### 1. Clone the repo

```bash
git clone https://github.com/your-username/wassup.git
cd wassup
```

### 2. Set up environment variables

Create a `.env` in `/backend` (use `.env.example` as a reference):

```env
NODE_RUN_TYPE=production or development(if using on localhost)
PORT=8000
MONGO_URI=your_mongodb_connecting_string
JWT_SECRET=your_jwt_secret
NEXT_ORIGIN=http://localhost:3000
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:3000
IMAGEKIT_PUBLIC_KEY=your_imagekit_public_key
IMAGEKIT_PRIVATE_KEY=your_imagekit_private_key
IMAGEKIT_URL_ENDPOINT=your_imagekit_endpoint_url
```

And in `/frontend`:

```env
VITE_API_URL=http://localhost:8000
VITE_WS_URL=ws://localhost:8000
VITE_GOOGLE_CLIENT_ID=same_as_backend_google_client_id
```

<details>
<summary>How to get Google OAuth credentials</summary>

1. Go to [Google Cloud Console](https://console.cloud.google.com) → create a new project
2. Navigate to **APIs & Services → Credentials**
3. Click **Create Credentials → OAuth client ID**
4. Choose **Web application**, add `http://localhost:3000` under authorized origins
5. Copy the generated Client ID and Client Secret into your `.env` files

</details>

### 3. Install dependencies

```bash
# backend
npm install

# frontend
npm install
```

### 4. Run locally

```bash
# terminal 1 — backend
npm run dev

# terminal 2 — frontend
npm run dev
```

App should now be running at `http://localhost:3000`.

## Roadmap / Limitations

- [ ] Message read receipts
- [ ] Group chat admin controls
- [ ] Currently no message encryption — planned for a future iteration

## Contributing

Contributions, issues, and feature requests are welcome. Feel free to check the [issues page](https://github.com/ShubhDewangan/wassup/issues).

## License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

<div align="center">
  Built by <a href="https://github.com/ShubhDewangan">Shubh Dewangan</a>
</div>
