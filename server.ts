import express from "express";
import path from "path";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;
const COMIC_VINE_API_URL = "https://comicvine.gamespot.com/api";

const getApiKey = () => {
  const key = process.env.COMIC_VINE_API_KEY;
  if (!key) {
    console.warn("WARNING: COMIC_VINE_API_KEY is not set in environment variables.");
  }
  return key;
};

// Function to get axios instance with dynamic User-Agent
const getAxios = () => {
  return axios.create({
    headers: {
      "User-Agent": `SuperheroPedia/1.0.0 (${process.env.APP_URL || "http://localhost:3000"})`,
    },
  });
};

app.use(express.json());

// Proxy Search
app.get("/api/search", async (req, res) => {
  const apiKey = getApiKey();
  if (!apiKey) {
    return res.status(401).json({ error: "API Key missing. Please set COMIC_VINE_API_KEY." });
  }

  try {
    const { query } = req.query;
    if (!query) {
      return res.status(400).json({ error: "Query parameter is required" });
    }

    const response = await getAxios().get(`${COMIC_VINE_API_URL}/search/`, {
      params: {
        api_key: apiKey,
        format: "json",
        query,
        resources: "character",
      },
    });

    res.json(response.data);
  } catch (error: any) {
    console.error("Search Proxy Error:", error.message);
    res.status(error.response?.status || 500).json({ 
      error: error.message,
      details: error.response?.data || "No details"
    });
  }
});

// Proxy Character Detail
app.get("/api/character/:id", async (req, res) => {
  const apiKey = getApiKey();
  if (!apiKey) {
    return res.status(401).json({ error: "API Key missing. Please set COMIC_VINE_API_KEY." });
  }

  try {
    const { id } = req.params;
    const response = await getAxios().get(`${COMIC_VINE_API_URL}/character/${id}/`, {
      params: {
        api_key: apiKey,
        format: "json",
        field_list: "name,image,description,powers,story_arc_credits,issue_credits,deck",
      },
    });

    res.json(response.data);
  } catch (error: any) {
    console.error("Character Detail Proxy Error:", error.message);
    res.status(error.response?.status || 500).json({ 
      error: error.message,
      details: error.response?.data || "No details"
    });
  }
});

// Proxy Issue Detail (for covers)
app.get("/api/issue/:id", async (req, res) => {
  const apiKey = getApiKey();
  if (!apiKey) {
    return res.status(401).json({ error: "API Key missing. Please set COMIC_VINE_API_KEY." });
  }

  try {
    const { id } = req.params;
    const response = await getAxios().get(`${COMIC_VINE_API_URL}/issue/${id}/`, {
      params: {
        api_key: apiKey,
        format: "json",
        field_list: "image,volume,issue_number,name",
      },
    });

    res.json(response.data);
  } catch (error: any) {
    console.error("Issue Proxy Error:", error.message);
    res.status(error.response?.status || 500).json({ 
      error: error.message,
      details: error.response?.data || "No details"
    });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else if (!process.env.VERCEL) {
    // Only serve static files via Express if NOT on Vercel
    // Vercel handles static file serving via its own infrastructure
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  if (!process.env.VERCEL) {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  }
}

if (!process.env.VERCEL) {
  startServer();
}

export default app;
