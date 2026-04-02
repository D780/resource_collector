# 🎬 动漫番剧、电影、电视剧信息收集工具

一个强大的 Node.js 工具，用于收集动漫番剧、电影、电视剧等剧集信息，并为动漫番剧提供可用的下载链接（磁力链接）。

## ✨ 功能特性

- 🔍 **剧集信息获取**: 从 TMDb 和 TVDb 获取剧集信息
- 📥 **动漫下载链接**: 从 kisssub 等网站收集动漫番剧的磁力链接
- 🎯 **智能排序**: 优先选择 BD 版本和 4K 清晰度的资源
- 💾 **缓存机制**: 内置缓存提高查询效率
- 📝 **完善日志**: 分级日志记录便于调试
- 🖥️ **命令行界面**: 支持交互式和命令行两种模式

## 📦 安装

```bash
# 克隆项目
git clone https://github.com/D780/resource_collector.git
cd resource_collector

# 安装依赖
npm install
```

## 🚀 快速开始

### 命令行模式

```bash
# 搜索动漫
node cli.js anime "进击的巨人"

# 进入交互式模式
node cli.js interactive
# 或
node cli.js i
```

### 编程方式

```javascript
const Crawler = require('./crawler');
const Parser = require('./parser');

async function search() {
  const crawler = new Crawler();
  const parser = new Parser();
  
  await crawler.init();
  const html = await crawler.searchAnime('进击的巨人');
  const results = parser.parseSearchResults(html);
  
  console.log(results);
}

search();
```

## 📊 资源质量优先级

### 来源优先级（从高到低）
1. BD (蓝光)
2. WEB (网络版)
3. TV (电视版)

### 分辨率优先级（从高到低）
1. 4K
2. 1080p
3. 720p
4. 480p

## ⚙️ 配置

### 环境变量

创建 `.env` 文件：

```env
# 日志级别
LOG_LEVEL=INFO

# TMDb API 密钥 (可选)
TMDB_API_KEY=your_api_key

# TVDb API 密钥 (可选)
TVDB_API_KEY=your_api_key
```

## 📁 项目结构

```
/workspace/
├── src/
│   ├── logger.js      # 日志模块
│   ├── errors.js      # 错误处理
│   └── cache.js       # 缓存模块
├── crawler.js         # 网页爬虫
├── parser.js          # HTML解析器
├── config.js          # 配置文件
├── cli.js             # 命令行接口
├── index.js           # 主入口
└── .env               # 环境变量
```

## 📝 API 文档

### Crawler 类

```javascript
const crawler = new Crawler();

// 初始化
await crawler.init();

// 搜索动漫
const html = await crawler.searchAnime('关键词');

// 获取详情页
const detailHtml = await crawler.getDetailPage(url);
```

### Parser 类

```javascript
const parser = new Parser();

// 解析搜索结果
const results = parser.parseSearchResults(html);

// 解析详情页
const magnets = parser.parseDetailPage(html);

// 排序磁力链接
const sorted = parser.sortMagnets(magnets);
```

## ⚠️ 注意事项

- 本工具仅用于学习和研究目的
- 请遵守网站的 robots.txt 规则
- 网站结构可能会变化，需要定期更新解析器

## 📄 许可证

ISC License
