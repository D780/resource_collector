/**
 * 网页爬虫模块
 */
const axios = require('axios');
const logger = require('./src/logger');

class Crawler {
  constructor(config = {}) {
    this.config = config;
    this.cookies = null;
    this.axiosInstance = axios.create({
      timeout: 15000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1'
      }
    });
  }

  async init() {
    logger.debug('Initializing crawler');
    try {
      const response = await this.axiosInstance.get('https://www.kisssub.org');
      this.cookies = response.headers['set-cookie'];
      logger.info('Crawler initialized successfully');
    } catch (error) {
      logger.warn('Crawler initialization failed, will continue without cookies', { error: error.message });
      // 不抛出错误，允许服务器继续运行
    }
  }

  async searchAnime(keyword) {
    logger.debug('Searching anime', { keyword });
    try {
      const response = await this.axiosInstance.get(`https://www.kisssub.org/search?keyword=${encodeURIComponent(keyword)}`, {
        headers: {
          Cookie: this.cookies
        }
      });
      logger.info('Search completed', { keyword });
      return response.data;
    } catch (error) {
      logger.error('Search failed', { keyword, error: error.message });
      throw error;
    }
  }

  async getDetailPage(url) {
    logger.debug('Fetching detail page', { url });
    try {
      const response = await this.axiosInstance.get(url, {
        headers: {
          Cookie: this.cookies
        }
      });
      logger.info('Detail page fetched', { url });
      return response.data;
    } catch (error) {
      logger.error('Failed to fetch detail page', { url, error: error.message });
      throw error;
    }
  }
}

module.exports = Crawler;
