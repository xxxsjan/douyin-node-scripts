
# puppeteer

## 使用说明

### cmd启动调试浏览器

先关闭谷歌浏览器

"C:\Program Files\Google\Chrome\Application\chrome.exe" --remote-debugging-port=9222

查看ws地址
<http://127.0.0.1:9222/json/version>

修改config.js 里的ws地址

homeUrl是你主页地址，默认是<https://www.douyin.com/user/self就可以了>

## 执行脚本

接着就可以node run.js 1 开始跑脚本
node ./run.js 1 -----获取粉丝数据
node ./run.js 2 -----获取我关注的没关注我的
node ./run.js 3 -----分析结果

## js说明

get-follow-list.js 为获取所有关注的脚本
get-not-follow-list.js 获取我单向关注的博主列表
analysis-follow   分析获取结果
analysis-url.js   爬取原神抽卡日志-demo
