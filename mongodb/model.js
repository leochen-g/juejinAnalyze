const JueJinUser = require('./schema')
const JueJinSearch = require('./searchSchema')
module.exports = {
	search: { // 用户查询状态
		findOrInsert: (conditions) => { // 添加新查询用户信息
			return new Promise((resolve, reject) => {
				JueJinSearch.findOne({uid: conditions.uid}, (err, doc) => {
					if (err) return reject(err)
					if (doc){
						return resolve(doc)
					}else {
						let data = {
							uid: conditions.uid,
							follower: false,
							followees: false,
							followerSpider: 'none',
							followeesSpider: 'none'
						}
						JueJinSearch.updateOne({"uid": conditions.uid}, data, {"upsert": true}, async (err, doc) => {
							if (err) return reject(err)
							let user = await JueJinSearch.findOne({uid: conditions.uid})
							return resolve(user)
						})
					}
				})
			})
		},
		update: (conditions) => { // 更新查询的状态
			return new Promise((resolve, reject) => {
				let set = {}
				set[conditions.key] = conditions.value
				console.log('更新值',conditions.key,conditions.value)
				JueJinSearch.updateOne({uid: conditions.uid}, {'$set': set}, (err, doc) => {
					if (err) return reject(err)
					return resolve(doc)
				})
			})
		},
		getSpiderStatus: (conditions) => {
			return new Promise((resolve, reject) => {
				JueJinSearch.findOne({uid: conditions.uid}, (err, doc) => {
					if (err) return reject(err)
					return resolve(doc)
				})
			})
		}
	},
	user: {
		insert: (conditions) => { // 添加新用户信息
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
		}
	},
	analyze:{
		getTopUser: (conditions, param) => { // 获取各项指标前10用户
			return new Promise((resolve, reject) => {
				let findOption = {}
				let sort = {}
				if(conditions.type === 'follower'){
					findOption = {followees: {$elemMatch: {$eq: conditions.uid}}}
				}else if(conditions.type === 'followees'){
					findOption = {follower: {$elemMatch: {$eq: conditions.uid}}}
				}
				sort[param] = '-1'
				JueJinUser.find(findOption).select('-followees -follower').sort(sort).limit(conditions.top).exec((err, doc) => {
					if (err) return reject(err)
					return resolve(doc)
				})
			})
		},
		getLevelDistribution: (conditions) => { // 获取等级分布
			return new Promise((resolve, reject) => {
				let match = {}
				if(conditions.type==='follower'){
					match = {
						followees: {$elemMatch: {$eq: conditions.uid}}
					}
				}else if(conditions.type==='followees'){
					match = {
						follower: {$elemMatch: {$eq: conditions.uid}}
					}
				}
				JueJinUser.aggregate([
					{
						$match: match
					},
					{
						$group: {_id: '$level', total: {$sum: 1}}
					}
				]).sort({'total': -1}).exec((err, doc) => {
					if (err) return reject(err)
					return resolve(doc)
				})
			})
		}
	}
}
