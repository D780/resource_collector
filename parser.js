/**
 * HTML解析器模块
 */
const cheerio = require('cheerio');
const logger = require('./src/logger');

class Parser {
  constructor() {
    this.sourcePriority = { 'BD': 3, 'WEB': 2, 'TV': 1 };
    this.resolutionPriority = { '4K': 4, '1080p': 3, '720p': 2, '480p': 1 };
  }

  parseSearchResults(html, site = 'kisssub') {
    logger.debug('Parsing search results', { site, htmlLength: html.length });
    const $ = cheerio.load(html);
    const results = [];

    if (site === 'kisssub') {
      $('table.table tbody tr').each((index, element) => {
        const $row = $(element);
        const $link = $row.find('td:first-child a');
        const title = $link.text().trim();
        const url = $link.attr('href');

        if (title && url) {
          results.push({
            title,
            url: url.startsWith('http') ? url : `https://www.kisssub.org${url}`,
            site
          });
        }
      });
    }

    logger.info('搜索结果解析完成', { site, count: results.length });
    return results;
  }

  parseDetailPage(html) {
    logger.debug('Parsing detail page', { htmlLength: html.length });
    const $ = cheerio.load(html);
    const magnets = [];

    $('a[href^="magnet:"]').each((index, element) => {
      const $link = $(element);
      const magnet = $link.attr('href');
      const title = $link.text().trim() || $link.closest('tr').find('td:first-child').text().trim();

      if (magnet) {
        const qualityInfo = this.extractQualityInfo(title);
        magnets.push({
          title,
          magnet,
          source: qualityInfo.source,
          resolution: qualityInfo.resolution,
          _sourcePriority: qualityInfo._sourcePriority,
          _resolutionPriority: qualityInfo._resolutionPriority
        });
      }
    });

    logger.info('详情页解析完成', { magnetCount: magnets.length });
    return magnets;
  }

  extractQualityInfo(title) {
    if (!title) {
      logger.warn('extractQualityInfo called with empty title');
      return { source: 'Unknown', resolution: 'Unknown', _sourcePriority: 0, _resolutionPriority: 0 };
    }

    let source = 'Unknown';
    let resolution = 'Unknown';

    const upperTitle = title.toUpperCase();
    if (upperTitle.includes('BD') || upperTitle.includes('BLURAY') || upperTitle.includes('BLU-RAY')) {
      source = 'BD';
    } else if (upperTitle.includes('WEB')) {
      source = 'WEB';
    } else if (upperTitle.includes('TV')) {
      source = 'TV';
    }

    if (upperTitle.includes('4K') || upperTitle.includes('2160P')) {
      resolution = '4K';
    } else if (upperTitle.includes('1080P')) {
      resolution = '1080p';
    } else if (upperTitle.includes('720P')) {
      resolution = '720p';
    } else if (upperTitle.includes('480P')) {
      resolution = '480p';
    }

    return {
      source,
      resolution,
      _sourcePriority: this.sourcePriority[source] || 0,
      _resolutionPriority: this.resolutionPriority[resolution] || 0
    };
  }

  sortMagnets(magnets) {
    logger.debug('Sorting magnets', { count: magnets.length });
    return magnets.sort((a, b) => {
      if (a._sourcePriority !== b._sourcePriority) {
        return b._sourcePriority - a._sourcePriority;
      }
      return b._resolutionPriority - a._resolutionPriority;
    });
  }
}

module.exports = Parser;
