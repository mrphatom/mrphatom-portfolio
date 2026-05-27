import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, setDoc, collection, getDocs, deleteDoc, writeBatch } from "firebase/firestore";

const PORT = 3000;
const DATA_DIR = path.join(process.cwd(), "data");
const PORTFOLIO_FILE = path.join(DATA_DIR, "portfolio_data.json");
const MESSAGES_FILE = path.join(DATA_DIR, "portfolio_received_messages.json");

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Default initial portfolio data fallback
const DEFAULT_PORTFOLIO_DATA = {
  profile: {
    name: "Godtime",
    sirName: "Benson",
    title: "Senior Frontend Engineer & Design Systems Architect",
    role: "Senior Frontend Engineer",
    bio: "I specialize in bridging the gap between sophisticated aesthetics and high-performance frontend engineering. Currently design-engineering pixel-perfect interfaces, robust component architectures, and fluid interactive web applications.",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400&h=400",
    location: "Remote / Lagos, Nigeria (GMT+1)",
    status: "Available for contract & remote roles",
    email: "godtimebenson09@gmail.com",
    resumeUrl: "#",
    headingLine1: "Creative",
    headingLine2: "Developer",
    socialLinks: [
      { platform: "github", url: "https://github.com", label: "GitHub" },
      { platform: "linkedin", url: "https://linkedin.com", label: "LinkedIn" },
      { platform: "twitter", url: "https://twitter.com", label: "Twitter / X" },
      { platform: "email", url: "mailto:godtimebenson09@gmail.com", label: "Email" }
    ]
  },
  projects: [
    {
      id: "leadsradar",
      title: "LeadsRadar Workspace",
      role: "Creator & Lead Architect",
      description: "An outreach tracking workspace and geo-location lead discovering engine designed specifically for freelance developers and agencies.",
      longDescription: "LeadsRadar is an intelligent target tracking panel and outreach hub tailored for freelance practitioners. Integrates an automated Kanban-style outreach pipeline, customizable tag filters, geographical contact scouting widgets, and structured communication playbooks, boosting pitch efficiencies.",
      image: "dashboard",
      tags: ["React", "TypeScript", "Tailwind CSS", "Kanban API", "Geographic Mapping"],
      codeUrl: "https://github.com/mrphatom/LeadsRadar",
      demoUrl: "https://github.com/mrphatom/LeadsRadar",
      featured: true
    },
    {
      id: "askzen",
      title: "AskZen Telegram Bot",
      role: "Creator & Lead Developer",
      description: "A production-grade AI-powered Telegram chatbot integrating premium paywalls via Telegram Stars and custom AI modes.",
      longDescription: "AskZen is a highly sophisticated, monetize-ready Telegram assistant engineered with TypeScript. Features custom persona modules, secure rate-limited token streaming, and Telegram Stars payment integration, enabling seamless freemium subscriptions.",
      image: "canvas",
      tags: ["TypeScript", "Node.js", "Groq API", "Telegram API", "Railway CRM"],
      codeUrl: "https://github.com/mrphatom/AskZen",
      demoUrl: "https://github.com/mrphatom/AskZen",
      featured: true
    },
    {
      id: "chatgpt3-portal",
      title: "ChatGPT Multi-Turn Interface",
      role: "Developer",
      description: "A lightweight, secure chatbot workspace featuring full thread context preservation, custom system prompts, and fluid dark-mode overlays.",
      longDescription: "An elegant conversational window built using React and Tailwind. Integrates OpenAI's Chat Completion APIs with custom token streaming handlers, multi-turn state trees, prompt templates, and local synchronization.",
      image: "design-system",
      tags: ["React", "Vite", "OpenAI APIs", "Tailwind CSS", "LocalState"],
      codeUrl: "https://github.com/mrphatom/chatgpt3",
      demoUrl: "https://github.com/mrphatom/chatgpt3",
      featured: true
    },
    {
      id: "haywhy-constructions",
      title: "Haywhy Constructions Showroom",
      role: "Lead Fullstack Developer",
      description: "A custom high-performance property listing showroom and consultation organizer with smooth layout choreographies.",
      longDescription: "Created a highly visible, fluid, responsive property presentation panel for structural design consulting. Features high-definition image galleries, an automated consultation query drawer, and custom contact dispatch modules.",
      image: "commerce",
      tags: ["React", "CSS Grid", "Tailwind CSS", "Framer Motion", "Nodemailer"],
      codeUrl: "https://github.com/mrphatom/haywhyconstructions",
      demoUrl: "https://github.com/mrphatom/haywhyconstructions",
      featured: false
    }
  ],
  experiences: [
    {
      id: "exp-mercor",
      role: "AI Specialist / Evaluator",
      company: "Mercor",
      period: "Apr 2026 - Present",
      location: "San Francisco, CA (Remote)",
      description: "Evaluating, training, aligning, and building state-of-the-art AI agents and Large Language Models for complex reasoning capabilities.",
      bullets: [
        "Spearheaded LLM alignment strategies and custom evaluation benchmarks to validate multi-step reasoning capabilities.",
        "Collaborated closely on complex prompt architectures and Reinforcement Learning from Human Feedback (RLHF) guidelines.",
        "Engineered custom playground interfaces and high-performance evaluation tools to streamline fine-tuning cycles."
      ]
    },
    {
      id: "exp-discord",
      role: "Senior Frontend Engineer",
      company: "Discord",
      period: "Jan 2024 - Apr 14, 2026",
      location: "San Francisco, CA (Remote)",
      description: "Architected real-time communication UI components, streaming overlays, and high-performance layout systems for desktop and web screens.",
      bullets: [
        "Rebuilt the primary interactive server chat viewports with memoized render gates, decreasing user memory footprint by 18%.",
        "Orchestrated buttery-smooth dynamic overlays and entrance choreographies triggering micro-reactions.",
        "Formulated cross-functional testing suites that verified 100% viewport compliance across different viewport densities."
      ]
    },
    {
      id: "exp-1",
      role: "Lead Interface Engineer",
      company: "Prism Digital Labs",
      period: "2022 - 2024",
      location: "London, UK (Remote)",
      description: "Spearheaded design token integration and core library construction across international developer teams.",
      bullets: [
        "Architected core system patterns in React, reducing build drift and saving approximately 180 designer/developer hours.",
        "Reconstructed performance-critical web analytic dashboards, boosting core Web Vital metrics by 34% across consumer channels.",
        "Facilitated seamless integration of motion-guided landing pages and responsive interactive data widgets."
      ]
    },
    {
      id: "exp-2",
      role: "Senior Software Developer",
      company: "Apex Tech Inc",
      period: "2020 - 2022",
      location: "San Francisco, CA (Hybrid)",
      description: "Led headless application refactoring and optimized GraphQL API layers for high-traffic commerce platforms.",
      bullets: [
        "Coordinated across cross-functional product cells to transition legacy interfaces to modern React codebases.",
        "Improved rendering pipeline through strategic lazy-loading, code splitting, and browser cache optimization.",
        "Created custom high-performance data visualizations with SVG and D3 modules."
      ]
    }
  ],
  skills: [
    { name: "React", level: 96, category: "Frontend", icon: "Flame" },
    { name: "TypeScript", level: 95, category: "Frontend", icon: "FileCode" },
    { name: "Tailwind CSS", level: 98, category: "Frontend", icon: "Layers" },
    { name: "CSS / CSS Grid", level: 92, category: "Frontend", icon: "Palette" },
    { name: "Framer Motion", level: 94, category: "Frontend", icon: "Sparkles" },
    { name: "Next.js", level: 91, category: "Frontend", icon: "Cpu" },
    { name: "UI/UX Design", level: 88, category: "Design", icon: "Layout" },
    { name: "Figma Mapping", level: 90, category: "Design", icon: "PenTool" },
    { name: "Design Systems", level: 96, category: "Design", icon: "Box" },
    { name: "Motion Choreography", level: 90, category: "Design", icon: "Activity" },
    { name: "Blockchain Engineering", level: 90, category: "Utilities", icon: "Box" },
    { name: "Node.js", level: 85, category: "Utilities", icon: "Terminal" },
    { name: "GraphQL / REST APIs", level: 88, category: "Utilities", icon: "Network" },
    { name: "Git & CI/CD Pipelines", level: 93, category: "Utilities", icon: "GitBranch" },
    { name: "D3.js Visualization", level: 85, category: "Utilities", icon: "BarChart" }
  ]
};

