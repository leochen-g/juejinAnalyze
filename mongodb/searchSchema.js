const mongoose = require('./config')
const Schema = mongoose.Schema

// 掘金用户查询表： 记录已经查询过的用户，防止重复爬取数据，同时记录爬取状态
let JueJinSearch = new Schema({
	uid: {type:String,unique:true,index: true,}, // 用户Id
	follower: Boolean, // 是否查询过粉丝
	followees: Boolean, // 是否查询过关注用户
	followerSpider: String, // 粉丝爬取状态  success 爬取完成  loading 爬取中  none 未爬取
	followeesSpider: String // 关注用户爬取状态  success 爬取完成  loading 爬取中  none 未爬取
})

module.exports = mongoose.model('JueJinSearch', JueJinSearch)
