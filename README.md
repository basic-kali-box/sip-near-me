# Sip Near Me

A React-based marketplace application for finding local coffee and matcha sellers.

## Technologies Used

- **Frontend**: React 18 + TypeScript + Vite
- **UI Components**: shadcn/ui + Radix UI
- **Styling**: Tailwind CSS
- **Backend**: Supabase (Database, Auth, Storage)
- **Maps & Routing**: OpenRoute Service
- **State Management**: TanStack Query
- **Forms**: React Hook Form + Zod validation

## Features

- 🔐 User authentication (buyers and sellers)
- 🗺️ Interactive map with seller locations
- 🛣️ Route planning and navigation
- ☕ Drink menu management for sellers
- 📱 Responsive design
- 🔄 Real-time updates
- 📍 Location-based search

## Environment Variables

The following environment variables are required:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_OPENROUTE_API_KEY=your-openrouteservice-api-key
```

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Deployment

This project is configured for deployment on Vercel with the included `vercel.json` configuration.

### Deploy to Vercel

1. Install Vercel CLI: `npm i -g vercel`
2. Run `vercel` in the project directory
3. Follow the prompts to deploy
4. Set environment variables in Vercel dashboard:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_OPENROUTE_API_KEY`

### Environment Variables Setup

In your Vercel dashboard, add these environment variables:
- **VITE_SUPABASE_URL**: Your Supabase project URL
- **VITE_SUPABASE_ANON_KEY**: Your Supabase anonymous key
- **VITE_OPENROUTE_API_KEY**: OpenRoute Service API key for routing features

## Backend Setup

You'll need a Supabase project with the appropriate database schema. Contact the development team for the database setup files.
