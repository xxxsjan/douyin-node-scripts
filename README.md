# puppeteer

## 更新

- 2024 年 3 月 8 日 ： 更新找出没互关的脚本 执行 node run find-unfollow

## 使用说明

自己的谷歌浏览器先登录好抖音号

### cmd 启动调试浏览器

先关闭谷歌浏览器

"C:\Program Files\Google\Chrome\Application\chrome.exe" --remote-debugging-port=9222

查看 ws 地址
<http://127.0.0.1:9222/json/version>

修改 config.js 里的 ws 地址

homeUrl 是你主页地址，默认是<https://www.douyin.com/user/self>就可以了

## 执行脚本

接着就可以 node run.js 1 开始跑脚本
node ./run.js 1 -----获取粉丝数据
node ./run.js 2 -----获取我关注的没关注我的
node ./run.js 3 -----分析结果

## js 说明

- get-follow-list.js 为获取所有关注的脚本

- get-not-follow-list.js 获取我单向关注的博主列表

- analysis-follow 分析获取结果

- analysis-url.js 爬取原神抽卡日志-demo

## puppeteer 方法

page.waitForSelector('selector') 等待对应的 dom 渲染完

page.evaluate(()=>{window 环境代码},params1:any)

page.$eval('selector', (el) => {})
