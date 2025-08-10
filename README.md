# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/4e97d629-8d4c-4db9-b375-9a8767f35d3a

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/4e97d629-8d4c-4db9-b375-9a8767f35d3a) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Set up environment variables (see Environment Setup section below)
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# Step 5: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
- Supabase (Backend & Database)

## Environment Setup

This project requires a Supabase backend. You'll need to set up the following environment variables:

### Required Environment Variables

Create a `.env.local` file in the root directory with:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### Optional Environment Variables

```env
# For routing features (OpenRouteService)
VITE_ORS_API_KEY=your-openrouteservice-api-key
```

### Getting Supabase Credentials

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Settings > API
3. Copy your Project URL and anon/public key
4. Apply the database schema from `supabase/schema.sql`
5. Optionally run `supabase/fix-auth-trigger.sql` for automatic profile creation

### Database Setup

The project includes SQL files in the `supabase/` directory:
- `schema.sql` - Main database schema with tables, RLS policies, and functions
- `fix-auth-trigger.sql` - Trigger for automatic user profile creation

## Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build

# Testing
npm run test:integration  # Run Supabase integration tests
npm run lint         # Run ESLint
```

### Integration Testing

The project includes comprehensive integration tests for the Supabase backend:

```bash
# Set environment variables and run tests
VITE_SUPABASE_URL=https://your-project.supabase.co \
VITE_SUPABASE_ANON_KEY=your-anon-key \
npm run test:integration
```

The integration tests cover:
- Authentication (sign up, sign in, password reset)
- User profile management
- Seller profile and drinks CRUD
- Location-based queries (find_nearby_sellers RPC)
- Real-time subscriptions
- Row Level Security (RLS) policies

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/4e97d629-8d4c-4db9-b375-9a8767f35d3a) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
