/**
 * 主入口文件
 */
const Crawler = require('./crawler');
const Parser = require('./parser');
const logger = require('./src/logger');

async function main() {
  const crawler = new Crawler();
  const parser = new Parser();
  const keyword = process.argv[2] || '进击的巨人';

  try {
    await crawler.init();
    
    const searchHtml = await crawler.searchAnime(keyword);
    const searchResults = parser.parseSearchResults(searchHtml);
    
    if (searchResults.length === 0) {
      logger.warn('没有找到搜索结果');
      return;
    }
    
    logger.info(`找到 ${searchResults.length} 个结果`);
    
    const firstResult = searchResults[0];
    logger.info(`获取详情页: ${firstResult.title}`);
    
    const detailHtml = await crawler.getDetailPage(firstResult.url);
    const magnets = parser.parseDetailPage(detailHtml);
    
    if (magnets.length === 0) {
      logger.warn('没有找到磁力链接');
      return;
    }
    
    const sortedMagnets = parser.sortMagnets(magnets);
    
    console.log('\n' + '='.repeat(60));
    console.log('最佳选择:');
    console.log('='.repeat(60));
    const best = sortedMagnets[0];
    console.log(`标题: ${best.title}`);
    console.log(`来源: ${best.source}`);
    console.log(`分辨率: ${best.resolution}`);
    console.log(`磁力链接: ${best.magnet}`);
    console.log('\n' + '='.repeat(60));
    console.log(`共找到 ${sortedMagnets.length} 个磁力链接`);
    
  } catch (error) {
    logger.error('执行失败', { error: error.message });
    process.exit(1);
  }
}

main();
