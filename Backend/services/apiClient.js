import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const API_BASE_URL = process.env.API_BASE_URL;

/**

Fetch all articles from the API
@returns {Promise} - Array of articles */ export async function fetchAllArticles() {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/articles`);
    return response.data.data || [];
  } catch (error) {
    console.error("Error fetching articles:", error.message);
    throw error;
  }
}
/**

Fetch a single article by ID
@param {string} articleId - Article ID
@returns {Promise} - Article object */ export async function fetchArticleById(
  articleId
) {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/api/articles/${articleId}`
    );
    return response.data.data;
  } catch (error) {
    console.error(`Error fetching article ${articleId}:`, error.message);
    throw error;
  }
}
/**

Update an article
@param {string} articleId - Article ID
@param {Object} updateData - Data to update
@returns {Promise} - Updated article */ export async function updateArticle(
  articleId,
  updateData
) {
  try {
    const response = await axios.put(
      ` ${API_BASE_URL}/api/articles/${articleId}`,
      updateData,
      { headers: { "Content-Type": "application/json" } }
    );
    return response.data.data;
  } catch (error) {
    console.error(`Error updating article ${articleId}:`, error.message);
    throw error;
  }
}
/**

Create a new article
@param {Object} articleData - Article data
@returns {Promise} - Created article */ export async function createArticle(
  articleData
) {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/api/articles`,
      articleData,
      { headers: { "Content-Type": "application/json" } }
    );
    return response.data.data;
  } catch (error) {
    console.error("Error creating article:", error.message);
    throw error;
  }
}
