import express from "express";
import {
  getAllArticles,
  getArticleById,
  createArticle,
  updateArticle,
  deleteArticle,
  scrapeArticles,
  enhanceArticle,
} from "../controllers/articleController.js";
const router = express.Router();

// Scrape articles endpoint
router.post("/scrape", scrapeArticles);

// Enhance article endpoint
router.post("/:id/enhance", enhanceArticle);

// CRUD endpoints
router.route("/").get(getAllArticles).post(createArticle);

router
  .route("/:id")
  .get(getArticleById)
  .put(updateArticle)
  .delete(deleteArticle);

export default router;
