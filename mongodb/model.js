const JueJinUser = require('./schema')

module.exports = {
	user: {
		insert: (conditions) => { // 添加新用户信息,存在即
			return new Promise((resolve, reject) => {
				JueJinUser.updateOne({"uid": conditions.uid}, conditions, {"upsert": true}, (err, doc) => {
					if (err) return reject(err)
					return resolve(doc)
				})
			})
		},
		getUserInfo: (conditions) => { // 获取用户的基本信息
			return new Promise((resolve, reject) => {
				JueJinUser.findOne({uid: conditions.uid}, {followees: 0,follower:0}, (err, doc) => {
					if (err) return reject(err)
					return resolve(doc)
				})
			})
		},
	},
	followees:{
		updatefollowees: (conditions) => { // 更新你关注用户的列表
			return new Promise((resolve, reject) => {
				JueJinUser.updateOne({uid: conditions.uid}, {'$addToSet': {followees: conditions.followUid}}, (err, doc) => {
					if (err) return reject(err)
					return resolve(doc)
				})
			})
		},
		getArticleTop: (conditions) => { // 获取你关注用户发布文章最多的前10用户
			return new Promise((resolve, reject) => {
				JueJinUser.find({follower: {$elemMatch: {$eq: conditions.uid}}}).select('-followees -follower').sort({postedPostsCount: '-1'}).limit(conditions.top).exec((err, doc) => {
					if (err) return reject(err)
					return resolve(doc)
				})
			})
		},
		getJuejinPowerTop: (conditions) => { // 获取你关注用户掘力值最大的前10用户
			return new Promise((resolve, reject) => {
				JueJinUser.find({follower: {$elemMatch: {$eq: conditions.uid}}}).select('-followees -follower').sort({juejinPower: '-1'}).limit(conditions.top).exec((err, doc) => {
					if (err) return reject(err)
					return resolve(doc)
				})
			})
		},
		getTotalCollectionsCountTop: (conditions) => { // 获取你关注用户点赞量最多的前10用户
			return new Promise((resolve, reject) => {
				JueJinUser.find({follower: {$elemMatch: {$eq: conditions.uid}}}).select('-followees -follower').sort({totalCollectionsCount: '-1'}).limit(conditions.top).exec((err, doc) => {
					if (err) return reject(err)
					return resolve(doc)
				})
			})
		},
		getTotalViewsCountTop: (conditions) => { // 获取你关注用户阅读量最多的前10用户
			return new Promise((resolve, reject) => {
				JueJinUser.find({follower: {$elemMatch: {$eq: conditions.uid}}}).select('-followees -follower').sort({totalViewsCount: '-1'}).limit(conditions.top).exec((err, doc) => {
					if (err) return reject(err)
					return resolve(doc)
				})
			})
		},
		getFollowersCountTop: (conditions) => { // 获取你关注用户 关注者最多的前10用户
			return new Promise((resolve, reject) => {
				JueJinUser.find({follower: {$elemMatch: {$eq: conditions.uid}}}).select('-followees -follower').sort({followersCount: '-1'}).limit(conditions.top).exec((err, doc) => {
					if (err) return reject(err)
					return resolve(doc)
				})
			})
		},
		getLevelDistribution: (conditions) => { // 获取你关注用户等级分布
			return new Promise((resolve, reject) => {
				JueJinUser.aggregate([
					{
						$match: {
							follower: {$elemMatch: {$eq: conditions.uid}}
						}
					},
					{
						$group: {_id: '$level', total: {$sum: 1}}
					}
				]).exec((err, doc) => {
					if (err) return reject(err)
					return resolve(doc)
				})
			})
		}
	},
	follower: {
		updatefollower: (conditions)=>{ // 更新关注你的用户的列表
			return new Promise((resolve, reject) => {
				JueJinUser.updateOne({uid: conditions.uid}, {'$addToSet': {follower: conditions.followUid}}, (err, doc) => {
					if (err) return reject(err)
					return resolve(doc)
				})
			})
		},
		getArticleTop: (conditions) => { // 获取发布文章最多的前10用户
			return new Promise((resolve, reject) => {
				JueJinUser.find({followees: {$elemMatch: {$eq: conditions.uid}}}).select('-followees -follower').sort({postedPostsCount: '-1'}).limit(conditions.top).exec((err, doc) => {
					if (err) return reject(err)
					console.log(doc)
					return resolve(doc)
				})
			})
		},
		getJuejinPowerTop: (conditions) => { // 获取掘力值最大的前10用户
			return new Promise((resolve, reject) => {
				JueJinUser.find({followees: {$elemMatch: {$eq: conditions.uid}}}).select('-followees -follower').sort({juejinPower: '-1'}).limit(conditions.top).exec((err, doc) => {
					if (err) return reject(err)
					return resolve(doc)
				})
			})
		},
		getTotalCollectionsCountTop: (conditions) => { // 获取点赞量最多的前10用户
			return new Promise((resolve, reject) => {
				JueJinUser.find({followees: {$elemMatch: {$eq: conditions.uid}}}).select('-followees -follower').sort({totalCollectionsCount: '-1'}).limit(conditions.top).exec((err, doc) => {
					if (err) return reject(err)
					return resolve(doc)
				})
			})
		},
		getTotalViewsCountTop: (conditions) => { // 获取阅读量最多的前10用户
			return new Promise((resolve, reject) => {
				JueJinUser.find({followees: {$elemMatch: {$eq: conditions.uid}}}).select('-followees -follower').sort({totalViewsCount: '-1'}).limit(conditions.top).exec((err, doc) => {
					if (err) return reject(err)
					return resolve(doc)
				})
			})
		},
		getFollowersCountTop: (conditions) => { // 获取关注者最多的前10用户
			return new Promise((resolve, reject) => {
				JueJinUser.find({followees: {$elemMatch: {$eq: conditions.uid}}}).select('-followees -follower').sort({followersCount: '-1'}).limit(conditions.top).exec((err, doc) => {
					if (err) return reject(err)
					return resolve(doc)
				})
			})
		},
		getLevelDistribution: (conditions) => {
			return new Promise((resolve, reject) => {
				JueJinUser.aggregate([
					{
						$match: {
							followees: {$elemMatch: {$eq: conditions.uid}}
						}
					},
					{
						$group: {_id: '$level', total: {$sum: 1}}
					}
				]).exec((err, doc) => {
					if (err) return reject(err)
					return resolve(doc)
				})
			})
		}
	}
}
