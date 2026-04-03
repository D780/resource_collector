// 配置文件
module.exports = {
  // 目标站点配置
  sites: {
    kisssub: {
      baseUrl: 'https://www.kisssub.org',
      seasonListPath: '/topics/list/page/1?keyword=&sort=id&ord=desc&tags=353',
      animeDetailPath: '/topics/view/'
    },
    mikan: {
      baseUrl: 'https://mikanani.me',
      seasonListPath: '/Home/Bangumi',
      animeDetailPath: '/Home/Detail/'
    }
  },
  
  // 数据库配置
  database: {
    path: './data/anime.db'
  },
  
  // 数据获取配置
  scraper: {
    interval: 3600000, // 1小时
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
  },
  
  // 可视化配置
  visualization: {
    port: 3000
  }
};