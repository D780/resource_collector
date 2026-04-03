const BaseScraper = require('./baseScraper');

class MikanScraper extends BaseScraper {
  // 获取番剧列表
  async getAnimeList() {
    const url = this.baseUrl + this.siteConfig.seasonListPath;
    const html = await this.fetchPage(url);
    if (!html) return [];

    const $ = this.parsePage(html);
    const animeList = [];

    // 解析番剧列表
    $('.bangumi-info').each((index, element) => {
      const titleElement = $(element).find('.bangumi-title a');
      const title = titleElement.text().trim();
      const link = titleElement.attr('href');
      
      // 提取站点ID
      const siteId = link.match(/\/(\d+)$/)[1];
      
      animeList.push({
        title,
        url: this.baseUrl + link,
        siteId,
        site: 'mikan',
        status: 'ongoing', // 默认状态，后续可根据实际情况更新
        latestEpisode: 0
      });
    });

    return animeList;
  }

  // 获取番剧详情
  async getAnimeDetail(anime) {
    const html = await this.fetchPage(anime.url);
    if (!html) return anime;

    const $ = this.parsePage(html);
    
    // 提取磁力链接
    const magnetLinks = this.extractMagnetLinks($, '.magnet-link');
    
    // 解析剧集信息
    const episodes = [];
    magnetLinks.forEach(link => {
      // 从链接或标题中提取剧集数
      const title = link.split('&dn=')[1] || '';
      const episodeMatch = title.match(/第(\d+)话/);
      if (episodeMatch) {
        const episodeNumber = parseInt(episodeMatch[1]);
        episodes.push({
          episodeNumber,
          title,
          magnetLink: link
        });
      }
    });

    // 更新最新集数
    if (episodes.length > 0) {
      anime.latestEpisode = Math.max(...episodes.map(e => e.episodeNumber));
    }

    return {
      ...anime,
      episodes
    };
  }
}

module.exports = MikanScraper;