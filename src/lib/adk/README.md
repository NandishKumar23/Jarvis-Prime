# Jarvis Agents — Google ADK (Gemini)

All of Jarvis's agents run on **Google's Agent Development Kit** (`@google/adk`)
with **Gemini** (`gemini-flash-latest`, free tier). ADK is the single engine: it
powers the orchestrator router and every domain agent.

## Files

| File | Role |
| --- | --- |
| `agents/base.ts` | `createAdkAgent(LlmAgent)` factory — wraps an agent with its own `InMemoryRunner` and exposes `streamAgent(task, context)` that maps ADK SSE events → text tokens. |
| `agents/{knowledge,finance,fitness,health,comms}.ts` | The five domain agents as declarative `LlmAgent`s (description + instruction). |
| `tools/sportsNews.ts` | `FunctionTool` `get_sports_news` — fetches Google News RSS (free, no key), parses top cricket/football headlines. Attached to the `knowledge` agent. |
| `../orchestrator/router.ts` | Gemini structured-output `LlmAgent` (zod `outputSchema`) that classifies intent into `{ agents, tasks }`. |
| `../orchestrator/dispatcher.ts` | Runs the selected agents in parallel and multiplexes their token streams into `StreamEvent`s. |
| `../orchestrator/withPersona.ts` | Wraps the dispatch with JARVIS persona framing (greeting/intro/outro). |
| `../../app/api/chat/route.ts` | Node-runtime route: `route()` → `withPersona()` → NDJSON `StreamEvent` stream. |

## Setup

1. Get a free key from Google AI Studio: https://aistudio.google.com/app/apikey
2. Add it to `.env.local`:
   ```
   GEMINI_API_KEY=your_key_here
   ```
3. `pnpm dev`, open the chat, and ask e.g. *"latest cricket news in India"* or
   *"find AI papers and check my budget"* (multi-agent).

## Architecture

```
POST /api/chat
  route(message)                 # Gemini JSON classifier → { agents, tasks }
  → withPersona(routing)         # greeting? → routing → intro → … → outro → done
    → dispatchStream(routing)    # runs selected agents in parallel
        per agent: InMemoryRunner.runEphemeral (SSE)
        → agent_start / agent_token* / agent_done
  → NDJSON StreamEvents → apiDriver → ChatContainer (HUD)
```

The `StreamEvent` contract, `AGENTS`/`agentMeta`, badges, and speech logic are
handled entirely by the Gemini/ADK backend.

## Design notes

- **Classifier-based routing (not ADK delegation).** The router is an explicit
  structured-output `LlmAgent`, preserving the exact parallel multi-agent
  behavior and the per-agent `StreamEvent` stream.
- **Lazy model resolution.** Agents reference the model by name
  (`'gemini-flash-latest'`) rather than a constructed `Gemini` instance, so
  `GEMINI_API_KEY` resolves at request time and `next build` stays side-effect
  free.
- **Session-only memory.** `runEphemeral` is single-turn; recent history is
  folded into the task text (`buildInput`) rather than a server-side session
  store. To add durable memory, switch to `runAsync` with a session service.
- **Rate limits.** One message can fire the router plus up to five agents in
  parallel. Free-tier Flash RPM is limited but fine for a single user.

## Future work

- Replace LLM-only agent prompts with real tools (Gmail/Calendar via MCP,
  expense/fitness/habit databases), mirroring the `get_sports_news` pattern.
- Optionally swap `get_sports_news` for Gemini's built-in `GoogleSearchTool`.
