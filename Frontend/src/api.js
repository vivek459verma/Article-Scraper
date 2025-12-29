import axios from "axios";
// import dotenv from "dotenv";
// dotenv.config();

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const fetchArticles = (page = 1, search = "") =>
  api.get("/", { params: { page, search } });

export const fetchArticleById = (id) => api.get(`/${id}`);

export const triggerScrape = () => api.post("/scrape");

// Add this new function
export const enhanceArticle = (id) => api.post(`/${id}/enhance`);
