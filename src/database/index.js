const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const config = require('../config/config');

// 确保数据目录存在
const fs = require('fs');
const dataDir = path.dirname(config.database.path);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// 创建数据库连接
const db = new sqlite3.Database(config.database.path);

// 初始化数据库
function initDatabase() {
  return new Promise((resolve, reject) => {
    // 创建番剧表
    db.run(`
      CREATE TABLE IF NOT EXISTS anime (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        site TEXT NOT NULL,
        siteId TEXT NOT NULL,
        url TEXT NOT NULL,
        cover TEXT,
        status TEXT NOT NULL,
        latestEpisode INTEGER DEFAULT 0,
        updateTime TEXT,
        UNIQUE(site, siteId)
      )
    `, (err) => {
      if (err) reject(err);
      
      // 创建剧集表
      db.run(`
        CREATE TABLE IF NOT EXISTS episode (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          animeId INTEGER NOT NULL,
          episodeNumber INTEGER NOT NULL,
          title TEXT,
          magnetLink TEXT NOT NULL,
          releaseDate TEXT,
          FOREIGN KEY (animeId) REFERENCES anime(id)
        )
      `, (err) => {
        if (err) reject(err);
        resolve();
      });
    });
  });
}

// 插入或更新番剧信息
function upsertAnime(anime) {
  return new Promise((resolve, reject) => {
    db.run(
      `INSERT OR REPLACE INTO anime (title, site, siteId, url, cover, status, latestEpisode, updateTime)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [anime.title, anime.site, anime.siteId, anime.url, anime.cover, anime.status, anime.latestEpisode, new Date().toISOString()],
      function(err) {
        if (err) reject(err);
        resolve(this.lastID);
      }
    );
  });
}

// 插入剧集信息
function insertEpisode(episode) {
  return new Promise((resolve, reject) => {
    db.run(
      `INSERT OR IGNORE INTO episode (animeId, episodeNumber, title, magnetLink, releaseDate)
       VALUES (?, ?, ?, ?, ?)`,
      [episode.animeId, episode.episodeNumber, episode.title, episode.magnetLink, episode.releaseDate],
      function(err) {
        if (err) reject(err);
        resolve(this.lastID);
      }
    );
  });
}

// 获取所有番剧
function getAllAnime() {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM anime ORDER BY updateTime DESC', (err, rows) => {
      if (err) reject(err);
      resolve(rows);
    });
  });
}

// 获取番剧的剧集
function getEpisodesByAnimeId(animeId) {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM episode WHERE animeId = ? ORDER BY episodeNumber ASC', [animeId], (err, rows) => {
      if (err) reject(err);
      resolve(rows);
    });
  });
}

// 关闭数据库连接
function closeDatabase() {
  return new Promise((resolve, reject) => {
    db.close((err) => {
      if (err) reject(err);
      resolve();
    });
  });
}

module.exports = {
  initDatabase,
  upsertAnime,
  insertEpisode,
  getAllAnime,
  getEpisodesByAnimeId,
  closeDatabase
};