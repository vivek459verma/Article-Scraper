import dotenv from "dotenv";
import {
  fetchAllArticles,
  fetchArticleById,
  updateArticle,
} from "../services/apiClient.js";
import { searchGoogle } from "../services/googleSearch.js";
import { scrapeMultipleArticles } from "../services/contentScraper.js";
import {
  rewriteArticleWithLLM,
  generateImprovedTitle,
} from "../services/llmService.js";
dotenv.config();

/**

Enhance a single article
@param {string} articleId - Article ID to enhance */
async function enhanceSingleArticle(articleId) {
  try {
    console.log(`\n${"=".repeat(60)}`);
    console.log(`Starting enhancement process for article: ${articleId}`);
    console.log(`${"=".repeat(60)}\n`); // Step 1: Fetch the original article
    console.log("📥 Step 1: Fetching original article...");
    const originalArticle = await fetchArticleById(articleId);
    console.log(`✓ Fetched: "${originalArticle.title}"\n`); // Step 2: Search Google for the article title
    console.log("📥 Step 2: Searching Google for similar articles...");
    const searchResults = await searchGoogle(originalArticle.title);
    if (searchResults.length === 0) {
      console.log("⚠️ No search results found. Skipping this article.\n");
      return null;
    }
    console.log(""); // Step 3: Scrape content from top 2 results
    console.log("📥 Step 3: Scraping content from top-ranking articles...");
    const scrapedArticles = await scrapeMultipleArticles(searchResults);
    if (scrapedArticles.length === 0) {
      console.log("⚠️ Could not scrape any reference articles. Skipping.\n");
      return null;
    }
    console.log(
      `✓ Successfully scraped ${scrapedArticles.length} reference articles\n`
    ); // Step 4: Rewrite article using LLM
    console.log("📥 Step 4: Rewriting article with AI...");
    const rewrittenData = await rewriteArticleWithLLM(
      originalArticle,
      scrapedArticles
    );
    console.log(""); // Step 5: Generate improved title (optional)
    console.log("📥 Step 5: Generating improved title...");
    const improvedTitle = await generateImprovedTitle(
      originalArticle.title,
      scrapedArticles
    );
    console.log(`✓ New title: "${improvedTitle}"\n`); // Step 6: Update the article via API
    console.log("📥 Step 6: Publishing enhanced article...");
    const updatedArticle = await updateArticle(articleId, {
      title: improvedTitle,
      content: rewrittenData.content,
    });
    console.log(`✓ Article updated successfully!\n`); // Summary
    console.log(`${"=".repeat(60)}`);
    console.log("✅ ENHANCEMENT COMPLETE");
    console.log(`${"=".repeat(60)}`);
    console.log(`Original Title: ${originalArticle.title}`);
    console.log(`New Title: ${improvedTitle}`);
    console.log(`Original Length: ${rewrittenData.originalLength} characters`);
    console.log(`New Length: ${rewrittenData.newLength} characters`);
    console.log(`References Used: ${rewrittenData.referencesUsed}`);
    console.log(`Article ID: ${articleId}`);
    console.log(`${"=".repeat(60)}\n`);
    return updatedArticle;
  } catch (error) {
    console.error(`\n❌ Error enhancing article ${articleId}:`, error.message);
    console.error(error.stack);
    return null;
  }
}

/**

Enhance all articles in the database */ async function enhanceAllArticles() {
  try {
    console.log("\n🚀 Starting bulk article enhancement process...\n"); // Fetch all articles
    const articles = await fetchAllArticles();
    console.log(`Found ${articles.length} articles to enhance\n`);
    if (articles.length === 0) {
      console.log("No articles found. Please scrape some articles first.\n");
      return;
    }
    let successCount = 0;
    let failCount = 0; // Process each article
    for (let i = 0; i < articles.length; i++) {
      const article = articles[i];
      console.log(
        `\n[${i + 1}/${articles.length}] Processing: ${article.title}`
      );
      const result = await enhanceSingleArticle(article._id);
      if (result) {
        successCount++;
      } else {
        failCount++;
      }
      if (i < articles.length - 1) {
        console.log("⏳ Waiting 5 seconds before next article...\n");
        await new Promise((resolve) => setTimeout(resolve, 5000));
      }
    } // Final summary
    console.log("\n" + "=".repeat(60));
    console.log("🎉 BULK ENHANCEMENT COMPLETE");
    console.log("=".repeat(60));
    console.log(`Total Articles: ${articles.length}`);
    console.log(`Successfully Enhanced: ${successCount}`);
    console.log(`Failed: ${failCount}`);
    console.log("=".repeat(60) + "\n");
  } catch (error) {
    console.error("Error in bulk enhancement:", error.message);
    console.error(error.stack);
  }
}

// Main execution
const args = process.argv.slice(2);

if (args.length === 0) {
  console.log(`
Usage:
node scripts/enhanceArticles.js - Enhance a specific article
node scripts/enhanceArticles.js --all - Enhance all articles

Examples:
node scripts/enhanceArticles.js 6951249b789373aa0839a394
node scripts/enhanceArticles.js --all
`);
  process.exit(0);
}

if (args[0] === "--all") {
  enhanceAllArticles()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
} else {
  const articleId = args[0];
  enhanceSingleArticle(articleId)
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
