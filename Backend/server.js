import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import articleRoutes from "./routes/articleRoutes.js";
import cors from "cors";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS middleware (optional, but recommended)
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  next();
});

// Validate MongoDB URI
if (!process.env.MONGO_URI) {
  console.error("ERROR: MONGO_URI is not defined in .env file");
  process.exit(1);
}

// Routes
app.use("/api/articles", articleRoutes);

// Root route
app.get("/", (req, res) => {
  res.json({
    message: "BeyondChats Article Scraper API",
    endpoints: {
      articles: {
        getAll: "GET /api/articles",
        getById: "GET /api/articles/:id",
        create: "POST /api/articles",
        update: "PUT /api/articles/:id",
        delete: "DELETE /api/articles/:id",
        scrape: "POST /api/articles/scrape",
      },
    },
  });
});

app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✓ MongoDB connected successfully");
    app.listen(PORT, () => {
      console.log(`✓ Server running on http://localhost:${PORT}`);
      console.log(`✓ API Documentation: http://localhost:${PORT}/`);
    });
  })
  .catch((err) => {
    console.error("✗ MongoDB connection error:", err.message);
    process.exit(1);
  });
