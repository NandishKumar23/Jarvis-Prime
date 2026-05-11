# Jarvis Prime 🤖

Personal AI Orchestrator with Domain-Specific Agents powered by Groq AI.

## Features

- 🧠 **5 Domain-Specific AI Agents**
  - **Knowledge**: Tech news, research papers, learning resources
  - **Finance**: Budget tracking, expense management, financial insights
  - **Fitness**: Workout plans, nutrition advice, activity tracking
  - **Health**: Wellness habits, mental health, focus techniques
  - **Comms**: Email management, calendar scheduling, communication

- 🔀 **Intelligent Orchestration**
  - LLM-based intent classification
  - Parallel agent execution
  - Multi-agent response merging

- 🔐 **GitHub Authentication**
  - Secure OAuth login via NextAuth.js
  - Protected chat routes
  - User-specific sessions

- ⚡ **Modern Tech Stack**
  - Next.js 16 with App Router & Turbopack
  - TypeScript with strict mode
  - Tailwind CSS 4
  - Groq SDK (llama-3.1-8b & llama-3.3-70b)
  - Type-safe environment variables (T3 Env)
  - Biome (linting & formatting)

## Setup

### 1. Clone & Install

\`\`\`bash
git clone <your-repo-url>
cd Jarvis-Prime
pnpm install
\`\`\`

### 2. Configure Environment Variables

Copy `.env.local` and fill in your credentials:

\`\`\`bash
cp .env.local .env.local
\`\`\`

#### Get Groq API Key (Required)

1. Go to [Groq Console](https://console.groq.com/keys)
2. Sign up / Log in
3. Create a new API key
4. Copy and paste into `GROQ_API_KEY` in `.env.local`

#### Setup GitHub OAuth (Required)

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click **New OAuth App**
3. Fill in:
   - **Application name**: Jarvis Prime
   - **Homepage URL**: `http://localhost:3000`
   - **Authorization callback URL**: `http://localhost:3000/api/auth/callback/github`
4. Click **Register application**
5. Copy the **Client ID** and paste into `GITHUB_ID` in `.env.local`
6. Click **Generate a new client secret**, copy it, and paste into `GITHUB_SECRET`

#### Generate NextAuth Secret

Run this command to generate a random secret:

\`\`\`bash
openssl rand -base64 32
\`\`\`

Copy the output and paste into `NEXTAUTH_SECRET` in `.env.local`.

### 3. Run Development Server

\`\`\`bash
pnpm dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

\`\`\`
src/
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/route.ts  # NextAuth handlers
│   │   └── chat/route.ts                # Main orchestrator endpoint
│   ├── auth/signin/page.tsx             # Sign-in page
│   ├── layout.tsx                       # Root layout
│   └── page.tsx                         # Landing page
├── lib/
│   ├── agents/
│   │   ├── base.ts                      # BaseAgent interface
│   │   ├── knowledge.ts                 # Knowledge agent
│   │   ├── finance.ts                   # Finance agent
│   │   ├── fitness.ts                   # Fitness agent
│   │   ├── health.ts                    # Health agent
│   │   └── comms.ts                     # Comms agent
│   ├── orchestrator/
│   │   ├── router.ts                    # Intent classification
│   │   ├── dispatcher.ts                # Parallel execution
│   │   └── merger.ts                    # Response combination
│   ├── env.ts                           # T3 Env configuration
│   ├── groq-client.ts                   # Groq SDK client
│   └── types.ts                         # TypeScript types
├── auth.ts                              # NextAuth configuration
└── middleware.ts                        # Route protection
\`\`\`

## Available Scripts

\`\`\`bash
pnpm dev         # Start development server
pnpm build       # Build for production
pnpm start       # Start production server
pnpm lint        # Run Biome linter
pnpm format      # Format code with Biome
pnpm type-check  # TypeScript type checking
pnpm biome ci    # CI checks (lint + format)
pnpm spell       # Spell check codebase
\`\`\`

## API Usage

### POST /api/chat

Send a message to the orchestrator:

\`\`\`typescript
const response = await fetch('/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: "What are the latest AI papers?"
  })
});

const data = await response.json();
console.log(data.result); // Formatted response from agents
\`\`\`

## Architecture

1. **Router** (LLM-based): Analyzes user intent and selects relevant agents
2. **Dispatcher**: Executes selected agents in parallel for faster responses
3. **Merger**: Combines responses from multiple agents into coherent output

## Roadmap

- [ ] Chat UI with streaming responses
- [ ] HackerNews API integration (Knowledge agent)
- [ ] arXiv API integration (Knowledge agent)
- [ ] Vector memory with pgvector
- [ ] Gmail/Calendar MCP integration (Comms agent)
- [ ] Personal finance tracking (Finance agent)
- [ ] Workout logging (Fitness agent)

## License

MIT
