# Build your first AI agent

A tiny web app with an AI agent inside. Two files:

- `server.js`: the agent (about 60 lines of code), plus a small web server
- `public/index.html`: the chat page

It uses **LangChain**, the most widely used library for building agents, and **Google Gemini**, which has a free tier.

## Set up (5 min)

1. Install **Node.js 22 or newer** from nodejs.org. Check with `node --version`.
2. Get a free Gemini API key at https://aistudio.google.com/apikey (sign in with a Google account).
3. In a terminal, inside this folder:

```bash
npm install
```

4. Rename `.env.example` to `.env` and paste in your key. Never put a key in your code or on GitHub.

## Run it

```bash
node server.js
```

Open http://localhost:3000 and try, in order:

1. `What do I need before I can take CPSC 221?`
2. `I've done CPSC 110 and CPSC 121. Can I take CPSC 213?`
3. `Make me a plan to get to CPSC 320, and save it.`

The green `[tool]` lines show the agent deciding on its own to use a tool. After question 3, open `my_plan.txt`.

To stop the server, press Ctrl+C in the terminal. Restart it after every code change.

## Find the four parts in server.js

| Part         | In the code |
|--------------|-------------|
| Brain        | `MODEL` |
| Instructions | `INSTRUCTIONS` |
| Tools        | `getPrerequisites` and `savePlan` |
| Memory       | `checkpointer: new MemorySaver()` |

## Challenges

1. **Change its personality.** Edit `INSTRUCTIONS` (try "talk like a pirate"). Same brain, different agent.
2. **Add a tool.** Copy `getPrerequisites`, make a `listCourses` tool that returns every course in `PREREQUISITES`, and add it to `tools: [...]`. Ask "what courses are there?"
3. **Break it.** Remove "Never guess." and ask about a course that isn't in the list.
4. **Switch brains.** Change `MODEL` to another Gemini model, like `"google:gemini-3.5-flash-lite"`. Nothing else changes.

## Troubleshooting

| Problem | Fix |
|---|---|
| `API key` error | `.env` is missing, not renamed, or not in this folder. |
| `429` / quota error | You hit the free limit. Wait a minute, or try another Gemini model. |
| `404` / model not found | Change `MODEL` to a model listed in AI Studio. |
| Port 3000 in use | Another server is running. Stop it with Ctrl+C. |

> The course data is a simplified sample, not the official UBC calendar.
