#!/usr/bin/env node
/**
 * 命令行接口
 */
const { program } = require('commander');
const Crawler = require('./crawler');
const Parser = require('./parser');
const logger = require('./src/logger');

program
  .name('resource-collector')
  .description('动漫番剧、电影、电视剧信息收集工具')
  .version('2.0.0');

program
  .command('anime <keyword>')
  .description('搜索动漫下载链接')
  .option('-s, --site <site>', '网站名称', 'kisssub')
  .action(async (keyword, options) => {
    const crawler = new Crawler();
    const parser = new Parser();
    
    try {
      console.log(`\n🔍 搜索动漫: ${keyword}\n`);
      
      await crawler.init();
      const searchHtml = await crawler.searchAnime(keyword);
      const searchResults = parser.parseSearchResults(searchHtml);
      
      if (searchResults.length === 0) {
        console.log('❌ 没有找到搜索结果');
        return;
      }
      
      console.log(`✅ 找到 ${searchResults.length} 个结果\n`);
      
      const firstResult = searchResults[0];
      console.log(`📄 获取详情页: ${firstResult.title}\n`);
      
      const detailHtml = await crawler.getDetailPage(firstResult.url);
      const magnets = parser.parseDetailPage(detailHtml);
      
      if (magnets.length === 0) {
        console.log('❌ 没有找到磁力链接');
        return;
      }
      
      const sortedMagnets = parser.sortMagnets(magnets);
      
      console.log('⭐ 最佳选择:');
      console.log('─'.repeat(60));
      const best = sortedMagnets[0];
      console.log(`标题: ${best.title}`);
      console.log(`来源: ${best.source}`);
      console.log(`分辨率: ${best.resolution}`);
      console.log(`磁力链接: ${best.magnet}`);
      console.log('─'.repeat(60));
      console.log(`\n📊 共找到 ${sortedMagnets.length} 个磁力链接\n`);
      
    } catch (error) {
      logger.error('搜索失败', { error: error.message });
      process.exit(1);
    }
  });

program
  .command('interactive')
  .alias('i')
  .description('进入交互式模式')
  .action(async () => {
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    console.log('\n🎬 资源收集器 - 交互式模式\n');
    
    const question = (prompt) => new Promise((resolve) => {
      rl.question(prompt, resolve);
    });
    
    while (true) {
      console.log('\n请选择操作:');
      console.log('1. 搜索动漫下载链接');
      console.log('2. 搜索 TMDb 剧集信息');
      console.log('3. 搜索 TVDb 剧集信息');
      console.log('0. 退出\n');
      
      const choice = await question('请输入选项: ');
      
      if (choice === '0') {
        console.log('\n👋 再见!\n');
        rl.close();
        break;
      }
      
      if (choice === '1') {
        const keyword = await question('请输入搜索关键词: ');
        if (keyword.trim()) {
          const crawler = new Crawler();
          const parser = new Parser();
          
          try {
            console.log(`\n🔍 搜索中...\n`);
            await crawler.init();
            const searchHtml = await crawler.searchAnime(keyword);
            const searchResults = parser.parseSearchResults(searchHtml);
            
            if (searchResults.length > 0) {
              console.log(`✅ 找到 ${searchResults.length} 个结果`);
              const firstResult = searchResults[0];
              const detailHtml = await crawler.getDetailPage(firstResult.url);
              const magnets = parser.parseDetailPage(detailHtml);
              
              if (magnets.length > 0) {
                const sortedMagnets = parser.sortMagnets(magnets);
                const best = sortedMagnets[0];
                console.log(`\n⭐ 最佳选择: ${best.title}`);
                console.log(`来源: ${best.source} | 分辨率: ${best.resolution}`);
                console.log(`磁力链接: ${best.magnet}`);
              }
            } else {
              console.log('❌ 没有找到结果');
            }
          } catch (error) {
            console.log(`❌ 错误: ${error.message}`);
          }
        }
      } else if (choice === '2') {
        console.log('\n⚠️  TMDb API 需要配置 API 密钥');
      } else if (choice === '3') {
        console.log('\n⚠️  TVDb API 需要配置 API 密钥');
      }
    }
  });

program.parse();
