const config = require('./src/config/config');
const scraper = require('./src/scraper');
const visualization = require('./src/visualization');
const cron = require('cron');

// 初始化数据
async function init() {
  console.log('初始化动漫剧集信息工具...');
  
  // 首次运行时更新数据
  await scraper.updateAnimeData();
  
  // 设置定时任务，定期更新数据
  const job = new cron.CronJob('0 0 * * *', async () => {
    console.log('定时更新动漫数据...');
    await scraper.updateAnimeData();
  });
  
  job.start();
  console.log('定时任务已启动，将每小时更新一次数据');
}

// 启动工具
init().catch(error => {
  console.error('初始化失败:', error);
});

module.exports = {
  init,
  scraper,
  visualization
};