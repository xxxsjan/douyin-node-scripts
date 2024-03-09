# puppeteer爬取抖音粉丝数据

## 更新

- 2024 年 3 月 9 日： 更新移除不互关脚本 执行 node ./src/delete-unfollow.js
- 2024 年 3 月 8 日 ： 更新找出没互关的脚本 执行 node ./src/find-unfollow.js

- get-follow-list.js 为获取所有关注的脚本
- get-not-follow-list.js 获取我单向关注的博主列表
- analysis-follow 分析获取结果
- analysis-url.js 爬取原神抽卡日志-demo

## 使用说明

自己的谷歌浏览器先登录好抖音号

### cmd 启动调试浏览器

先关闭谷歌浏览器，打开调试版的谷歌浏览器

方式一：在命令行中执行

"C:\Program Files\Google\Chrome\Application\chrome.exe" --remote-debugging-port=9222

方式二：写在快捷方式的属性里的目标里面，写在目标里面 前面的双引号就不要开了

C:\Program Files\Google\Chrome\Application\chrome.exe --remote-debugging-port=9222

![image-20240309135313899](https://raw.githubusercontent.com/xxxsjan/pic-bed/main/image-20240309135313899.png)

进入调试版的谷歌浏览器，查看 ws 地址
<http://127.0.0.1:9222/json/version>

![image-20240309135409987](https://raw.githubusercontent.com/xxxsjan/pic-bed/main/image-20240309135409987.png)

修改 config.js 里的 ws 地址

![image-20240309135441612](https://raw.githubusercontent.com/xxxsjan/pic-bed/main/image-20240309135441612.png)

homeUrl 是你主页地址，默认是<https://www.douyin.com/user/self>就可以了

## puppeteer 方法

page.waitForSelector('selector') 等待对应的 dom 渲染完

page.evaluate(()=>{window 环境代码},params1:any)

page.$eval('selector', (el) => {})
