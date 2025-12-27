# InvestHub - Startup Investment Platform

A modern web application for connecting investors with promising startups. Built with React, TypeScript, and Supabase.

## Features

- **User Authentication**: Secure login and signup with email verification
- **Startup Discovery**: Browse and filter startups by sector, funding stage, and more
- **AI-Powered Matching**: Get personalized startup recommendations based on your preferences
- **Portfolio Management**: Track your investments and monitor performance
- **Multi-Currency Wallet**: Support for INR, USD, BTC, ETH, USDT, and SOL
- **Real-time Updates**: Live notifications and market trends
- **Watchlist**: Save startups for later review

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **UI Components**: Radix UI, shadcn/ui
- **State Management**: TanStack Query
- **Backend**: Supabase (PostgreSQL, Auth, Edge Functions)
- **Charts**: Recharts
- **Animations**: Framer Motion compatible

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or bun

### Installation

```bash
# Clone the repository
git clone <your-repo-url>

# Navigate to project directory
cd investhub

# Install dependencies
npm install

# Start development server
npm run dev
```

### Environment Variables

Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Project Structure

```
src/
├── components/     # Reusable UI components
├── pages/          # Page components
├── hooks/          # Custom React hooks
├── lib/            # Utility functions
├── data/           # Sample data and constants
├── types/          # TypeScript type definitions
└── integrations/   # External service integrations
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.
