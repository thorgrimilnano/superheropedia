import express from "express";
import path from "path";
import axios from "axios";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;
const COMIC_VINE_API_URL = "https://comicvine.gamespot.com/api";
const API_KEY = process.env.COMIC_VINE_API_KEY;

// Use a custom User-Agent as required by Comic Vine API
const axiosInstance = axios.create({
  headers: {
    "User-Agent": "SuperheroPedia/1.0.0 (https://ais-dev-jxl7c2ew7hngmppjszmcpm-396187834612.us-west2.run.app)",
  },
});

app.use(express.json());

// Proxy Search
app.get("/api/search", async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) {
      return res.status(400).json({ error: "Query parameter is required" });
    }

    const response = await axiosInstance.get(`${COMIC_VINE_API_URL}/search/`, {
      params: {
        api_key: API_KEY,
        format: "json",
        query,
        resources: "character",
      },
    });

    res.json(response.data);
  } catch (error: any) {
    console.error("Search Proxy Error:", error.message);
    res.status(error.response?.status || 500).json({ error: error.message });
  }
});

// Proxy Character Detail
app.get("/api/character/:id", async (req, res) => {
  try {
    const { id } = req.params;
    // id should be something like "4005-NNN"
    const response = await axiosInstance.get(`${COMIC_VINE_API_URL}/character/${id}/`, {
      params: {
        api_key: API_KEY,
        format: "json",
        field_list: "name,image,description,powers,story_arc_credits,issue_credits,deck",
      },
    });

    res.json(response.data);
  } catch (error: any) {
    console.error("Character Detail Proxy Error:", error.message);
    res.status(error.response?.status || 500).json({ error: error.message });
  }
});

// Proxy Issue Detail (for covers)
app.get("/api/issue/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const response = await axiosInstance.get(`${COMIC_VINE_API_URL}/issue/${id}/`, {
      params: {
        api_key: API_KEY,
        format: "json",
        field_list: "image,volume,issue_number,name",
      },
    });

    res.json(response.data);
  } catch (error: any) {
    console.error("Issue Proxy Error:", error.message);
    res.status(error.response?.status || 500).json({ error: error.message });
  }
});

async function startServer() {
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
