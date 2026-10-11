# Session 1: build CourseBuddy with a coding agent

In this exercise you won't type the app yourself. You'll describe it to a coding agent (Claude Code or Cursor), review its plan, let it build, then test and change the result. That's how a lot of software gets built now.

**What you'll end up with:** a web page where you chat with CourseBuddy, an AI agent that checks course prerequisites and can save a plan to a file.

**Time:** about 35 minutes.

## Before you start

You need:

- **VS Code**, from code.visualstudio.com
- **Node.js 22 or newer**, the LTS version from nodejs.org. Check in a terminal with `node --version`.
- **A coding agent**, either one:
  - **Claude Code**: needs a Claude subscription. Install it, then run `claude` in a terminal.
  - **Cursor**: the free plan works. Download it from cursor.com. Cursor is its own editor, so use it instead of VS Code for this exercise.
- **A free Gemini API key**, from aistudio.google.com/apikey (sign in with a Google account). This is the key *your app* uses to talk to Gemini. Treat it like a password.

## Step 1: Make an empty folder (2 min)

Create a folder called `coursebuddy` anywhere you like, and open it:

- **Claude Code:** open the folder in VS Code, open a terminal (Terminal > New Terminal), and type `claude`.
- **Cursor:** File > Open Folder, then open the chat panel and switch it to **Agent** mode.

## Step 2: Give the agent the prompt (2 min)

Open `build-coursebuddy-prompt.md`, copy everything below the line, and paste it into the agent as your first message.

## Step 3: Review the plan (5 min)

The prompt tells the agent to show you a plan and wait. **Read it before saying go.** Check:

- Does it list `server.js`, `public/index.html`, `package.json`, `.env.example`, `.gitignore` and `README.md`?
- Does it use LangChain and Gemini, as asked?
- Is it adding anything you didn't ask for? If so, tell it to remove that.

When you're happy, reply "go". The agent may ask permission to create files or run commands. Read each request before you approve it.

## Step 4: Add your key and run it (5 min)

1. Copy `.env.example` to a new file called `.env`.
2. Paste your Gemini key after `GOOGLE_API_KEY=`.
3. In the terminal (outside the agent), run:

```bash
npm install
node server.js
```

4. Open http://localhost:3000.

## Step 5: Test it (5 min)

Try these, in order:

1. `What do I need before I can take CPSC 221?`
2. `I've done CPSC 110 and CPSC 121. Can I take CPSC 213?`
3. `Make me a plan to get to CPSC 320, and save it.`

Watch for the green `[tool]` lines: that's the agent deciding on its own to use a tool. After question 3, open `my_plan.txt`.

## Step 6: Read the code (5 min)

Open `server.js` and find the four parts of an agent:

| Part | Look for |
|---|---|
| Brain | `MODEL` |
| Instructions | `INSTRUCTIONS` |
| Tools | the two `tool(...)` blocks |
| Memory | `MemorySaver` |

Where's the loop? It's inside `createAgent`: LangChain runs think, act, observe for you.

## Step 7: Change it (the rest of the time)

Pick one. You can ask your coding agent to do it, or do it by hand. Either way, read what changed. Restart the server (Ctrl+C, then `node server.js`) after each change.

1. **Change its personality.** Edit `INSTRUCTIONS`. Try "talk like a pirate".
2. **Add a tool.** Add a `list_courses` tool that returns every course in the catalog. Ask "what courses are there?"
3. **Break it.** Remove "Never guess." and ask about a course that isn't in the list. What happens?
4. **Switch brains.** Change the model to `gemini-3.8-flash` with `thinkingLevel: "high"`. Smarter? How much slower?

## If something goes wrong

| Problem | Try this |
|---|---|
| `API key` error in the chat | `.env` is missing, misnamed, or not in the project folder. Restart the server after fixing it. |
| `429` or quota error | You hit Gemini's free limit. Wait a minute. |
| `404` model not found | Ask your agent to switch to a Gemini model listed in AI Studio. |
| `node` not found | Install Node.js, then close and reopen your editor. |
| Port 3000 in use | A server is already running. Stop it with Ctrl+C. |
| The app doesn't match the prompt | Tell the agent what's wrong, in plain words. Fixing it together is part of the exercise. |

> The course data is a simplified sample made for this exercise, not the official UBC calendar.
