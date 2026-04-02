/**
 * 资源收集器配置文件
 */
module.exports = {
  sites: {
    kisssub: {
      baseUrl: 'https://www.kisssub.org',
      searchPath: '/search',
      searchParam: 'keyword',
      encoding: 'utf-8'
    }
  },
  
  crawl: {
    timeout: 10000,
    retry: 3,
    delay: 1000,
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  },
  
  cache: {
    enabled: true,
    defaultTTL: 3600000,
    searchTTL: 1800000,
    detailTTL: 7200000,
    cacheDir: './.cache'
  },
  
  quality: {
    sources: ['BD', 'WEB', 'TV'],
    resolutions: ['4K', '1080p', '720p', '480p'],
    sourceMap: {
      'BD': 3,
      'BluRay': 3,
      'BDRip': 3,
      'WEB': 2,
      'WebRip': 2,
      'TV': 1
    },
    resolutionMap: {
      '4K': 4,
      '2160p': 4,
      '1080p': 3,
      '720p': 2,
      '480p': 1
    }
  },
  
  api: {
    tmdb: {
      baseUrl: 'https://api.themoviedb.org/3',
      apiKey: process.env.TMDB_API_KEY || '',
      language: 'zh-CN'
    },
    tvdb: {
      baseUrl: 'https://api4.thetvdb.com/v4',
      apiKey: process.env.TVDB_API_KEY || '',
      pin: process.env.TVDB_PIN || ''
    }
  },
  
  logging: {
    level: process.env.LOG_LEVEL || 'INFO',
    logDir: './logs',
    consoleOutput: true,
    fileOutput: true
  }
};
