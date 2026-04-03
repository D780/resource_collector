const express = require('express');
const path = require('path');
const config = require('../config/config');
const db = require('../database');

const app = express();

// 设置模板引擎
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// 静态文件目录
app.use(express.static(path.join(__dirname, 'public')));

// 首页路由
app.get('/', async (req, res) => {
  try {
    // 初始化数据库
    await db.initDatabase();
    
    // 获取所有番剧
    const animeList = await db.getAllAnime();
    
    // 关闭数据库连接
    await db.closeDatabase();
    
    res.render('index', { animeList });
  } catch (error) {
    console.error('Error getting anime list:', error);
    res.render('error', { error: '获取番剧列表失败' });
  }
});

// 番剧详情路由
app.get('/anime/:id', async (req, res) => {
  try {
    const animeId = parseInt(req.params.id);
    
    // 初始化数据库
    await db.initDatabase();
    
    // 获取番剧信息
    const animeList = await db.getAllAnime();
    const anime = animeList.find(a => a.id === animeId);
    
    if (!anime) {
      res.render('error', { error: '番剧不存在' });
      return;
    }
    
    // 获取番剧集数
    const episodes = await db.getEpisodesByAnimeId(animeId);
    
    // 关闭数据库连接
    await db.closeDatabase();
    
    res.render('anime', { anime, episodes });
  } catch (error) {
    console.error('Error getting anime details:', error);
    res.render('error', { error: '获取番剧详情失败' });
  }
});

// 启动服务器
const port = config.visualization.port;
app.listen(port, () => {
  console.log(`Visualization server running at http://localhost:${port}`);
});

module.exports = app;