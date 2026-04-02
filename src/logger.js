/**
 * 日志模块
 */
const fs = require('fs');
const path = require('path');

class Logger {
  constructor(options = {}) {
    this.level = options.level || process.env.LOG_LEVEL || 'INFO';
    this.logDir = options.logDir || './logs';
    this.consoleOutput = options.consoleOutput !== false;
    this.fileOutput = options.fileOutput !== false;
    
    this.levels = { DEBUG: 0, INFO: 1, WARN: 2, ERROR: 3 };
    
    if (this.fileOutput && !fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  _shouldLog(level) {
    return this.levels[level] >= this.levels[this.level];
  }

  _formatMessage(level, message, meta = {}) {
    const timestamp = new Date().toISOString();
    const metaStr = Object.keys(meta).length > 0 ? ` | ${JSON.stringify(meta)}` : '';
    return `[${timestamp}] [${level}] ${message}${metaStr}`;
  }

  _writeToFile(level, message) {
    if (!this.fileOutput) return;
    
    const date = new Date().toISOString().split('T')[0];
    const logFile = path.join(this.logDir, `all-${date}.log`);
    const errorFile = path.join(this.logDir, `error-${date}.log`);
    
    fs.appendFileSync(logFile, message + '\n');
    if (level === 'ERROR') {
      fs.appendFileSync(errorFile, message + '\n');
    }
  }

  debug(message, meta) {
    if (!this._shouldLog('DEBUG')) return;
    const formatted = this._formatMessage('DEBUG', message, meta);
    if (this.consoleOutput) console.log(`\x1b[36m${formatted}\x1b[0m`);
    this._writeToFile('DEBUG', formatted);
  }

  info(message, meta) {
    if (!this._shouldLog('INFO')) return;
    const formatted = this._formatMessage('INFO', message, meta);
    if (this.consoleOutput) console.log(`\x1b[32m${formatted}\x1b[0m`);
    this._writeToFile('INFO', formatted);
  }

  warn(message, meta) {
    if (!this._shouldLog('WARN')) return;
    const formatted = this._formatMessage('WARN', message, meta);
    if (this.consoleOutput) console.log(`\x1b[33m${formatted}\x1b[0m`);
    this._writeToFile('WARN', formatted);
  }

  error(message, meta) {
    if (!this._shouldLog('ERROR')) return;
    const formatted = this._formatMessage('ERROR', message, meta);
    if (this.consoleOutput) console.log(`\x1b[31m${formatted}\x1b[0m`);
    this._writeToFile('ERROR', formatted);
  }
}

const logger = new Logger();

module.exports = logger;
module.exports.Logger = Logger;
