import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchArticleById } from "../api";
import { ArrowLeft, Calendar, Link as LinkIcon } from "lucide-react";

export default function ArticleView() {
  const { id } = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getArticle = async () => {
      try {
        const { data } = await fetchArticleById(id);
        setArticle(data.data);
      } catch (error) {
        console.error("Error fetching article", error);
      } finally {
        setLoading(false);
      }
    };
    getArticle();
  }, [id]);

  if (loading) return <div className="container">Loading...</div>;
  if (!article) return <div className="container">Article not found</div>;

  return (
    <div className="container">
      <Link to="/" className="back-link">
        <ArrowLeft size={16} /> Back to Dashboard
      </Link>

      <article className="article-detail">
        <h1 style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>
          {article.title}
        </h1>

        <div
          style={{
            display: "flex",
            gap: "1.5rem",
            color: "#64748b",
            marginBottom: "2rem",
            borderBottom: "1px solid #e2e8f0",
            paddingBottom: "1rem",
          }}
        >
          <span
            style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
          >
            <Calendar size={16} />
            Created: {new Date(article.createdAt).toLocaleDateString()}
          </span>
          <span
            style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
          >
            <Calendar size={16} />
            Updated: {new Date(article.updatedAt).toLocaleDateString()}
          </span>
          <a
            href={article.url}
            target="_blank"
            rel="noreferrer"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              color: "#2563eb",
              textDecoration: "none",
            }}
          >
            <LinkIcon size={16} />
            Original Source
          </a>
        </div>

        <div className="article-content">{article.content}</div>
      </article>
    </div>
  );
}
