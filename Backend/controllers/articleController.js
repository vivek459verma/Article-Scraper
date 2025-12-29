import Article from "../models/Article.js";
import scrapeOldest from "../scraper/scrapeBlogs.js";
import { searchGoogle } from "../services/googleSearch.js";
import { scrapeMultipleArticles } from "../services/contentScraper.js";
import { rewriteArticleWithLLM } from "../services/llmService.js";
import { generateImprovedTitle } from "../services/llmService.js";
// @desc Get all articles
// @route GET /api/articles
// @access Public
export const getAllArticles = async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const query = search
      ? {
          $or: [
            { title: { $regex: search, $options: "i" } },
            { content: { $regex: search, $options: "i" } },
          ],
        }
      : {};

    const articles = await Article.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select("-__v");

    const count = await Article.countDocuments(query);

    res.status(200).json({
      success: true,
      data: articles,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching articles",
      error: error.message,
    });
  }
};

// @desc Get single article by ID
// @route GET /api/articles/:id
// @access Public
export const getArticleById = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id).select("-__v");
    if (!article) {
      return res.status(404).json({
        success: false,
        message: "Article not found",
      });
    }

    res.status(200).json({
      success: true,
      data: article,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching article",
      error: error.message,
    });
  }
};

// @desc Create new article
// @route POST /api/articles
// @access Public
export const createArticle = async (req, res) => {
  try {
    const { title, url, content } = req.body;
    if (!title || !url || !content) {
      return res.status(400).json({
        success: false,
        message: "Please provide title, url, and content",
      });
    }

    // Check if article with same URL already exists
    const existingArticle = await Article.findOne({ url });
    if (existingArticle) {
      return res.status(400).json({
        success: false,
        message: "Article with this URL already exists",
      });
    }

    const article = await Article.create({ title, url, content });

    res.status(201).json({
      success: true,
      data: article,
      message: "Article created successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creating article",
      error: error.message,
    });
  }
};

// @desc Enhance article with AI
// @route POST /api/articles/:id/enhance
// @access Public
export const enhanceArticle = async (req, res) => {
  try {
    const { id } = req.params;
    const article = await Article.findById(id);

    if (!article) {
      return res
        .status(404)
        .json({ success: false, message: "Article not found" });
    }

    // 1. Search Google for context
    const searchResults = await searchGoogle(article.title);
    if (searchResults.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No relevant articles found to use as reference.",
      });
    }

    // 2. Scrape content from top results
    const scrapedArticles = await scrapeMultipleArticles(searchResults);
    if (scrapedArticles.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Could not scrape reference content.",
      });
    }

    // 3. Rewrite article
    const rewrittenData = await rewriteArticleWithLLM(article, scrapedArticles);

    // 4. Generate new title
    const improvedTitle = await generateImprovedTitle(
      article.title,
      scrapedArticles
    );

    // 5. Update Database
    article.title = improvedTitle || article.title;
    article.content = rewrittenData.content;

    // Explicitly update timestamps if needed, though Mongoose handles 'updatedAt'
    await article.save();

    res.status(200).json({
      success: true,
      message: "Article enhanced successfully",
      data: article,
    });
  } catch (error) {
    console.error("Enhancement error:", error);
    res.status(500).json({
      success: false,
      message: "Error enhancing article",
      error: error.message,
    });
  }
};

// @desc Update article
// @route PUT /api/articles/:id
// @access Public
export const updateArticle = async (req, res) => {
  try {
    const { title, url, content } = req.body;
    const article = await Article.findById(req.params.id);

    if (!article) {
      return res.status(404).json({
        success: false,
        message: "Article not found",
      });
    }

    // Check if new URL conflicts with existing article
    if (url && url !== article.url) {
      const existingArticle = await Article.findOne({ url });
      if (existingArticle) {
        return res.status(400).json({
          success: false,
          message: "Article with this URL already exists",
        });
      }
    }

    article.title = title || article.title;
    article.url = url || article.url;
    article.content = content || article.content;

    await article.save();

    res.status(200).json({
      success: true,
      data: article,
      message: "Article updated successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating article",
      error: error.message,
    });
  }
};

// @desc Delete article
// @route DELETE /api/articles/:id
// @access Public
export const deleteArticle = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) {
      return res.status(404).json({
        success: false,
        message: "Article not found",
      });
    }

    await article.deleteOne();

    res.status(200).json({
      success: true,
      message: "Article deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting article",
      error: error.message,
    });
  }
};

// @desc Trigger scraping of articles
// @route POST /api/articles/scrape
// @access Public
export const scrapeArticles = async (req, res) => {
  try {
    const result = await scrapeOldest();
    res.status(200).json({
      success: true,
      message: "Scraping completed successfully",
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error scraping articles",
      error: error.message,
    });
  }
};
