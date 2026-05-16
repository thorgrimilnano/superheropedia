import express from "express";
import path from "path";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;
const COMIC_VINE_API_URL = "https://comicvine.gamespot.com/api";

const getApiKey = () => {
  let key = process.env.COMIC_VINE_API_KEY;
  if (!key) {
    console.warn("WARNING: COMIC_VINE_API_KEY is not set in environment variables.");
    return null;
  }
  // Remove possible quotes and trim whitespace
  const cleanedKey = key.trim().replace(/^["'](.+)["']$/, '$1');
  console.log(`API Key found (starts with: ${cleanedKey.substring(0, 4)}... ends with: ${cleanedKey.substring(cleanedKey.length - 4)})`);
  return cleanedKey;
};

// Function to get axios instance with dynamic User-Agent
const getAxios = () => {
  return axios.create({
    headers: {
      "User-Agent": `SuperheroPedia/1.0.0 (${process.env.APP_URL || "https://superheropedia-one.vercel.app"})`,
    },
    timeout: 8000, // 8 second timeout
  });
};

app.use(express.json());

// Proxy Health Check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Server is internal healthy", vercel: !!process.env.VERCEL });
});

// Proxy Search
app.get("/api/search", async (req, res) => {
  console.log("Processing search request for:", req.query.query);
  const apiKey = getApiKey();
  if (!apiKey) {
    console.error("Missing COMIC_VINE_API_KEY");
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

    console.log("Comic Vine Search Response Status:", response.status);
    res.json(response.data);
  } catch (error: any) {
    console.error("Search Proxy Error Details:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      config: {
        url: error.config?.url,
        params: { ...error.config?.params, api_key: "***" }
      }
    });
    res.status(error.response?.status || 500).json({ 
      error: error.message,
      details: error.response?.data || "No details"
    });
  }
});

// Proxy Character Detail
app.get("/api/character/:id", async (req, res) => {
  console.log("Processing character detail request for:", req.params.id);
  const apiKey = getApiKey();
  if (!apiKey) {
    console.error("Missing COMIC_VINE_API_KEY");
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

    console.log("Comic Vine Character Detail Status:", response.status);
    res.json(response.data);
  } catch (error: any) {
    console.error("Character Detail Proxy Error Details:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });
    res.status(error.response?.status || 500).json({ 
      error: error.message,
      details: error.response?.data || "No details"
    });
  }
});

// Proxy Issue Detail (for covers)
app.get("/api/issue/:id", async (req, res) => {
  console.log("Processing issue detail request for:", req.params.id);
  const apiKey = getApiKey();
  if (!apiKey) {
    console.error("Missing COMIC_VINE_API_KEY");
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

    console.log("Comic Vine Issue Detail Status:", response.status);
    res.json(response.data);
  } catch (error: any) {
    console.error("Issue Proxy Error Details:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });
    res.status(error.response?.status || 500).json({ 
      error: error.message,
      details: error.response?.data || "No details"
    });
  }
});

// Global error handler
app.use((err: any, req: any, res: any, next: any) => {
  console.error("Global Catch-all Error:", err);
  res.status(500).json({ 
    error: "Internal Server Error", 
    message: err.message,
    stack: process.env.NODE_ENV === "production" ? undefined : err.stack 
  });
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
