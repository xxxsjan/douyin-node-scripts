# puppeteer 抖音 node 脚本

爬取自己账号的粉丝列表，分析关注情况

## 使用说明

自己的谷歌浏览器先登录好抖音号

### cmd 启动调试浏览器

先关闭谷歌浏览器，打开调试版的谷歌浏览器

方式一：在命令行中执行

"C:\Program Files\Google\Chrome\Application\chrome.exe" --remote-debugging-port=9222

方式二：写在快捷方式的属性里的目标里面，写在目标里面

"C:\Program Files\Google\Chrome\Application\chrome.exe" --remote-debugging-port=9222

![image-20240309135313899](/doc/image-20240309135313899.png)

进入调试版的谷歌浏览器，查看 ws 地址
<http://127.0.0.1:9222/json/version>

如果没有就是浏览器没关闭，右下角看有没chrome图标，默认会保持后台运行，去掉勾选就可以了

![image-20240309135409987](/doc/image-20240309135409987.png)
