# Estimate Backend API

Backend service for Estimate platform - handles LinkedIn OAuth authentication securely.

## Features

- LinkedIn OAuth 2.0 token exchange
- User profile fetching
- CORS enabled for frontend
- Health check endpoint

## Endpoints

### `GET /health`
Health check endpoint
- Returns: `{ status: 'ok', message: 'Estimate Backend API is running' }`

### `POST /api/auth/linkedin/callback`
LinkedIn OAuth callback handler
- Body: `{ code: string, redirect_uri: string }`
- Returns: `{ access_token: string, expires_in: number, profile: object }`

## Environment Variables

Required environment variables (set in Render dashboard):

```
LINKEDIN_CLIENT_ID=your_client_id
LINKEDIN_CLIENT_SECRET=your_client_secret
FRONTEND_URL=https://estimatenow.io
PORT=3001
```

## Local Development

```bash
cd backend
npm install
npm run dev
```

## Deployment to Render

1. Push code to GitHub
2. Create new Web Service in Render
3. Connect to your GitHub repository
4. Set Root Directory: `backend`
5. Build Command: `npm install`
6. Start Command: `npm start`
7. Add environment variables in Render dashboard
8. Deploy!

## Security

- Client secret is kept server-side only
- CORS configured to only allow requests from your frontend
- No sensitive data logged
