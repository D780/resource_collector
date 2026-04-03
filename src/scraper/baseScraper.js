const axios = require('axios');
const cheerio = require('cheerio');
const config = require('../config/config');

// 基础爬虫类
class BaseScraper {
  constructor(siteConfig) {
    this.siteConfig = siteConfig;
    this.baseUrl = siteConfig.baseUrl;
  }

  // 延迟函数
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // 获取页面内容（带重试机制）
  async fetchPage(url) {
    let retries = config.scraper.retryCount;
    
    while (retries > 0) {
      try {
        const configOptions = {
          headers: {
            'User-Agent': config.scraper.userAgent,
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1'
          },
          httpsAgent: new (require('https').Agent)({
            rejectUnauthorized: false
          }),
          timeout: 15000,
          maxRedirects: 5
        };

        // 添加代理配置
        if (config.scraper.proxy) {
          configOptions.proxy = config.scraper.proxy;
        }

        const response = await axios.get(url, configOptions);
        return response.data;
      } catch (error) {
        retries--;
        console.error(`Error fetching page ${url} (${retries} retries left):`, error.message);
        
        if (retries > 0) {
          console.log(`Retrying in ${config.scraper.retryDelay}ms...`);
          await this.delay(config.scraper.retryDelay);
        } else {
          console.error(`Failed to fetch page ${url} after ${config.scraper.retryCount} retries`);
          return null;
        }
      }
    }
  }

  // 解析页面
  parsePage(html) {
    return cheerio.load(html);
  }

  // 获取番剧列表
  async getAnimeList() {
    throw new Error('Subclass must implement getAnimeList method');
  }

  // 获取番剧详情
  async getAnimeDetail(anime) {
    throw new Error('Subclass must implement getAnimeDetail method');
  }

  // 提取磁力链接
  extractMagnetLinks($, selector) {
    const links = [];
    $(selector).each((index, element) => {
      const link = $(element).attr('href');
      if (link && link.startsWith('magnet:')) {
        links.push(link);
      }
    });
    return links;
  }
}

module.exports = BaseScraper;