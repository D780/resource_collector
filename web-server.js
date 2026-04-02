const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');
const Crawler = require('./crawler');
const Parser = require('./parser');
const logger = require('./src/logger');

const PORT = 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');

let crawler;
let parser;

async function init() {
  crawler = new Crawler();
  parser = new Parser();
  try {
    await crawler.init();
    logger.info('Web server modules initialized');
  } catch (error) {
    logger.warn('Crawler initialization failed, server will start with limited functionality', { error: error.message });
  }
}

const mimeTypes = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

function serveStaticFile(res, filePath) {
  const extname = String(path.extname(filePath)).toLowerCase();
  const contentType = mimeTypes[extname] || 'application/octet-stream';

  fs.readFile(filePath, (error, content) => {
    if (error) {
      if (error.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.end('<h1>404 Not Found</h1>', 'utf-8');
      } else {
        res.writeHead(500);
        res.end(`Server Error: ${error.code}`, 'utf-8');
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
}

function sendJsonResponse(res, data, statusCode = 200) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data), 'utf-8');
}

function sendHtmlResponse(res, html, statusCode = 200) {
  res.writeHead(statusCode, { 'Content-Type': 'text/html' });
  res.end(html, 'utf-8');
}

function getHomePage() {
  return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>动漫资源收集器</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 2rem;
    }
    .navbar {
      max-width: 900px;
      margin: 0 auto 2rem;
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      border-radius: 16px;
      padding: 1rem 2rem;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
      display: flex;
      justify-content: space-between;
      align-items: center;
      animation: slideDown 0.6s ease-out;
    }
    @keyframes slideDown {
      from {
        opacity: 0;
        transform: translateY(-20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    .logo {
      font-size: 1.5rem;
      font-weight: 700;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .nav-links {
      display: flex;
      gap: 1.5rem;
    }
    .nav-links a {
      color: #4a5568;
      text-decoration: none;
      font-weight: 500;
      padding: 0.5rem 1rem;
      border-radius: 8px;
      transition: all 0.3s ease;
      position: relative;
    }
    .nav-links a:hover {
      color: #667eea;
      background: rgba(102, 126, 234, 0.1);
      transform: translateY(-2px);
    }
    .nav-links a.active {
      color: #667eea;
      background: rgba(102, 126, 234, 0.15);
    }
    .container {
      max-width: 900px;
      margin: 0 auto;
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      padding: 3rem;
      border-radius: 24px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
      animation: fadeInUp 0.8s ease-out;
    }
    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    h1 {
      color: #1a202c;
      text-align: center;
      font-size: 2.5rem;
      margin-bottom: 1rem;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 1rem;
    }
    h1 .emoji {
      font-size: 3rem;
      animation: bounce 2s infinite;
    }
    @keyframes bounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-10px); }
    }
    .subtitle {
      text-align: center;
      color: #718096;
      font-size: 1.1rem;
      margin-bottom: 2.5rem;
    }
    .search-box {
      display: flex;
      gap: 1rem;
      margin-top: 2rem;
      position: relative;
    }
    .search-box::before {
      content: '🔍';
      position: absolute;
      left: 1.25rem;
      top: 50%;
      transform: translateY(-50%);
      font-size: 1.25rem;
      z-index: 1;
    }
    input[type="text"] {
      flex: 1;
      padding: 1rem 1rem 1rem 3.5rem;
      border: 2px solid #e2e8f0;
      border-radius: 16px;
      font-size: 1.1rem;
      transition: all 0.3s ease;
      outline: none;
      background: #f7fafc;
    }
    input[type="text"]:focus {
      border-color: #667eea;
      background: white;
      box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
    }
    input[type="text"]::placeholder {
      color: #a0aec0;
    }
    button {
      padding: 1rem 2rem;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      border-radius: 16px;
      cursor: pointer;
      font-size: 1.1rem;
      font-weight: 600;
      transition: all 0.3s ease;
      box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
    }
    button:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(102, 126, 234, 0.5);
    }
    button:active {
      transform: translateY(0);
    }
    .history-section {
      margin-top: 2.5rem;
      padding-top: 2rem;
      border-top: 2px solid #e2e8f0;
    }
    .history-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }
    .history-header h2 {
      color: #1a202c;
      font-size: 1.3rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .clear-history-btn {
      padding: 0.5rem 1rem;
      font-size: 0.9rem;
      background: #e2e8f0;
      color: #4a5568;
      box-shadow: none;
    }
    .clear-history-btn:hover {
      background: #cbd5e0;
      transform: none;
      box-shadow: none;
    }
    .history-list {
      display: flex;
      flex-wrap: wrap;
      gap: 0.75rem;
    }
    .history-item {
      padding: 0.75rem 1.25rem;
      background: #f7fafc;
      border: 2px solid #e2e8f0;
      border-radius: 12px;
      cursor: pointer;
      transition: all 0.3s ease;
      color: #4a5568;
      font-weight: 500;
    }
    .history-item:hover {
      border-color: #667eea;
      background: white;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
      color: #667eea;
    }
    .no-history {
      color: #a0aec0;
      text-align: center;
      padding: 2rem;
    }
    .toast {
      position: fixed;
      bottom: 2rem;
      left: 50%;
      transform: translateX(-50%) translateY(100px);
      background: #1a202c;
      color: white;
      padding: 1rem 2rem;
      border-radius: 12px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
      opacity: 0;
      transition: all 0.4s ease;
      z-index: 1000;
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    .toast.show {
      transform: translateX(-50%) translateY(0);
      opacity: 1;
    }
    .toast.success {
      background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
    }
    @media (max-width: 1024px) {
      .container {
        padding: 2rem;
      }
      h1 {
        font-size: 2rem;
      }
    }
    @media (max-width: 768px) {
      body {
        padding: 1rem;
      }
      .navbar {
        padding: 1rem;
        flex-direction: column;
        gap: 1rem;
      }
      .nav-links {
        gap: 1rem;
      }
      .container {
        padding: 1.5rem;
      }
      h1 {
        font-size: 1.6rem;
      }
      h1 .emoji {
        font-size: 2rem;
      }
      .subtitle {
        font-size: 1rem;
      }
      .search-box {
        flex-direction: column;
      }
      button {
        width: 100%;
      }
      .history-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
      }
      .clear-history-btn {
        width: 100%;
      }
      .history-item {
        width: 100%;
        text-align: center;
      }
    }
  </style>
</head>
<body>
  <nav class="navbar">
    <div class="logo">🎬 动漫资源</div>
    <div class="nav-links">
      <a href="/" class="active">首页</a>
      <a href="/search">搜索页</a>
    </div>
  </nav>
  <div class="container">
    <h1><span class="emoji">🎬</span> 动漫资源收集器</h1>
    <p class="subtitle">探索精彩的动漫世界，轻松获取你想要的资源</p>
    <form action="/search" method="GET" id="searchForm">
      <div class="search-box">
        <input type="text" name="keyword" id="searchInput" placeholder="输入动漫名称搜索..." required>
        <button type="submit">开始搜索</button>
      </div>
    </form>
    <div class="history-section">
      <div class="history-header">
        <h2>🕒 最近搜索</h2>
        <button type="button" class="clear-history-btn" id="clearHistoryBtn" style="display: none;">清除历史</button>
      </div>
      <div class="history-list" id="historyList">
        <div class="no-history">暂无搜索记录</div>
      </div>
    </div>
  </div>
  <div class="toast" id="toast"></div>
  <script>
    const STORAGE_KEY = 'animeSearchHistory';
    const MAX_HISTORY = 10;

    function loadHistory() {
      try {
        const history = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        return history;
      } catch (e) {
        return [];
      }
    }

    function saveHistory(history) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    }

    function addToHistory(keyword) {
      if (!keyword.trim()) return;
      let history = loadHistory();
      history = history.filter(item => item !== keyword);
      history.unshift(keyword);
      history = history.slice(0, MAX_HISTORY);
      saveHistory(history);
      renderHistory();
    }

    function clearHistory() {
      localStorage.removeItem(STORAGE_KEY);
      renderHistory();
      showToast('搜索历史已清除');
    }

    function renderHistory() {
      const historyList = document.getElementById('historyList');
      const clearBtn = document.getElementById('clearHistoryBtn');
      const history = loadHistory();

      if (history.length === 0) {
        historyList.innerHTML = '<div class="no-history">暂无搜索记录</div>';
        clearBtn.style.display = 'none';
      } else {
        clearBtn.style.display = 'block';
        historyList.innerHTML = history.map(keyword => 
          \`<div class="history-item" data-keyword="\${escapeHtml(keyword)}">\${escapeHtml(keyword)}</div>\`
        ).join('');
        
        historyList.querySelectorAll('.history-item').forEach(item => {
          item.addEventListener('click', () => {
            const keyword = item.dataset.keyword;
            document.getElementById('searchInput').value = keyword;
            document.getElementById('searchForm').submit();
          });
        });
      }
    }

    function escapeHtml(text) {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    }

    function showToast(message, type = 'success') {
      const toast = document.getElementById('toast');
      toast.textContent = '✓ ' + message;
      toast.className = 'toast ' + type;
      toast.classList.add('show');
      
      setTimeout(() => {
        toast.classList.remove('show');
      }, 2500);
    }

    document.getElementById('searchForm').addEventListener('submit', (e) => {
      const keyword = document.getElementById('searchInput').value;
      addToHistory(keyword);
    });

    document.getElementById('clearHistoryBtn').addEventListener('click', clearHistory);

    renderHistory();
  </script>
</body>
</html>
  `;
}

async function handleRequest(req, res) {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  if (pathname.startsWith('/public/')) {
    const filePath = path.join(__dirname, pathname);
    serveStaticFile(res, filePath);
    return;
  }

  try {
    if (pathname === '/') {
      sendHtmlResponse(res, getHomePage());
    } else if (pathname === '/search' && req.method === 'GET') {
      const keyword = parsedUrl.query.keyword;
      if (!keyword) {
        sendHtmlResponse(res, getSearchPage());
        return;
      }
      const searchHtml = await crawler.searchAnime(keyword);
      const searchResults = parser.parseSearchResults(searchHtml);
      sendHtmlResponse(res, getSearchResultsPage(keyword, searchResults));
    } else if (pathname === '/detail' && req.method === 'GET') {
      const detailUrl = parsedUrl.query.url;
      if (!detailUrl) {
        sendJsonResponse(res, { error: 'Missing url parameter' }, 400);
        return;
      }
      const detailHtml = await crawler.getDetailPage(detailUrl);
      const magnets = parser.parseDetailPage(detailHtml);
      const sortedMagnets = parser.sortMagnets(magnets);
      sendHtmlResponse(res, getDetailPage(detailUrl, sortedMagnets));
    } else {
      sendHtmlResponse(res, '<h1>404 Not Found</h1>', 404);
    }
  } catch (error) {
    logger.error('Request handling failed', { error: error.message, path: pathname });
    sendHtmlResponse(res, `<h1>服务器错误</h1><p>${error.message}</p>`, 500);
  }
}

function getSearchPage() {
  return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>搜索 - 动漫资源收集器</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 2rem;
    }
    .navbar {
      max-width: 900px;
      margin: 0 auto 2rem;
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      border-radius: 16px;
      padding: 1rem 2rem;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
      display: flex;
      justify-content: space-between;
      align-items: center;
      animation: slideDown 0.6s ease-out;
    }
    @keyframes slideDown {
      from {
        opacity: 0;
        transform: translateY(-20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    .logo {
      font-size: 1.5rem;
      font-weight: 700;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .nav-links {
      display: flex;
      gap: 1.5rem;
    }
    .nav-links a {
      color: #4a5568;
      text-decoration: none;
      font-weight: 500;
      padding: 0.5rem 1rem;
      border-radius: 8px;
      transition: all 0.3s ease;
      position: relative;
    }
    .nav-links a:hover {
      color: #667eea;
      background: rgba(102, 126, 234, 0.1);
      transform: translateY(-2px);
    }
    .nav-links a.active {
      color: #667eea;
      background: rgba(102, 126, 234, 0.15);
    }
    .container {
      max-width: 900px;
      margin: 0 auto;
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      padding: 3rem;
      border-radius: 24px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
      animation: fadeInUp 0.8s ease-out;
    }
    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    h1 {
      color: #1a202c;
      text-align: center;
      font-size: 2.5rem;
      margin-bottom: 1rem;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 1rem;
    }
    h1 .emoji {
      font-size: 3rem;
      animation: bounce 2s infinite;
    }
    @keyframes bounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-10px); }
    }
    .subtitle {
      text-align: center;
      color: #718096;
      font-size: 1.1rem;
      margin-bottom: 2.5rem;
    }
    .search-box {
      display: flex;
      gap: 1rem;
      margin-top: 2rem;
      position: relative;
    }
    .search-box::before {
      content: '🔍';
      position: absolute;
      left: 1.25rem;
      top: 50%;
      transform: translateY(-50%);
      font-size: 1.25rem;
      z-index: 1;
    }
    input[type="text"] {
      flex: 1;
      padding: 1rem 1rem 1rem 3.5rem;
      border: 2px solid #e2e8f0;
      border-radius: 16px;
      font-size: 1.1rem;
      transition: all 0.3s ease;
      outline: none;
      background: #f7fafc;
    }
    input[type="text"]:focus {
      border-color: #667eea;
      background: white;
      box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
    }
    input[type="text"]::placeholder {
      color: #a0aec0;
    }
    button {
      padding: 1rem 2rem;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      border-radius: 16px;
      cursor: pointer;
      font-size: 1.1rem;
      font-weight: 600;
      transition: all 0.3s ease;
      box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
    }
    button:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(102, 126, 234, 0.5);
    }
    button:active {
      transform: translateY(0);
    }
    @media (max-width: 1024px) {
      .container {
        padding: 2rem;
      }
      h1 {
        font-size: 2rem;
      }
    }
    @media (max-width: 768px) {
      body {
        padding: 1rem;
      }
      .navbar {
        padding: 1rem;
        flex-direction: column;
        gap: 1rem;
      }
      .nav-links {
        gap: 1rem;
      }
      .container {
        padding: 1.5rem;
      }
      h1 {
        font-size: 1.6rem;
        flex-direction: column;
        gap: 0.5rem;
      }
      h1 .emoji {
        font-size: 2rem;
      }
      .subtitle {
        font-size: 1rem;
      }
      .search-box {
        flex-direction: column;
      }
      button {
        width: 100%;
      }
    }
  </style>
</head>
<body>
  <nav class="navbar">
    <div class="logo">🎬 动漫资源</div>
    <div class="nav-links">
      <a href="/">首页</a>
      <a href="/search" class="active">搜索页</a>
    </div>
  </nav>
  <div class="container">
    <h1><span class="emoji">🔍</span> 搜索</h1>
    <p class="subtitle">快速找到你喜欢的动漫资源</p>
    <form action="/search" method="GET">
      <div class="search-box">
        <input type="text" name="keyword" placeholder="输入动漫名称搜索..." required>
        <button type="submit">开始搜索</button>
      </div>
    </form>
  </div>
</body>
</html>
  `;
}

function getSearchResultsPage(keyword, results) {
  const resultsHtml = results.map((result, index) => `
    <div class="result-card" style="animation: fadeInUp 0.5s ease-out ${index * 0.1}s both;">
      <a href="/detail?url=${encodeURIComponent(result.url)}" class="result-link">
        <div class="result-cover">
          <span class="cover-icon">📺</span>
        </div>
        <div class="result-info">
          <h3 class="result-title">${result.title}</h3>
          <p class="result-url">${result.url}</p>
          <div class="result-meta">
            <span class="meta-item">
              <span class="meta-icon">🎯</span>
              <span>点击查看详情</span>
            </span>
          </div>
        </div>
        <div class="result-action">
          <span class="action-btn">
            <span>查看</span>
            <span class="action-arrow">→</span>
          </span>
        </div>
      </a>
    </div>
  `).join('');

  return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>搜索结果: ${keyword} - 动漫资源收集器</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 2rem;
    }
    .navbar {
      max-width: 1100px;
      margin: 0 auto 2rem;
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      border-radius: 16px;
      padding: 1rem 2rem;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
      display: flex;
      justify-content: space-between;
      align-items: center;
      animation: slideDown 0.6s ease-out;
    }
    @keyframes slideDown {
      from {
        opacity: 0;
        transform: translateY(-20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    .logo {
      font-size: 1.5rem;
      font-weight: 700;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .nav-links {
      display: flex;
      gap: 1.5rem;
    }
    .nav-links a {
      color: #4a5568;
      text-decoration: none;
      font-weight: 500;
      padding: 0.5rem 1rem;
      border-radius: 8px;
      transition: all 0.3s ease;
      position: relative;
    }
    .nav-links a:hover {
      color: #667eea;
      background: rgba(102, 126, 234, 0.1);
      transform: translateY(-2px);
    }
    .container {
      max-width: 1100px;
      margin: 0 auto;
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      padding: 3rem;
      border-radius: 24px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
      animation: fadeInUp 0.8s ease-out;
    }
    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    h1 {
      color: #1a202c;
      text-align: center;
      font-size: 2.2rem;
      margin-bottom: 0.5rem;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 1rem;
    }
    h1 .emoji {
      font-size: 2.5rem;
    }
    .results-info {
      color: #718096;
      font-size: 1.1rem;
      margin: 0.5rem 0 2rem;
      text-align: center;
    }
    .search-box {
      display: flex;
      gap: 1rem;
      margin-bottom: 2.5rem;
      position: relative;
    }
    .search-box::before {
      content: '🔍';
      position: absolute;
      left: 1.25rem;
      top: 50%;
      transform: translateY(-50%);
      font-size: 1.25rem;
      z-index: 1;
    }
    input[type="text"] {
      flex: 1;
      padding: 1rem 1rem 1rem 3.5rem;
      border: 2px solid #e2e8f0;
      border-radius: 16px;
      font-size: 1.1rem;
      transition: all 0.3s ease;
      outline: none;
      background: #f7fafc;
    }
    input[type="text"]:focus {
      border-color: #667eea;
      background: white;
      box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
    }
    input[type="text"]::placeholder {
      color: #a0aec0;
    }
    button {
      padding: 1rem 2rem;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      border-radius: 16px;
      cursor: pointer;
      font-size: 1.1rem;
      font-weight: 600;
      transition: all 0.3s ease;
      box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
    }
    button:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(102, 126, 234, 0.5);
    }
    button:active {
      transform: translateY(0);
    }
    .results-grid {
      display: grid;
      gap: 1.5rem;
    }
    .result-card {
      background: #f7fafc;
      border-radius: 20px;
      overflow: hidden;
      transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      border: 2px solid transparent;
      position: relative;
    }
    .result-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: linear-gradient(90deg, #667eea, #764ba2);
      transform: scaleX(0);
      transition: transform 0.3s ease;
    }
    .result-card:hover {
      transform: translateY(-8px) scale(1.02);
      box-shadow: 0 20px 50px rgba(102, 126, 234, 0.3);
      border-color: #667eea;
      background: white;
    }
    .result-card:hover::before {
      transform: scaleX(1);
    }
    .result-link {
      display: grid;
      grid-template-columns: auto 1fr auto;
      align-items: center;
      padding: 1.75rem;
      text-decoration: none;
      color: inherit;
      gap: 1.5rem;
    }
    .result-cover {
      width: 80px;
      height: 80px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      transition: all 0.3s ease;
    }
    .result-card:hover .result-cover {
      transform: rotate(5deg) scale(1.1);
      box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
    }
    .cover-icon {
      font-size: 2.5rem;
    }
    .result-info {
      min-width: 0;
    }
    .result-title {
      color: #1a202c;
      font-size: 1.25rem;
      margin-bottom: 0.75rem;
      line-height: 1.5;
      font-weight: 600;
    }
    .result-url {
      color: #a0aec0;
      font-size: 0.85rem;
      word-break: break-all;
      margin-bottom: 0.75rem;
    }
    .result-meta {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
    }
    .meta-item {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      color: #718096;
      font-size: 0.9rem;
    }
    .meta-icon {
      font-size: 1rem;
    }
    .result-action {
      flex-shrink: 0;
    }
    .action-btn {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1.5rem;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border-radius: 12px;
      font-weight: 600;
      transition: all 0.3s ease;
    }
    .result-card:hover .action-btn {
      transform: scale(1.05);
      box-shadow: 0 4px 15px rgba(102, 126, 234, 0.5);
    }
    .action-arrow {
      transition: transform 0.3s ease;
    }
    .result-card:hover .action-arrow {
      transform: translateX(5px);
    }
    @media (max-width: 1024px) {
      .container {
        padding: 2rem;
      }
      h1 {
        font-size: 1.8rem;
      }
      .result-link {
        grid-template-columns: auto 1fr;
        gap: 1.25rem;
      }
      .result-action {
        grid-column: 1 / -1;
      }
      .action-btn {
        justify-content: center;
      }
    }
    @media (max-width: 768px) {
      body {
        padding: 1rem;
      }
      .navbar {
        padding: 1rem;
        flex-direction: column;
        gap: 1rem;
      }
      .nav-links {
        gap: 1rem;
      }
      .container {
        padding: 1.5rem;
      }
      h1 {
        font-size: 1.5rem;
        flex-direction: column;
        gap: 0.5rem;
      }
      h1 .emoji {
        font-size: 2rem;
      }
      .search-box {
        flex-direction: column;
      }
      button {
        width: 100%;
      }
      .result-link {
        grid-template-columns: 1fr;
        text-align: center;
        padding: 1.25rem;
      }
      .result-cover {
        width: 100px;
        height: 100px;
        margin: 0 auto;
      }
      .result-title {
        font-size: 1.1rem;
      }
      .result-meta {
        justify-content: center;
      }
    }
  </style>
</head>
<body>
  <nav class="navbar">
    <div class="logo">🎬 动漫资源</div>
    <div class="nav-links">
      <a href="/">首页</a>
      <a href="/search">搜索页</a>
    </div>
  </nav>
  <div class="container">
    <h1><span class="emoji">🔍</span> 搜索结果: ${keyword}</h1>
    <p class="results-info">找到 ${results.length} 个结果</p>
    <form action="/search" method="GET">
      <div class="search-box">
        <input type="text" name="keyword" placeholder="输入动漫名称搜索..." value="${keyword}" required>
        <button type="submit">重新搜索</button>
      </div>
    </form>
    <div class="results-grid">
      ${resultsHtml}
    </div>
  </div>
</body>
</html>
  `;
}

function getDetailPage(detailUrl, magnets) {
  const getSourceBadgeClass = (source) => {
    const classes = {
      'BD': 'badge-source-bd',
      'WEB': 'badge-source-web',
      'TV': 'badge-source-tv'
    };
    return classes[source] || 'badge-source-unknown';
  };

  const getResolutionBadgeClass = (resolution) => {
    const classes = {
      '4K': 'badge-res-4k',
      '1080p': 'badge-res-1080p',
      '720p': 'badge-res-720p',
      '480p': 'badge-res-480p'
    };
    return classes[resolution] || 'badge-res-unknown';
  };

  const magnetsHtml = magnets.map((magnet, index) => `
    <div class="magnet-card" style="animation: fadeInUp 0.5s ease-out ${index * 0.1}s both;">
      <div class="magnet-header">
        <div class="magnet-rank">
          <span class="rank-number">${index + 1}</span>
          ${index === 0 ? '<span class="rank-badge gold">🥇 最佳</span>' : ''}
          ${index === 1 ? '<span class="rank-badge silver">🥈 次佳</span>' : ''}
          ${index === 2 ? '<span class="rank-badge bronze">🥉 第三</span>' : ''}
        </div>
        <div class="magnet-info">
          <h3 class="magnet-title">${magnet.title}</h3>
          <div class="magnet-tags">
            <span class="badge badge-source ${getSourceBadgeClass(magnet.source)}">${magnet.source}</span>
            <span class="badge badge-res ${getResolutionBadgeClass(magnet.resolution)}">${magnet.resolution}</span>
          </div>
        </div>
      </div>
      <div class="magnet-link-section">
        <div class="magnet-link-container">
          <span class="link-icon">🧲</span>
          <div class="link-text">
            <code>${magnet.magnet}</code>
          </div>
          <button class="copy-btn" data-magnet="${encodeURIComponent(magnet.magnet)}" onclick="copyMagnet(this)">
            <span class="copy-icon">📋</span>
            <span class="copy-text">复制</span>
          </button>
        </div>
      </div>
    </div>
  `).join('');

  return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>详情页 - 动漫资源收集器</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 2rem;
    }
    .navbar {
      max-width: 1200px;
      margin: 0 auto 2rem;
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      border-radius: 16px;
      padding: 1rem 2rem;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
      display: flex;
      justify-content: space-between;
      align-items: center;
      animation: slideDown 0.6s ease-out;
    }
    @keyframes slideDown {
      from {
        opacity: 0;
        transform: translateY(-20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    .logo {
      font-size: 1.5rem;
      font-weight: 700;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .nav-links {
      display: flex;
      gap: 1.5rem;
    }
    .nav-links a {
      color: #4a5568;
      text-decoration: none;
      font-weight: 500;
      padding: 0.5rem 1rem;
      border-radius: 8px;
      transition: all 0.3s ease;
      position: relative;
    }
    .nav-links a:hover {
      color: #667eea;
      background: rgba(102, 126, 234, 0.1);
      transform: translateY(-2px);
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      padding: 3rem;
      border-radius: 24px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
      animation: fadeInUp 0.8s ease-out;
    }
    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    h1 {
      color: #1a202c;
      text-align: center;
      font-size: 2.5rem;
      margin-bottom: 0.5rem;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 1rem;
    }
    h1 .emoji {
      font-size: 3rem;
      animation: bounce 2s infinite;
    }
    @keyframes bounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-10px); }
    }
    .info {
      color: #718096;
      margin: 0.5rem 0 2rem;
      text-align: center;
      font-size: 1.1rem;
    }
    .source-url {
      color: #a0aec0;
      font-size: 0.9rem;
      word-break: break-all;
      margin-bottom: 2rem;
      text-align: center;
      padding: 1rem;
      background: #f7fafc;
      border-radius: 12px;
    }
    h2 {
      color: #1a202c;
      padding-bottom: 1rem;
      margin-bottom: 1.5rem;
      border-bottom: 3px solid;
      border-image: linear-gradient(135deg, #667eea 0%, #764ba2 100%) 1;
      font-size: 1.5rem;
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    .magnets-container {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }
    .magnet-card {
      background: #f7fafc;
      border-radius: 20px;
      padding: 1.75rem;
      border: 2px solid transparent;
      transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      position: relative;
      overflow: hidden;
    }
    .magnet-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: linear-gradient(90deg, #667eea, #764ba2);
      transform: scaleX(0);
      transition: transform 0.3s ease;
    }
    .magnet-card:hover {
      transform: translateY(-6px);
      box-shadow: 0 16px 40px rgba(102, 126, 234, 0.25);
      border-color: #667eea;
      background: white;
    }
    .magnet-card:hover::before {
      transform: scaleX(1);
    }
    .magnet-header {
      display: flex;
      align-items: flex-start;
      gap: 1.25rem;
      margin-bottom: 1.25rem;
    }
    .magnet-rank {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
      flex-shrink: 0;
    }
    .rank-number {
      width: 48px;
      height: 48px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 1.25rem;
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
    }
    .rank-badge {
      font-size: 0.75rem;
      font-weight: 600;
      padding: 0.25rem 0.75rem;
      border-radius: 10px;
      white-space: nowrap;
    }
    .rank-badge.gold {
      background: linear-gradient(135deg, #ffd700 0%, #ffb347 100%);
      color: #1a202c;
    }
    .rank-badge.silver {
      background: linear-gradient(135deg, #c0c0c0 0%, #a8a8a8 100%);
      color: #1a202c;
    }
    .rank-badge.bronze {
      background: linear-gradient(135deg, #cd7f32 0%, #b87333 100%);
      color: white;
    }
    .magnet-info {
      flex: 1;
      min-width: 0;
    }
    .magnet-title {
      color: #1a202c;
      font-size: 1.15rem;
      margin-bottom: 0.75rem;
      line-height: 1.5;
      font-weight: 600;
    }
    .magnet-tags {
      display: flex;
      gap: 0.75rem;
      flex-wrap: wrap;
    }
    .badge {
      display: inline-flex;
      align-items: center;
      padding: 0.45rem 1rem;
      border-radius: 24px;
      font-size: 0.85rem;
      font-weight: 700;
      letter-spacing: 0.3px;
    }
    .badge-source-bd {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }
    .badge-source-web {
      background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
      color: white;
    }
    .badge-source-tv {
      background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
      color: #1a202c;
    }
    .badge-source-unknown {
      background: linear-gradient(135deg, #e0e0e0 0%, #b8b8b8 100%);
      color: #1a202c;
    }
    .badge-res-4k {
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
      color: white;
    }
    .badge-res-1080p {
      background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
      color: #1a202c;
    }
    .badge-res-720p {
      background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
      color: #1a202c;
    }
    .badge-res-480p {
      background: linear-gradient(135deg, #d299c2 0%, #fef9d7 100%);
      color: #1a202c;
    }
    .badge-res-unknown {
      background: linear-gradient(135deg, #e0e0e0 0%, #b8b8b8 100%);
      color: #1a202c;
    }
    .magnet-link-section {
      margin-top: 1rem;
    }
    .magnet-link-container {
      display: flex;
      align-items: flex-start;
      gap: 1rem;
      padding: 1.25rem;
      background: white;
      border: 2px solid #e2e8f0;
      border-radius: 16px;
      transition: all 0.3s ease;
    }
    .magnet-card:hover .magnet-link-container {
      border-color: #cbd5e0;
      box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.05);
    }
    .link-icon {
      font-size: 1.5rem;
      flex-shrink: 0;
      margin-top: 0.1rem;
    }
    .link-text {
      flex: 1;
      min-width: 0;
    }
    .link-text code {
      color: #4a5568;
      font-size: 0.8rem;
      word-break: break-all;
      line-height: 1.7;
      font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
    }
    .copy-btn {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1.25rem;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      border-radius: 12px;
      cursor: pointer;
      font-weight: 600;
      font-size: 0.95rem;
      transition: all 0.3s ease;
      flex-shrink: 0;
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
    }
    .copy-btn:hover {
      transform: translateY(-2px) scale(1.05);
      box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
    }
    .copy-btn:active {
      transform: translateY(0) scale(0.98);
    }
    .copy-btn.copied {
      background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
      box-shadow: 0 4px 12px rgba(72, 187, 120, 0.4);
    }
    .copy-icon {
      font-size: 1.1rem;
    }
    .toast {
      position: fixed;
      bottom: 2rem;
      left: 50%;
      transform: translateX(-50%) translateY(100px);
      background: #1a202c;
      color: white;
      padding: 1rem 2rem;
      border-radius: 12px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
      opacity: 0;
      transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      z-index: 1000;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      font-weight: 500;
    }
    .toast.show {
      transform: translateX(-50%) translateY(0);
      opacity: 1;
    }
    .toast.success {
      background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
    }
    .toast.error {
      background: linear-gradient(135deg, #fc8181 0%, #f56565 100%);
    }
    @media (max-width: 1024px) {
      .container {
        padding: 2rem;
      }
      h1 {
        font-size: 2rem;
      }
    }
    @media (max-width: 768px) {
      body {
        padding: 1rem;
      }
      .navbar {
        padding: 1rem;
        flex-direction: column;
        gap: 1rem;
      }
      .nav-links {
        gap: 1rem;
      }
      .container {
        padding: 1.5rem;
      }
      h1 {
        font-size: 1.5rem;
        flex-direction: column;
        gap: 0.5rem;
      }
      h1 .emoji {
        font-size: 2rem;
      }
      .magnet-card {
        padding: 1.25rem;
      }
      .magnet-header {
        flex-direction: column;
        gap: 1rem;
      }
      .magnet-rank {
        flex-direction: row;
        gap: 0.75rem;
      }
      .magnet-link-container {
        flex-direction: column;
        gap: 1rem;
      }
      .copy-btn {
        width: 100%;
        justify-content: center;
      }
    }
  </style>
</head>
<body>
  <nav class="navbar">
    <div class="logo">🎬 动漫资源</div>
    <div class="nav-links">
      <a href="/">首页</a>
      <a href="/search">搜索页</a>
    </div>
  </nav>
  <div class="container">
    <h1><span class="emoji">📄</span> 详情页</h1>
    <p class="info">共找到 ${magnets.length} 个磁力链接（按质量排序）</p>
    <p class="source-url">来源: ${detailUrl}</p>
    <h2>🧲 资源列表</h2>
    <div class="magnets-container">
      ${magnetsHtml}
    </div>
  </div>
  <div class="toast" id="toast"></div>
  <script>
    function showToast(message, type = 'success') {
      const toast = document.getElementById('toast');
      const icon = type === 'success' ? '✓' : '✕';
      toast.innerHTML = '<span class="toast-icon">' + icon + '</span><span>' + message + '</span>';
      toast.className = 'toast ' + type;
      toast.classList.add('show');
      
      setTimeout(() => {
        toast.classList.remove('show');
      }, 2500);
    }

    function copyMagnet(btn) {
      const magnet = decodeURIComponent(btn.dataset.magnet);
      const originalHTML = btn.innerHTML;
      
      navigator.clipboard.writeText(magnet).then(() => {
        btn.classList.add('copied');
        btn.innerHTML = '<span class="copy-icon">✅</span><span class="copy-text">已复制</span>';
        showToast('磁力链接已成功复制到剪贴板！', 'success');
        
        setTimeout(() => {
          btn.classList.remove('copied');
          btn.innerHTML = originalHTML;
        }, 2000);
      }).catch(err => {
        showToast('复制失败，请手动复制', 'error');
        console.error('复制失败:', err);
      });
    }
  </script>
</body>
</html>
  `;
}

async function startServer() {
  try {
    await init();
    
    const server = http.createServer(handleRequest);
    
    server.listen(PORT, () => {
      console.log(`\n🚀 服务器已启动!`);
      console.log(`📍 访问地址: http://localhost:${PORT}`);
      console.log(`\n按 Ctrl+C 停止服务器\n`);
      logger.info(`Server started on http://localhost:${PORT}`);
    });
  } catch (error) {
    logger.error('Failed to start server', { error: error.message });
    process.exit(1);
  }
}

startServer();
