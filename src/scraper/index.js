const config = require('../config/config');
const KisssubScraper = require('./kisssubScraper');
const MikanScraper = require('./mikanScraper');
const db = require('../database');

// 初始化爬虫
const scrapers = {
  kisssub: new KisssubScraper(config.sites.kisssub),
  mikan: new MikanScraper(config.sites.mikan)
};

// 获取所有站点的番剧列表
async function getAllAnimeList() {
  const animeList = [];
  
  for (const [site, scraper] of Object.entries(scrapers)) {
    try {
      const siteAnimeList = await scraper.getAnimeList();
      animeList.push(...siteAnimeList);
    } catch (error) {
      console.error(`Error getting anime list from ${site}:`, error);
    }
  }
  
  return animeList;
}

// 更新番剧信息和剧集
async function updateAnimeData() {
  try {
    // 初始化数据库
    await db.initDatabase();
    
    // 获取所有番剧列表
    const animeList = await getAllAnimeList();
    
    // 处理每个番剧
    for (const anime of animeList) {
      try {
        // 获取番剧详情
        const scraper = scrapers[anime.site];
        const animeDetail = await scraper.getAnimeDetail(anime);
        
        // 插入或更新番剧信息
        const animeId = await db.upsertAnime(animeDetail);
        
        // 插入剧集信息
        if (animeDetail.episodes) {
          for (const episode of animeDetail.episodes) {
            await db.insertEpisode({
              ...episode,
              animeId
            });
          }
        }
        
        console.log(`Updated anime: ${anime.title}`);
      } catch (error) {
        console.error(`Error processing anime ${anime.title}:`, error);
      }
    }
    
    console.log('Anime data updated successfully');
  } catch (error) {
    console.error('Error updating anime data:', error);
  } finally {
    // 关闭数据库连接
    await db.closeDatabase();
  }
}

// 导出功能
module.exports = {
  updateAnimeData,
  getAllAnimeList
};

// 如果直接运行，执行更新
if (require.main === module) {
  updateAnimeData();
}