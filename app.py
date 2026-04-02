from flask import Flask, request

app = Flask(__name__)

@app.route('/')
def home():
    return '''
    <!DOCTYPE html>
    <html>
    <body>
      <h1>动漫资源收集器</h1>
      <form action="/search" method="GET">
        <input type="text" name="keyword" placeholder="输入动漫名称搜索...">
        <button type="submit">搜索</button>
      </form>
    </body>
    </html>
    '''

@app.route('/search')
def search():
    keyword = request.args.get('keyword', '')
    print(f'Search keyword: {keyword}')
    return f'''
    <!DOCTYPE html>
    <html>
    <body>
      <h1>搜索结果</h1>
      <p>搜索关键词: {keyword}</p>
      <p>搜索 URL: {request.url}</p>
    </body>
    </html>
    '''

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=3000, debug=True)
