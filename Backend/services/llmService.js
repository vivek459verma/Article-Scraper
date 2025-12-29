import OpenAI from "openai";
import dotenv from "dotenv";
import { OpenRouter } from "@openrouter/sdk";
dotenv.config();

const openai = new OpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
});

/**

Rewrite article using LLM based on reference articles
@param {Object} originalArticle - Original article object
@param {Array} referenceArticles - Array of reference articles
@returns {Promise} - Rewritten article with references */

export async function rewriteArticleWithLLM(
  originalArticle,
  referenceArticles
) {
  try {
    console.log(`🤖 Rewriting article using AI...`); // Prepare reference content
    const referencesText = referenceArticles
      .map((ref, index) => {
        return `Reference Article ${index + 1}:Title: ${ref.title}URL: ${
          ref.url
        }Content Preview: ${ref.content.substring(0, 1000)}...`;
      })
      .join("\n---\n");
    // Create prompt for LLM
    const prompt = `You are an expert content writer. Your task is to rewrite and enhance an article based on the style, formatting, and structure of top-ranking articles on Google.
ORIGINAL ARTICLE:
Title: ${originalArticle.title}
Content: ${originalArticle.content}

TOP-RANKING REFERENCE ARTICLES:
${referencesText}`;
    const completion = await openai.chat.send({
      model: "xiaomi/mimo-v2-flash:free",
      messages: [
        {
          role: "system",
          content:
            "You are an expert content writer. Your task is to rewrite and enhance an article based on the style, formatting, and structure of top-ranking articles on Google.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 3000,
    });

    const rewrittenContent = completion.choices[0].message.content;

    // Add references section
    const referencesSection = `top-ranking articles:
${referenceArticles
  .map((ref, index) => {
    return `${index + 1}.[${ref.title}](${ref.url})
`;
  })
  .join("\n")}`;
    const finalContent = rewrittenContent + referencesSection;

    console.log(
      `✓ Article rewritten successfully (${finalContent.length} characters)`
    );

    return {
      content: finalContent,
      originalLength: originalArticle.content.length,
      newLength: finalContent.length,
      referencesUsed: referenceArticles.length,
    };
  } catch (error) {
    console.error("Error rewriting article with LLM:", error.message);
    throw error;
  }
}
/**

Generate improved title using LLM
@param {string} originalTitle - Original article title
@param {Array} referenceArticles - Reference articles for context
@returns {Promise} - Improved title */
export async function generateImprovedTitle(originalTitle, referenceArticles) {
  try {
    const referenceTitles = referenceArticles
      .map((ref) => ref.title)
      .join("\n");
    const prompt = `Given the original title and reference titles from top-ranking articles, create an improved, SEO-friendly title.
    Original Title: ${originalTitle}
    Top-Ranking Titles:${referenceTitles}`;

    const completion = await openai.chat.send({
      model: "xiaomi/mimo-v2-flash:free",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 100,
    });

    return completion.choices[0].message.content
      .trim()
      .replace(/^["']|["']$/g, "");
  } catch (error) {
    console.error("Error generating improved title:", error.message);
    throw error;
  }
}