// Seed portfolio data if not exists locally
if (!fs.existsSync(PORTFOLIO_FILE)) {
  fs.writeFileSync(PORTFOLIO_FILE, JSON.stringify(DEFAULT_PORTFOLIO_DATA, null, 2), "utf8");
}

// Seed messages list if not exists locally
if (!fs.existsSync(MESSAGES_FILE)) {
  fs.writeFileSync(MESSAGES_FILE, JSON.stringify([], null, 2), "utf8");
}

// Gracefully initialize Firebase SDK (using API Key Client-mode on server)
let db: any = null;
try {
  const configPath = path.join(process.cwd(), "firebase-applet-config.json");
  if (fs.existsSync(configPath)) {
    const firebaseConfig = JSON.parse(fs.readFileSync(configPath, "utf8"));
    const app = initializeApp(firebaseConfig);
    db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
    console.log("Firebase Client Firestore initialized successfully on backend using API Key.");
  } else {
    console.log("Firebase config not found. Operating with local filesystem fallback.");
  }
} catch (err) {
  console.error("Failed to initialize Firebase Client SDK on server:", err);
}

async function startServer() {
  const app = express();

  // Parse JSON payloads
  app.use(express.json({ limit: "20mb" }));

  // 1. GET Portfolio Data (Loads from cloud Firestore with local backup fallback)
  app.get("/api/portfolio", async (req, res) => {
    try {
      if (db) {
        try {
          const docRef = doc(db, "portfolio", "data");
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data() || {};
            // Self-healing merge to guarantee client never receives incomplete schemas
            const mergedData = {
              ...DEFAULT_PORTFOLIO_DATA,
              ...data,
              profile: {
                ...DEFAULT_PORTFOLIO_DATA.profile,
                ...(data.profile || {})
              }
            };

            // If the database document is missing key collections, write back healed data
            if (!data.projects || !data.skills || !data.experiences || !data.profile?.socialLinks) {
              console.log("Detected incomplete portfolio entry in Firestore. Automatically healing database...");
              try {
                await setDoc(docRef, mergedData);
              } catch (writeErr) {
                console.error("Failed to heal incomplete Firestore document:", writeErr);
              }
            }

            // Sync local backup file
            fs.writeFileSync(PORTFOLIO_FILE, JSON.stringify(mergedData, null, 2), "utf8");
            return res.json(mergedData);
          } else {
            // Seed Firestore with default data
            await setDoc(docRef, DEFAULT_PORTFOLIO_DATA);
            return res.json(DEFAULT_PORTFOLIO_DATA);
          }
        } catch (firebaseErr) {
          console.error("Firestore fetch error, pulling from local backup:", firebaseErr);
        }
      }
      
      // Fallback
      if (fs.existsSync(PORTFOLIO_FILE)) {
        try {
          const fileContent = fs.readFileSync(PORTFOLIO_FILE, "utf8");
          const fileData = JSON.parse(fileContent);
          const mergedData = {
            ...DEFAULT_PORTFOLIO_DATA,
            ...fileData,
            profile: {
              ...DEFAULT_PORTFOLIO_DATA.profile,
              ...(fileData.profile || {})
            }
          };
          return res.json(mergedData);
        } catch (parseErr) {
          console.error("Failed to parse local portfolio backup file:", parseErr);
        }
      }
      return res.json(DEFAULT_PORTFOLIO_DATA);
    } catch (e) {
      console.error("Error reading portfolio data:", e);
      return res.status(500).json({ error: "Failed to read portfolio data on server" });
    }
  });

  // 2. POST Portfolio Data Updates (Saves to cloud Firestore and local file)
  app.post("/api/portfolio", async (req, res) => {
    try {
      const newData = req.body;
      if (!newData || typeof newData !== "object") {
        return res.status(400).json({ error: "Invalid data format" });
      }

      // Save locally as backup / immediate sync
      fs.writeFileSync(PORTFOLIO_FILE, JSON.stringify(newData, null, 2), "utf8");

      // Save to Firebase Cloud Firestore
      if (db) {
        try {
          const docRef = doc(db, "portfolio", "data");
          await setDoc(docRef, newData);
          console.log("Successfully saved portfolio changes to cloud Firestore.");
        } catch (firebaseErr) {
          console.error("Failed to save portfolio to Firestore, local backup updated:", firebaseErr);
        }
      }

      return res.json(newData);
    } catch (e) {
      console.error("Error saving portfolio:", e);
      return res.status(500).json({ error: "Failed to save portfolio data on server" });
    }
  });

  // 3. GET Messages Data
  app.get("/api/messages", async (req, res) => {
    try {
      if (db) {
        try {
          const querySnapshot = await getDocs(collection(db, "messages"));
          const messagesList: any[] = [];
          querySnapshot.forEach((docSnap) => {
            messagesList.push(docSnap.data());
          });
          // Sort descending by timestamp
          messagesList.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
          // Sync local backup
          fs.writeFileSync(MESSAGES_FILE, JSON.stringify(messagesList, null, 2), "utf8");
          return res.json(messagesList);
        } catch (firebaseErr) {
          console.error("Firestore fetch messages failed, pulling from local backup:", firebaseErr);
        }
      }

      // Fallback
      if (fs.existsSync(MESSAGES_FILE)) {
        const fileContent = fs.readFileSync(MESSAGES_FILE, "utf8");
        return res.json(JSON.parse(fileContent));
      }
      return res.json([]);
    } catch (e) {
      console.error("Error reading messages on server:", e);
      return res.status(500).json({ error: "Failed to read messages" });
    }
  });

  // 4. POST Add a New Message/Lead
  app.post("/api/messages", async (req, res) => {
    try {
      const newMessage = req.body;
      if (!newMessage || !newMessage.id) {
        return res.status(400).json({ error: "Invalid message payload" });
      }
      
      // Save locally
      let messagesList = [];
      if (fs.existsSync(MESSAGES_FILE)) {
        const content = fs.readFileSync(MESSAGES_FILE, "utf8");
        messagesList = JSON.parse(content);
      }
      if (!messagesList.some((m: any) => m.id === newMessage.id)) {
        messagesList.unshift(newMessage);
      }
      fs.writeFileSync(MESSAGES_FILE, JSON.stringify(messagesList, null, 2), "utf8");

      // Save to Firebase Cloud Firestore
      if (db) {
        try {
          const docRef = doc(db, "messages", newMessage.id);
          await setDoc(docRef, newMessage);
          console.log(`Successfully stored message ${newMessage.id} to cloud Firestore.`);
        } catch (firebaseErr) {
          console.error("Failed to save message to Firestore, local file updated:", firebaseErr);
        }
      }

      return res.json(messagesList);
    } catch (e) {
      console.error("Error appending message:", e);
      return res.status(500).json({ error: "Failed to save message on server" });
    }
  });

  // 5. POST Sync all messages (e.g., mark as read, delete campaigns)
  app.post("/api/messages/update-all", async (req, res) => {
    try {
      const updatedList = req.body;
      if (!Array.isArray(updatedList)) {
        return res.status(400).json({ error: "Payload must be a valid array" });
      }
      
      // Save locally
      fs.writeFileSync(MESSAGES_FILE, JSON.stringify(updatedList, null, 2), "utf8");

      // Sync with Firebase Cloud Firestore (Batch write delete/set)
      if (db) {
        try {
          const querySnapshot = await getDocs(collection(db, "messages"));
          const batch = writeBatch(db);

          const existingIds = new Set<string>();
          querySnapshot.forEach((docSnap) => {
            existingIds.add(docSnap.id);
          });

          const incomingIds = new Set(updatedList.map((m: any) => m.id));

          // Delete those that are no longer in the updated lists
          existingIds.forEach((id) => {
            if (!incomingIds.has(id)) {
              batch.delete(doc(db, "messages", id));
            }
          });

          // Set the incoming/adjusted ones
          updatedList.forEach((msg: any) => {
            if (msg && msg.id) {
              batch.set(doc(db, "messages", msg.id), msg);
            }
          });

          await batch.commit();
          console.log("Successfully batch synced messages to cloud Firestore.");
        } catch (firebaseErr) {
          console.error("Failed to batch sync messages to Firestore, local updates applied:", firebaseErr);
        }
      }

      return res.json(updatedList);
    } catch (e) {
      console.error("Error updating messages collection:", e);
      return res.status(500).json({ error: "Failed to sync messages collection on server" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
