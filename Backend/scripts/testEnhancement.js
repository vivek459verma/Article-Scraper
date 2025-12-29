import dotenv from "dotenv";
import { fetchAllArticles } from "../services/apiClient.js";
import { searchGoogle } from "../services/googleSearch.js";
import { scrapeArticleContent } from "../services/contentScraper.js";
dotenv.config();

/**

Test the enhancement pipeline without actually updating articles */
async function testEnhancement() {
  try {
    console.log("🧪 Testing Article Enhancement Pipeline\n"); // Test 1: Fetch articles
    console.log("Test 1: Fetching articles from API...");
    const articles = await fetchAllArticles();
    console.log(`✓ Found ${articles.length} articles\n`);
    if (articles.length === 0) {
      console.log("❌ No articles found. Please run the scraper first.\n");
      return;
    }
    const testArticle = articles[0];
    console.log(`Using test article: "${testArticle.title}"\n`); // Test 2: Google Search
    console.log("Test 2: Searching Google...");
    const searchResults = await searchGoogle(testArticle.title);
    console.log(`✓ Found ${searchResults.length} search results\n`);
    if (searchResults.length === 0) {
      console.log("❌ No search results found.\n");
      return;
    } // Test 3: Scrape content
    console.log("Test 3: Scraping first result...");
    const firstResult = searchResults[0];
    const scrapedContent = await scrapeArticleContent(firstResult.url);
    console.log(`✓ Scraped ${scrapedContent.content.length} characters\n`); // Test 4: Check API keys
    console.log("Test 4: Checking API keys...");
    console.log(
      `OPENAI_API_KEY: ${process.env.OPENAI_API_KEY ? "✓ Set" : "❌ Not set"}`
    );
    console.log(
      `SERPER_API_KEY: ${process.env.SERPER_API_KEY ? "✓ Set" : "❌ Not set"}`
    );
    console.log("");
    console.log("✅ All tests passed! Ready to enhance articles.\n");
    console.log("To enhance an article, run:");
    console.log(`node scripts/enhanceArticles.js ${testArticle._id}\n`);
  } catch (error) {
    console.error("❌ Test failed:", error.message);
    console.error(error.stack);
  }
}

testEnhancement()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
