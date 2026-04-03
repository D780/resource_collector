const axios = require('axios');
const cheerio = require('cheerio');
const config = require('../config/config');

// 基础爬虫类
class BaseScraper {
  constructor(siteConfig) {
    this.siteConfig = siteConfig;
    this.baseUrl = siteConfig.baseUrl;
  }

  // 获取页面内容
  async fetchPage(url) {
    try {
      const response = await axios.get(url, {
        headers: {
          'User-Agent': config.scraper.userAgent
        }
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching page ${url}:`, error.message);
      return null;
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