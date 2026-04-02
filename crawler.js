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
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
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
      logger.error('Failed to initialize crawler', { error: error.message });
      throw error;
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
