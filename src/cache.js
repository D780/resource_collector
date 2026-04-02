/**
 * 缓存模块
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

class Cache {
  constructor(options = {}) {
    this.enabled = options.enabled !== false;
    this.defaultTTL = options.defaultTTL || 3600000;
    this.cacheDir = options.cacheDir || './.cache';
    this.memoryCache = new Map();
    
    if (this.enabled && !fs.existsSync(this.cacheDir)) {
      fs.mkdirSync(this.cacheDir, { recursive: true });
    }
  }

  _generateKey(key) {
    return crypto.createHash('md5').update(key).digest('hex');
  }

  _getFilePath(key) {
    return path.join(this.cacheDir, `${this._generateKey(key)}.json`);
  }

  async get(key) {
    if (!this.enabled) return null;

    if (this.memoryCache.has(key)) {
      const cached = this.memoryCache.get(key);
      if (Date.now() < cached.expiry) {
        return cached.value;
      }
      this.memoryCache.delete(key);
    }

    const filePath = this._getFilePath(key);
    if (fs.existsSync(filePath)) {
      try {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        if (Date.now() < data.expiry) {
          this.memoryCache.set(key, data);
          return data.value;
        }
        fs.unlinkSync(filePath);
      } catch (error) {
        return null;
      }
    }

    return null;
  }

  async set(key, value, ttl = this.defaultTTL) {
    if (!this.enabled) return;

    const expiry = Date.now() + ttl;
    const data = { value, expiry };

    this.memoryCache.set(key, data);

    const filePath = this._getFilePath(key);
    fs.writeFileSync(filePath, JSON.stringify(data));
  }

  async delete(key) {
    this.memoryCache.delete(key);
    const filePath = this._getFilePath(key);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }

  async clear() {
    this.memoryCache.clear();
    if (fs.existsSync(this.cacheDir)) {
      const files = fs.readdirSync(this.cacheDir);
      files.forEach(file => {
        fs.unlinkSync(path.join(this.cacheDir, file));
      });
    }
  }
}

module.exports = Cache;
