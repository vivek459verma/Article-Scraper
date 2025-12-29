import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

/**

Search Google for articles using Serper API
@param {string} query - Search query
@returns {Promise} - Array of search results */

export async function searchGoogle(query) {
  try {
    console.log(`🔍 Searching Google for: "${query}"`);
    // Check if API key is set
    if (!process.env.SERPER_API_KEY) {
      throw new Error(
        "SERPER_API_KEY is not set in .env file. Get your free API key from https://serper.dev/"
      );
    }

    const response = await axios.post(
      "https://google.serper.dev/search",
      {
        q: query,
        num: 10, // Get more results to filter
      },
      {
        headers: {
          "X-API-KEY": process.env.SERPER_API_KEY,
          "Content-Type": "application/json",
        },
      }
    );
    const results = response.data.organic || []; // Filter for blog/article URLs (exclude social media, videos, etc.)
    const blogResults = results.filter((result) => {
      const url = result.link.toLowerCase();
      const title = result.title.toLowerCase(); // Exclude non-article sites
      const excludeDomains = [
        "youtube.com",
        "facebook.com",
        "twitter.com",
        "instagram.com",
        "linkedin.com",
        "pinterest.com",
        "reddit.com",
        "quora.com",
        "wikipedia.org",
        "amazon.com",
        "ebay.com",
      ];
      const isExcluded = excludeDomains.some((domain) => url.includes(domain)); // Include if it looks like a blog/article
      const isBlogLike =
        url.includes("/blog") ||
        url.includes("/article") ||
        url.includes("/post") ||
        title.includes("blog") ||
        title.includes("article");
      return !isExcluded && (isBlogLike || true);
    });
    const topTwo = blogResults.slice(0, 2).map((result) => ({
      title: result.title,
      url: result.link,
      snippet: result.snippet || "",
    }));
    console.log(`✓ Found ${topTwo.length} relevant articles`);
    topTwo.forEach((result, index) => {
      console.log(` ${index + 1}. ${result.title}`);
      console.log(`${result.url}`);
    });
    return topTwo;
  } catch (error) {
    console.error("Error searching Google:", error.message);
    throw error;
  }
}

/**

Alternative: Search using custom Google Search (fallback)
This uses a simple scraping approach if Serper API is not available */
export async function searchGoogleFallback(query) {
  try {
    console.log(`🔍 Searching Google (fallback) for: "${query}"`);
    const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(
      query
    )}&num=10`;
    const response = await axios.get(searchUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
    }); // Note: This is a simplified version. Google's HTML structure changes frequently. For production, use Serper API or Google Custom Search API
    console.log("⚠️ Fallback search - results may be limited");
    return [];
  } catch (error) {
    console.error("Error in fallback search:", error.message);
    return [];
  }
}
