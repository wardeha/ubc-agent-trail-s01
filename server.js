// CourseBuddy: your first AI agent, as a tiny web app.
//
//   Brain         -> MODEL          (the LLM that decides what to do)
//   Instructions  -> INSTRUCTIONS   (who the agent is and its rules)
//   Tools         -> the tools      (what it can look up or do)
//   Memory        -> checkpointer   (remembers the conversation)
//
// LangChain runs the agent loop for us: think, use a tool, look at the result, repeat.
//
// Run:  node server.js   then open http://localhost:3000
// This now 10/11/2026
import "dotenv/config"; // reads GOOGLE_API_KEY from the .env file
import fs from "node:fs";
import express from "express";
import { createAgent, tool } from "langchain";
import { MemorySaver } from "@langchain/langgraph";
import { ChatGoogle } from "@langchain/google";
import * as z from "zod";

// 1. BRAIN: which LLM to use.
// Flash-Lite with minimal thinking is Gemini's fastest setup.
// For harder questions try model "gemini-3.8-flash" with thinkingLevel "high" (slower, smarter).
const MODEL = new ChatGoogle({ model: "gemini-3.5-flash-lite", thinkingLevel: "minimal" });

// 2. INSTRUCTIONS
const INSTRUCTIONS = `You are CourseBuddy, a friendly course-planning helper for university students.
Always use your tools to check prerequisites. Never guess.
Only save a plan when the student asks you to.`;

// Sample data (simplified, not the official course calendar)
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

let toolLog = []; // so the chat page can show which tools the agent used

// 3. TOOLS: a normal function, plus a description the LLM reads.
const getPrerequisites = tool(
  ({ course }) => {
    toolLog.push(`get_prerequisites("${course}")`);
    const prereqs = PREREQUISITES[course.toUpperCase()];
    if (!prereqs) return `${course} is not in the catalog.`;
    return prereqs.length ? prereqs.join(", ") : "No prerequisites.";
  },
  {
    name: "get_prerequisites",
    description: "Get the prerequisites for a course, for example 'CPSC 210'.",
    schema: z.object({ course: z.string() }),
  }
);

const savePlan = tool(
  ({ plan }) => {
    toolLog.push("save_plan(...)");
    fs.writeFileSync("my_plan.txt", plan);
    return "Saved to my_plan.txt";
  },
  {
    name: "save_plan",
    description: "Save the student's course plan to a file.",
    schema: z.object({ plan: z.string() }),
  }
);

// 4. PUT THE PIECES TOGETHER (memory is added here too).
// This one call builds the agent from the "Anatomy of an agent" slide.
// createAgent is the orchestrator: it runs the "Think, act, observe, repeat" loop for us.
const agent = createAgent({
  // BRAIN (slide "What goes into every agent"): the LLM that reads the context
  // and decides each step: answer, or use a tool.
  model: MODEL,

  // TOOLS: the functions the agent can ask us to run. The model only sees their
  // names, descriptions and inputs (slide "The model never runs code. It asks.").
  tools: [getPrerequisites, savePlan],

  // INSTRUCTIONS: the system prompt. Who the agent is and its rules,
  // sent with every request.
  systemPrompt: INSTRUCTIONS,

  // MEMORY: keeps the conversation and tool results, and re-sends them to the
  // brain every turn. The model itself remembers nothing (slide "What is an LLM?").
  checkpointer: new MemorySaver(),
});

// A tiny web server: serves the chat page and passes messages to the agent.
const app = express();
app.use(express.json());
app.use(express.static("public"));

app.post("/chat", async (req, res) => {
  toolLog = [];
  try {
    const result = await agent.invoke(
      { messages: [{ role: "user", content: req.body.message }] },
      { configurable: { thread_id: "my-chat" } }
    );
    res.json({ reply: result.messages.at(-1).text, tools: toolLog });
  } catch (err) {
    console.error(err);
    res.json({ reply: `Something went wrong: ${err.message}`, tools: toolLog });
  }
});

app.listen(3000, () => console.log("CourseBuddy is running at http://localhost:3000"));
