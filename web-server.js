const express = require('express');
const app = express();
const port = 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <body>
      <h1>动漫资源收集器</h1>
      <form action="/search" method="GET">
        <input type="text" name="keyword" placeholder="输入动漫名称搜索...">
        <button type="submit">搜索</button>
      </form>
    </body>
    </html>
  `);
});

app.get('/search', (req, res) => {
  console.log('Search request:', req.query);
  res.send(`
    <!DOCTYPE html>
    <html>
    <body>
      <h1>搜索结果</h1>
      <p>搜索关键词: ${req.query.keyword}</p>
      <p>搜索 URL: ${req.originalUrl}</p>
    </body>
    </html>
  `);
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
