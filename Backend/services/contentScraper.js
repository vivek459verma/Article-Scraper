import axios from "axios";
import * as cheerio from "cheerio";
/**

Scrape main content from a URL
@param {string} url - URL to scrape
@returns {Promise} - Scraped content */

export async function scrapeArticleContent(url) {
  try {
    console.log(`📄 Scraping content from: ${url}`);
    const response = await axios.get(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
      timeout: 10000,
    });
    const $ = cheerio.load(response.data); // Remove unwanted elements
    $(
      "script, style, nav, header, footer, aside, .advertisement, .ads, .social-share"
    ).remove(); // Try multiple selectors to find main content
    let content = "";
    let title = ""; // Extract title
    title =
      $("h1").first().text().trim() ||
      $("title").text().trim() ||
      $('meta[property="og:title"]').attr("content") ||
      ""; // Try common article content selectors
    const contentSelectors = [
      "article",
      ".post-content",
      ".entry-content",
      ".article-content",
      ".blog-content",
      ".content",
      "main",
      ".main-content",
      '[role="main"]',
    ];
    for (const selector of contentSelectors) {
      const element = $(selector);
      if (element.length > 0) {
        content = element.text().trim();
        if (content.length > 200) {
          ("Ensure we got substantial content break");
        }
      }
    } // Fallback: get all paragraph text
    if (!content || content.length < 200) {
      content = $("p")
        .map((i, el) => $(el).text().trim())
        .get()
        .join("\n\n");
    } // Clean up content
    content = content
      .replace(/\s+/g, " ") // Replace multiple spaces with single space
      .replace(/\n\s*\n/g, "\n\n") // Clean up multiple newlines
      .trim();
    console.log(`✓ Scraped ${content.length} characters from ${url}`);
    return {
      title,
      content: content.substring(0, 5000), // Limit content length url
    };
  } catch (error) {
    console.error(Error`scraping ${url}:, error.message`);
    return {
      title: "",
      content: "",
      url,
      error: error.message,
    };
  }
}

/**

Scrape multiple articles
@param {Array} urls - Array of URLs to scrape
@returns {Promise} - Array of scraped content */ export async function scrapeMultipleArticles(
  urls
) {
  const results = [];
  for (const urlObj of urls) {
    const url = typeof urlObj === "string" ? urlObj : urlObj.url;
    const scraped = await scrapeArticleContent(url);
    if (scraped.content && scraped.content.length > 100) {
      results.push(scraped);
    }

    // Add delay to avoid overwhelming servers
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  return results;
}
