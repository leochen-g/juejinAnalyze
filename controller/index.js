const {request} = require("../config/superagent")
const constant = require("../untils/constant")
const model = require("../mongodb/model")

function getLastTime(arr) {
	let obj = arr.pop()
	return obj.createdAtString
}

// 爬取用户信息并插入到mongodb
// @ids 用户id  @token token @tid 关注者用户id
async function spiderUserInfoAndInsert(ids, token, tid, type) {
	let url = constant.get_user_info
	let param = {
		token: token,
		src: constant.src,
		ids: ids,
		cols: constant.cols
	}
	try {
		let data = await request(url, 'GET', param)
		let json = JSON.parse(data.text)
		let userInfo = json.d[ids]
		let insertData = {
			uid: userInfo.uid,
			username: userInfo.username,
			avatarLarge: userInfo.avatarLarge,
			jobTitle: userInfo.jobTitle,
			company: userInfo.company,
			createdAt: userInfo.createdAt,
			rankIndex: userInfo.rankIndex, // 排名，级别
			juejinPower: userInfo.juejinPower, // 掘力值
			postedPostsCount: userInfo.postedPostsCount, // 发布文章数
			totalCollectionsCount: userInfo.totalCollectionsCount, // 获得点赞数
			totalCommentsCount: userInfo.totalCommentsCount, // 获得评论总数
			totalViewsCount: userInfo.totalViewsCount, // 文章被阅读数
			subscribedTagsCount: userInfo.subscribedTagsCount, // 关注标签数
			collectionSetCount: userInfo.collectionSetCount, // 收藏集数
			likedPinCount: userInfo.likedPinCount, // 点赞的沸点数
			collectedEntriesCount: userInfo.collectedEntriesCount, // 点赞的文章数
			pinCount: userInfo.pinCount, // 发布沸点数
			postedEntriesCount: userInfo.postedEntriesCount, // 分享文章数
			purchasedBookletCount: userInfo.purchasedBookletCount, // 购买小册数
			bookletCount: userInfo.bookletCount, // 撰写小册数
			followeesCount: userInfo.followeesCount, // 关注了多少人
			followersCount: userInfo.followersCount, // 关注者
			level: userInfo.level, // 等级
			topicCommentCount: userInfo.topicCommentCount, // 话题被评论数
			viewedEntriesCount: userInfo.viewedEntriesCount, // 猜测是主页浏览数
		}
		await model.user.insert(insertData)
		if (ids !== tid) {
			if(type === 'followees'){
				updatefollower(ids,tid) // 更新关注你的用户列表
				updatefollowees(tid,ids) // 更新你关注用户的列表
			}else {
				updatefollower(tid,ids) // 更新关注你的用户列表
				updatefollowees(ids,tid) // 更新你关注用户的列表
			}
		}
		return 'ok'
	} catch (e) {
		console.log('错误了', e)
	}
}

// 更新用户的关注列表
// @uId 用户id @tId 关注的用户Id
async function updatefollowees(uId, tId) {
	let data = {
		uid: uId,
		followUid: tId
	}
	model.followees.updatefollowees(data)
}
// 更新用户的被关注列表
// @uId 关注的用户id @tId 被关注的用户Id
async function updatefollower(uId, tId) {
	let data = {
		uid: uId,
		followUid: tId
	}
	model.follower.updatefollower(data)
}

// 爬取用户的关注者列表
// @uid 用户的id @token token @before 循环获取关注列表的必须参数，取上一组数据中最后一个数据的关注时间
async function getFollower(uid, token, before) {
	let param = {
		uid: uid,
		src: constant.src
	}
	if (before) {
		param.before = before
	}
	try {
		let url = constant.get_follow_list
		let list = await request(url, 'GET', param)
		let followList = list.body.d
		followList.forEach(async function (item) { // 循环获取关注者的信息
			await spiderUserInfoAndInsert(item.follower.objectId, token, uid, 'follower')
		})
		if (followList.length === 20) {
			let lastTime = getLastTime(followList)
			await getFollower(uid, token, lastTime)
		}
		return {data: 'loading'}
	} catch (err) {
		return {data: err}
	}
}

// 爬取你关注的列表
// @uid 用户的id @token token @before 循环获取关注列表的必须参数，取上一组数据中最后一个数据的关注时间
async function getFollowee(uid, token, before) {
	let param = {
		uid: uid,
		src: constant.src
	}
	if (before) {
		param.before = before
	}
	try {
		let url = constant.get_followee_list
		let list = await request(url, 'GET', param)
		let followList = list.body.d
		followList.forEach(async function (item) { // 循环获取关注者的信息
			await spiderUserInfoAndInsert(item.followee.objectId, token, uid, 'followees')
		})
		if (followList.length === 20) {
			let lastTime = getLastTime(followList)
			await getFollowee(uid, token, lastTime)
		}
		return {data: 'ok'}
	} catch (err) {
		return {data: err}
	}
}

// 用户数据分析
// @uid 用户id  @top 可配置选取前多少名  @type 获取数据类型：粉丝 follower 关注的人 followees
async function getTopData(uid, top, type) {
	let data = {
		uid: uid,
		top: parseInt(top),
		type: type
	}
	try {
		let article = model.analyze.getTopUser(data,'postedPostsCount')
		let juejinPower = model.analyze.getTopUser(data,'juejinPower')
		let liked = model.analyze.getTopUser(data,'totalCollectionsCount')
		let views = model.analyze.getTopUser(data,'totalViewsCount')
		let follower = model.analyze.getTopUser(data,'followersCount')
		let level = model.analyze.getLevelDistribution(data)
		let obj = {
			postedPostsCount: await article,
			juejinPower: await juejinPower,
			totalCollectionsCount: await liked,
			totalViewsCount: await views,
			followersCount: await follower,
			level: await level
		}
		return obj
	} catch (err) {
		console.log('err',err)
		return err
	}
}


module.exports = {
	spiderFlowerList: async (body) => {  // 获取用户的关注者列表
		let uid = body.uid
		let token = body.token
		spiderUserInfoAndInsert(uid, token, uid) // 把自己的信息也插入mongodb
		let result = await getFollower(uid, token)
		return result
	},
	spiderFloweesList: async (body) => { // 获取用户的关注列表
		let uid = body.uid
		let token = body.token
		spiderUserInfoAndInsert(uid, token, uid) // 把自己的信息也插入mongodb
		let result = await getFollowee(uid, token)
		return result
	},
	getUserInfo: async (body) => { // 获取当前用户基本信息
		let uid = body.uid
		let data = {
			uid: uid
		}
		let result = await model.user.getUserInfo(data)
		return result
	},
	getAnalyze: async (body) => { // 获取关注者数据分析
		let uid = body.uid
		let top = body.top
		let type = body.type
		let res = await getTopData(uid, top, type)
		return res
	}
}
