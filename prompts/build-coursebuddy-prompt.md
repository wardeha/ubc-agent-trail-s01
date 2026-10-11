# Prompt: build CourseBuddy

Paste everything below the line into Claude Code or Cursor as your first message. See `student-instructions.md` for the full steps.

---

You are helping a university student build their first AI agent. Build a small web app called **CourseBuddy**: a chat page where students ask about course prerequisites, and an AI agent answers by using tools.

Before writing any code, show me a short plan (the files you'll create and what each one does) and wait for me to say go.

## Tech stack (use exactly this)

- Node.js 22 or newer, JavaScript (not TypeScript), ES modules (`"type": "module"` in package.json)
- `express` for the web server
- LangChain.js: `langchain` (for `createAgent` and `tool`), `@langchain/core`, `@langchain/langgraph` (for `MemorySaver`), `@langchain/google` (for `ChatGoogle`)
- `zod` for tool input schemas
- `dotenv` to read the API key from `.env`
- Model: Google Gemini, `gemini-3.5-flash-lite`, with `thinkingLevel: "minimal"` so it responds quickly. The API key is read from `GOOGLE_API_KEY`.

## Files to create

Keep it to these files. Beginners will read every line.

1. `server.js`: the agent and the web server, about 60 lines of code
2. `public/index.html`: the chat page, with its CSS and JavaScript inside the same file
3. `package.json`, with a `start` script that runs `node server.js`
4. `.env.example` containing `GOOGLE_API_KEY=`
5. `.gitignore` ignoring `.env`, `node_modules/` and `my_plan.txt`
6. `README.md`: setup and run steps in plain language

## The agent (server.js)

Organize `server.js` around the four parts of an agent, each with a short numbered comment so a student can find it:

1. **Brain**: a `MODEL` constant, created with `new ChatGoogle({ model: "gemini-3.5-flash-lite", thinkingLevel: "minimal" })`.
2. **Instructions**: an `INSTRUCTIONS` constant, used as the system prompt:
   > You are CourseBuddy, a friendly course-planning helper for university students. Always use your tools to check prerequisites. Never guess. Only save a plan when the student asks you to.
3. **Tools**: two tools made with `tool(...)` from `langchain` and a zod schema:
   - `get_prerequisites({ course })`: looks the course up in a `PREREQUISITES` object and returns its prerequisites as a comma-separated string, "No prerequisites." if it has none, or "`<course>` is not in the catalog." if it isn't there. It should accept lowercase input such as "cpsc 210".
   - `save_plan({ plan })`: writes the plan text to `my_plan.txt` and returns "Saved to my_plan.txt".
4. **Memory**: `checkpointer: new MemorySaver()`, using one fixed `thread_id` such as `"my-chat"` so the agent remembers the conversation while the server runs.

Combine them with `createAgent({ model, tools, systemPrompt, checkpointer })`. Don't write the agent loop yourself; `createAgent` runs it.

Use this sample data, and add a comment saying it is simplified and not the official course calendar:

```js
const PREREQUISITES = {
  "CPSC 110": [],
  "CPSC 121": [],
  "CPSC 210": ["CPSC 110"],
  "CPSC 213": ["CPSC 121", "CPSC 210"],
  "CPSC 221": ["CPSC 121", "CPSC 210"],
  "CPSC 310": ["CPSC 210"],
  "CPSC 320": ["CPSC 221"],
  "CPSC 330": ["CPSC 210"],
};
```

## The web server

- Serve `public/` as static files.
- `POST /chat` takes `{ "message": "..." }`, passes it to the agent, and returns `{ "reply": "...", "tools": [...] }`.
- `tools` lists the tool calls the agent made while answering this message, for example `get_prerequisites("CPSC 213")`. The simplest way is a `toolLog` array that each tool pushes to and `/chat` resets.
- If anything fails (missing key, quota error), log it and return the error message as the reply instead of crashing.
- Listen on port 3000 and print `CourseBuddy is running at http://localhost:3000`.

## The chat page (public/index.html)

- A title, a hint ("Try: What do I need before CPSC 221?"), a scrolling list of messages, and a text box with a Send button.
- Student messages on the right, agent replies on the left.
- While waiting, show "thinking...". Before each reply, show each tool call as a small green monospace line starting with `[tool]`, so students can watch the agent work.
- Plain HTML, CSS and JavaScript. No frameworks, no build step.

## Rules

- Keep the code short and readable for someone who has never built an agent. Prefer plain code over clever code.
- Add brief comments that explain *why*, not just *what*.
- Never put an API key in the code. It lives only in `.env`.
- Don't add extra features, libraries, tests, databases or TypeScript.

## When you're done

1. Run `npm install` and start the server to check it launches without errors. (Without a real key the chat will return a key error; that's expected.)
2. Tell me exactly what to put in `.env`, and how to get a free key at https://aistudio.google.com/apikey.
3. Give me three questions to test it with, including one that should make the agent call `get_prerequisites` twice, and one that saves a plan.
