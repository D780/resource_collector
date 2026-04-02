from flask import Flask, request
import subprocess
import json

app = Flask(__name__)

@app.route('/')
def home():
    return '''
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>动漫资源收集器</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          max-width: 800px;
          margin: 0 auto;
          padding: 2rem;
          background: #f5f5f5;
        }
        .container {
          background: white;
          padding: 2rem;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        h1 {
          color: #333;
          text-align: center;
        }
        .search-box {
          display: flex;
          gap: 0.5rem;
          margin-top: 2rem;
        }
        input[type="text"] {
          flex: 1;
          padding: 0.75rem;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 1rem;
        }
        button {
          padding: 0.75rem 1.5rem;
          background: #007bff;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 1rem;
        }
        button:hover {
          background: #0056b3;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>🎬 动漫资源收集器</h1>
        <form action="/search" method="GET">
          <div class="search-box">
            <input type="text" name="keyword" placeholder="输入动漫名称搜索..." required>
            <button type="submit">搜索</button>
          </div>
        </form>
      </div>
    </body>
    </html>
    '''

@app.route('/search')
def search():
    keyword = request.args.get('keyword', '')
    print(f'Search keyword: {keyword}')
    
    # 调用 Node.js 爬虫脚本
    try:
        result = subprocess.run(
            ['node', '-e', f'''
            const Crawler = require('./crawler');
            const Parser = require('./parser');
            
            async function search() {{
              const crawler = new Crawler();
              const parser = new Parser();
              
              try {{
                await crawler.init();
              }} catch (error) {{
                console.log('Crawler init failed, continuing without cookies');
              }}
              
              const searchHtml = await crawler.searchAnime('{keyword}');
              const searchResults = parser.parseSearchResults(searchHtml);
              console.log(JSON.stringify(searchResults));
            }}
            
            search().catch(console.error);
            ''' ],
            capture_output=True,
            text=True,
            cwd='/workspace'
        )
        
        print(f'Node.js output: {result.stdout}')
        print(f'Node.js error: {result.stderr}')
        
        # 解析搜索结果
        searchResults = []
        if result.stdout:
            try:
                searchResults = json.loads(result.stdout)
            except:
                print('Failed to parse search results')
        
        # 生成搜索结果 HTML
        results_html = ''
        if searchResults:
            results_html = '\n'.join([f'''
              <div class="result-item">
                <h3><a href="/detail?url={result['url']}">{result['title']}</a></h3>
                <p class="url">{result['url']}</p>
              </div>
            ''' for result in searchResults])
        else:
            results_html = '<p class="no-results">未找到结果</p>'
        
    except Exception as e:
        print(f'Error: {e}')
        results_html = f'<p class="error">搜索出错: {e}</p>'
    
    return '''
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>搜索结果: ''' + keyword + ''' - 动漫资源收集器</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          max-width: 800px;
          margin: 0 auto;
          padding: 2rem;
          background: #f5f5f5;
        }
        .container {
          background: white;
          padding: 2rem;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        h1 {
          color: #333;
          text-align: center;
        }
        .result-item {
          padding: 1rem;
          border-bottom: 1px solid #eee;
        }
        .result-item:last-child {
          border-bottom: none;
        }
        .result-item a {
          color: #007bff;
          text-decoration: none;
        }
        .result-item a:hover {
          text-decoration: underline;
        }
        .url {
          color: #666;
          font-size: 0.9rem;
          word-break: break-all;
        }
        .no-results {
          text-align: center;
          color: #666;
          padding: 2rem;
        }
        .error {
          text-align: center;
          color: #dc3545;
          padding: 2rem;
        }
        .search-box {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 2rem;
        }
        input[type="text"] {
          flex: 1;
          padding: 0.75rem;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 1rem;
        }
        button {
          padding: 0.75rem 1.5rem;
          background: #007bff;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 1rem;
        }
        button:hover {
          background: #0056b3;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>🔍 搜索结果: ''' + keyword + '''</h1>
        <form action="/search" method="GET">
          <div class="search-box">
            <input type="text" name="keyword" placeholder="输入动漫名称搜索..." value="''' + keyword + '''" required>
            <button type="submit">重新搜索</button>
          </div>
        </form>
        <div class="results">
          ''' + results_html + '''
        </div>
      </div>
    </body>
    </html>
    '''

@app.route('/detail')
def detail():
    detail_url = request.args.get('url', '')
    print(f'Detail URL: {detail_url}')
    
    # 调用 Node.js 爬虫脚本获取详情页
    try:
        result = subprocess.run(
            ['node', '-e', f'''
            const Crawler = require('./crawler');
            const Parser = require('./parser');
            
            async function getDetail() {{
              const crawler = new Crawler();
              const parser = new Parser();
              
              try {{
                await crawler.init();
              }} catch (error) {{
                console.log('Crawler init failed, continuing without cookies');
              }}
              
              const detailHtml = await crawler.getDetailPage('{detail_url}');
              const magnets = parser.parseDetailPage(detailHtml);
              const sortedMagnets = parser.sortMagnets(magnets);
              console.log(JSON.stringify(sortedMagnets));
            }}
            
            getDetail().catch(console.error);
            ''' ],
            capture_output=True,
            text=True,
            cwd='/workspace'
        )
        
        print(f'Node.js output: {result.stdout}')
        print(f'Node.js error: {result.stderr}')
        
        # 解析磁力链接
        magnets = []
        if result.stdout:
            try:
                magnets = json.loads(result.stdout)
            except:
                print('Failed to parse magnets')
        
        # 生成磁力链接 HTML
        magnets_html = ''
        if magnets:
            magnets_html = '\n'.join([f'''
              <div class="magnet-item">
                <h3>{index + 1}. {magnet['title']}</h3>
                <p class="magnet-link"><code>{magnet['magnet']}</code></p>
              </div>
            ''' for index, magnet in enumerate(magnets)])
        else:
            magnets_html = '<p class="no-magnets">未找到磁力链接</p>'
        
    except Exception as e:
        print(f'Error: {e}')
        magnets_html = f'<p class="error">获取详情出错: {e}</p>'
    
    return '''
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>详情页 - 动漫资源收集器</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          max-width: 800px;
          margin: 0 auto;
          padding: 2rem;
          background: #f5f5f5;
        }
        .container {
          background: white;
          padding: 2rem;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        h1 {
          color: #333;
          text-align: center;
        }
        .magnet-item {
          padding: 1rem;
          border: 1px solid #eee;
          border-radius: 4px;
          margin-bottom: 1rem;
        }
        .magnet-link {
          background: #f7f7f7;
          padding: 0.5rem;
          border: 1px solid #ddd;
          border-radius: 4px;
          word-break: break-all;
          font-family: monospace;
        }
        .no-magnets {
          text-align: center;
          color: #666;
          padding: 2rem;
        }
        .error {
          text-align: center;
          color: #dc3545;
          padding: 2rem;
        }
        .source-url {
          color: #666;
          font-size: 0.9rem;
          word-break: break-all;
          margin-bottom: 1rem;
        }
        a {
          color: #007bff;
          text-decoration: none;
        }
        a:hover {
          text-decoration: underline;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>📄 详情页</h1>
        <p class="source-url">来源: <a href="''' + detail_url + '''" target="_blank">''' + detail_url + '''</a></p>
        <h2>找到 ''' + str(len(magnets)) + ''' 个磁力链接</h2>
        <div class="magnets">
          ''' + magnets_html + '''
        </div>
        <p><a href="/">返回首页</a></p>
      </div>
    </body>
    </html>
    '''

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=3001, debug=True)
