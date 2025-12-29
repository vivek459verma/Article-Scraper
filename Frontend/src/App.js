import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import ArticleView from "./pages/ArticleView";
import "./App.css";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/article/:id" element={<ArticleView />} />
      </Routes>
    </Router>
  );
}

export default App;
