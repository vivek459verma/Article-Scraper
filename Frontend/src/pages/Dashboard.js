import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchArticles, triggerScrape, enhanceArticle } from "../api";
import { RefreshCw, Clock, ExternalLink, Sparkles } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function Dashboard() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scraping, setScraping] = useState(false);
  const [enhancingId, setEnhancingId] = useState(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const loadArticles = async () => {
    setLoading(true);
    try {
      const { data } = await fetchArticles(page, search);
      setArticles(data.data);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error("Failed to fetch articles", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeout = setTimeout(loadArticles, 300); // Debounce search
    return () => clearTimeout(timeout);
  }, [page, search]);

  const handleScrape = async () => {
    setScraping(true);
    try {
      await triggerScrape();
      alert("Scraping completed successfully!");
      setPage(1);
      loadArticles();
    } catch (error) {
      alert("Error during scraping.");
    } finally {
      setScraping(false);
    }
  };

  const handleEnhance = async (e, articleId) => {
    e.preventDefault(); // Prevent clicking the card link
    if (!window.confirm("This will rewrite the article using AI. Continue?"))
      return;

    setEnhancingId(articleId);
    try {
      await enhanceArticle(articleId);
      // Refresh local state to show updates immediately
      await loadArticles();
      alert("Article enhanced successfully!");
    } catch (error) {
      console.error(error);
      alert("Failed to enhance article. Check server logs.");
    } finally {
      setEnhancingId(null);
    }
  };

  return (
    <div className="container">
      <header>
        <h1>Article Manager</h1>
        <div className="controls">
          <div className="search-wrapper">
            <input
              type="text"
              placeholder="Search articles..."
              className="search-input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button
            className="btn btn-primary"
            onClick={handleScrape}
            disabled={scraping}
          >
            <RefreshCw size={18} className={scraping ? "spin" : ""} />
            {scraping ? "Scraping..." : "Scrape New"}
          </button>
        </div>
      </header>

      {loading ? (
        <p>Loading articles...</p>
      ) : (
        <div className="grid">
          {articles.map((article) => {
            const isUpdated = article.createdAt !== article.updatedAt;
            const isEnhancing = enhancingId === article._id;
            return (
              <Link
                to={`/article/${article._id}`}
                key={article._id}
                className="card"
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                  }}
                >
                  <span
                    className={`badge ${
                      isUpdated ? "badge-updated" : "badge-new"
                    }`}
                  >
                    {isUpdated ? "Enhanced" : "Original"}
                  </span>

                  {/* Enhance Button */}
                  <button
                    className="btn btn-primary"
                    style={{ padding: "0.25rem 0.5rem", fontSize: "0.75rem" }}
                    onClick={(e) => handleEnhance(e, article._id)}
                    disabled={isEnhancing}
                  >
                    {isEnhancing ? (
                      <RefreshCw size={12} className="spin" />
                    ) : (
                      <Sparkles size={12} />
                    )}
                    {isEnhancing ? " Enhancing..." : " Enhance"}
                  </button>
                </div>

                <h2>{article.title}</h2>
                <p>{article.content.substring(0, 150)}...</p>

                <div className="meta">
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    <Clock size={12} />
                    {formatDistanceToNow(new Date(article.updatedAt))} ago
                  </span>
                  <span
                    onClick={(e) => {
                      e.preventDefault();
                      window.open(article.url, "_blank");
                    }}
                    style={{
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    Source <ExternalLink size={12} />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      <div
        className="pagination"
        style={{
          marginTop: "2rem",
          display: "flex",
          gap: "0.5rem",
          justifyContent: "center",
        }}
      >
        <button
          className="btn btn-outline"
          disabled={page === 1}
          onClick={() => setPage((p) => Math.max(1, p - 1))}
        >
          Previous
        </button>
        <span style={{ display: "flex", alignItems: "center" }}>
          Page {page} of {totalPages}
        </span>
        <button
          className="btn btn-outline"
          disabled={page === totalPages}
          onClick={() => setPage((p) => p + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
}
