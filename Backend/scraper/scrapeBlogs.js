import axios from "axios";
import * as cheerio from "cheerio";
import Article from "../models/Article.js";

const BASE_URL = "https://beyondchats.com";
const LAST_PAGE_URL = "https://beyondchats.com/blogs/page/14";

async function scrapeOldest() {
  try {
    console.log("Starting to scrape articles from BeyondChats...");
    console.log(`Fetching last page: ${LAST_PAGE_URL}`);
    // Fetch the last page directly
    const { data } = await axios.get(LAST_PAGE_URL);
    const $ = cheerio.load(data);

    // Get all entry cards on the last page
    const allBlogs = $(".entry-card");
    console.log(`Found ${allBlogs.length} total articles on the last page`);

    // Get the first 5 articles (oldest ones on the last page)
    const blogs = allBlogs.slice(0, 5);
    console.log(`Selecting first ${blogs.length} articles (oldest)`);

    let scrapedCount = 0;
    let skippedCount = 0;
    const articles = [];

    for (let i = 0; i < blogs.length; i++) {
      const blog = blogs[i];
      const title = $(blog).find("h2, h3, .title").text().trim();
      const link = $(blog).find("a").attr("href");

      if (!title || !link) {
        console.log(
          `[${i + 1}/${
            blogs.length
          }] Skipping article with missing title or link`
        );
        continue;
      }

      const fullURL = link.startsWith("http") ? link : BASE_URL + link;

      // Check if article already exists
      const existingArticle = await Article.findOne({ url: fullURL });
      if (existingArticle) {
        console.log(
          `[${i + 1}/${blogs.length}] Article already exists: ${title}`
        );
        skippedCount++;
        continue;
      }

      console.log(`[${i + 1}/${blogs.length}] Fetching content for: ${title}`);

      try {
        // Fetch the article content
        const blogHTML = await axios.get(fullURL);
        const $$ = cheerio.load(blogHTML.data);

        // Try multiple selectors to find content
        let content = $$(".blog-content").text().trim();
        if (!content) {
          content = $$("article").text().trim();
        }
        if (!content) {
          content = $$(".content, .post-content, .entry-content").text().trim();
        }

        if (!content) {
          console.log(
            `[${i + 1}/${blogs.length}] No content found for: ${title}`
          );
          continue;
        }

        // Save to database
        const article = await Article.create({
          title,
          url: fullURL,
          content,
        });

        articles.push(article);
        console.log(`[${i + 1}/${blogs.length}] ✓ Scraped: ${title}`);
        scrapedCount++;

        // Add a small delay to avoid overwhelming the server
        await new Promise((resolve) => setTimeout(resolve, 500));
      } catch (error) {
        console.error(
          `[${i + 1}/${blogs.length}] Error scraping article: ${error.message}`
        );
      }
    }

    console.log(`\n${"=".repeat(50)}`);
    console.log(`Scraping completed!`);
    console.log(`- New articles scraped: ${scrapedCount}`);
    console.log(`- Articles skipped (already exist): ${skippedCount}`);
    console.log(`${"=".repeat(50)}\n`);

    return { scrapedCount, skippedCount, articles };
  } catch (error) {
    console.error("Error scraping articles:", error.message);
    throw error;
  }
}

export default scrapeOldest;
