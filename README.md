# 个人掘金粉丝及关注者数据分析

## 主要功能

* 根据用户ID获取用户的粉丝或关注的用户数据
* 分析粉丝或关注用户，发布文章、文章获赞、文章阅读数、粉丝数、掘力值TOP10
* 分析粉丝或关注用户等级分布
* 个人成就面板
* 更多分析功能后续开发中...（期待你的建议）

## 在线版体验

> uid:  浏览器地址可查看用户id
> 
>sessionid: 登录后F12打开控制台，查看接口请求的cookie中有sessionid


[http://juejinfan.xkboke.com/](http://juejinfan.xkboke.com/)

## 截图
![](https://user-gold-cdn.xitu.io/2019/5/15/16aba7a3d58c59bc?w=2558&h=1376&f=png&s=1916755)


![](https://user-gold-cdn.xitu.io/2019/5/15/16aba6e80be34983?w=2556&h=1376&f=png&s=2988706)

## 安装

前提要安装好mongodb,并且是默认端口。如果端口已更改请在`/monogodb/config.js`中修改端口号

```
git clone https://github.com/gengchen528/juejinAnalyze.git
cd juejinAnalyze
npm install 
npm run start

```
如果执行`npm run dev`，请全局安装`nodemon`，如果使用pm2，请全局安装`pm2`
