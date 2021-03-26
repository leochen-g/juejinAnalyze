const mongoose = require('./config')
const Schema = mongoose.Schema

let jueJinUser = new Schema({
	uid: {type:String,unique:true,index: true,}, // 用户Id
	username: String, // 用户名
	avatarLarge: String, // 头像
	jobTitle: String, // 职位
	company: String, // 公司
	createdAt: Date, // 账号注册时间
	
	rankIndex: Number, // 排名，级别
	juejinPower: Number, // 掘力值
	postedPostsCount: Number, // 发布文章数
	totalCollectionsCount: Number, // 获得点赞数
	totalViewsCount: Number, // 文章被阅读数
	
	subscribedTagsCount: Number, // 关注标签数
	collectionSetCount: Number, // 收藏集数
	
	likedPinCount: Number, // 点赞的沸点数
	collectedEntriesCount: Number, // 点赞的文章数
	pinCount: Number, // 发布沸点数
	

	purchasedBookletCount: Number, // 购买小册数
	bookletCount: Number, // 撰写小册数
	
	followeesCount: Number, // 关注了多少人
	followersCount: Number, // 关注者
	
	level: Number, // 等级
	
	commentCount: Number, // 评论数
	viewedArticleCount: Number, // 浏览文章数
	
	followees: {type:Array,default: []}, // 存放你关注的列表
	follower: {type:Array,default: []} // 存放关注你的列表
})

module.exports = mongoose.model('JueJinUser', jueJinUser)
