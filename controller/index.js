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
    let params = {
        token: token,
        user_id: ids
    }
    try {
        let data = await request({url, method: 'GET', params, cookies: `sessionid=${token}`})
        let json = JSON.parse(data.text)
        let userInfo = json.data
        let insertData = {
            uid: userInfo.user_id,
            username: userInfo.user_name,
            avatarLarge: userInfo.avatar_large,
            jobTitle: userInfo.job_title,
            company: userInfo.company,
            createdAt: parseInt(`${userInfo.register_time}000`),
            rankIndex: userInfo.rank_index, // 排名，级别
            juejinPower: userInfo.power, // 掘力值
            postedPostsCount: userInfo.post_article_count, // 发布文章数
            totalCollectionsCount: userInfo.got_digg_count, // 获得点赞数
            totalViewsCount: userInfo.got_view_count, // 文章被阅读数
            subscribedTagsCount: userInfo.subscribe_tag_count, // 关注标签数
            collectionSetCount: userInfo.collect_set_count, // 收藏集数
            likedPinCount: userInfo.digg_shortmsg_count, // 点赞的沸点数
            collectedEntriesCount: userInfo.digg_article_count, // 点赞的文章数
            pinCount: userInfo.post_shortmsg_count, // 发布沸点数
            purchasedBookletCount: userInfo.buy_booklet_count, // 购买小册数
            bookletCount: userInfo.booklet_count, // 撰写小册数
            followeesCount: userInfo.followee_count, // 关注了多少人
            followersCount: userInfo.follower_count, // 关注者
            level: userInfo.level, // 等级
            commentCount: userInfo.comment_count, // 评论数
            viewedArticleCount: userInfo.view_article_count, // 浏览文章数
        }
        await model.user.insert(insertData)
        if (ids !== tid) {
            if (type === 'followees') {
                updatefollower(ids, tid) // 更新关注你的用户列表
                updatefollowees(tid, ids) // 更新你关注用户的列表
            } else {
                updatefollower(tid, ids) // 更新关注你的用户列表
                updatefollowees(ids, tid) // 更新你关注用户的列表
            }
        }
        return 'ok'
    } catch (e) {
        console.log('用户信息获取失败', ids, e,)
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

// 爬取用户的粉丝列表
// @uid 用户的id @token token @cursor 分页开始
async function getFollower(uid, token, cursor = 0) {
    let params = {
        user_id: uid,
        cursor,
        limit: 99
    }
    try {
        let url = constant.get_follow_list
        let data = await request({url, method: 'GET', params, cookies: `sessionid=${token}`})
        let json = JSON.parse(data.text)
        let followList = json.data.data
        followList.forEach(async function (item) { // 循环获取关注者的信息
            await spiderUserInfoAndInsert(item.user_id, token, uid, 'follower')
        })
        console.log(followList.length)
        if (followList && followList.length === 99) {  // 获取的数据长度为20继续爬取
            await getFollower(uid, token, cursor + 99)
        } else {
            await updateSpider(uid, 'follower', true) // 设置已经爬取标志
            setTimeout(async function () {
                let result = await updateSpider(uid, 'followerSpider', 'success') // 更新爬取状态为success
                console.log('爬取粉丝完成', result)
            }, 2000)

        }
    } catch (err) {
        console.log('获取粉丝列表失败', err)
        return {data: err}
    }
}

// 更新爬取状态与结果
// @uid 用户id @key 更新的字段 @value 更新的值
async function updateSpider(uid, key, value) {
    let condition = {
        uid: uid,
        key: key,
        value: value
    }
    model.search.update(condition)
}

// 爬取你关注的列表
// @uid 用户的id @token token @cursor 分页开始
async function getFollowee(uid, token, cursor =0 ) {
    let params = {
        user_id: uid,
        cursor,
        limit: 99
    }
    try {
        let url = constant.get_followee_list
        let data = await request({ url, method:'GET', params, cookies: `sessionid=${token}`})
        let json = JSON.parse(data.text)
        let followList = json.data.data
        followList.forEach(async function (item) { // 循环获取关注者的信息
            await spiderUserInfoAndInsert(item.user_id, token, uid, 'followees')
        })
        if (followList.length === 99) {
            await getFollowee(uid, token, cursor + 99)
        } else {
            await updateSpider(uid, 'followees', true) // 设置已经爬取标志
            setTimeout(async function () {
                let result = await updateSpider(uid, 'followeesSpider', 'success') // 更新爬取状态为loading
                console.log('爬取关注的人完成', result)
            }, 2000)

        }
    } catch (err) {
        console.log('获取关注者列表失败', err)
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
        let article = model.analyze.getTopUser(data, 'postedPostsCount')
        let juejinPower = model.analyze.getTopUser(data, 'juejinPower')
        let liked = model.analyze.getTopUser(data, 'totalCollectionsCount')
        let views = model.analyze.getTopUser(data, 'totalViewsCount')
        let follower = model.analyze.getTopUser(data, 'followersCount')
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
        console.log('err', err)
        return err
    }
}

module.exports = {
    spiderFlowerList: async (body) => {  // 获取用户的关注者列表
        let uid = body.uid
        let token = body.token
        let searchStatus = await model.search.findOrInsert({uid: uid})
        if (searchStatus.followerSpider == 'success') {
            return {data: 'success'}
        } else if (searchStatus.followerSpider == 'loading') {
            return {data: 'loading'}
        } else if (searchStatus.followerSpider == 'none') {
            await updateSpider(uid, 'followerSpider', 'loading') // 更新爬取状态为loading
            spiderUserInfoAndInsert(uid, token, uid) // 把自己的信息也插入mongodb
            getFollower(uid, token)
            return {data: 'none'}
        }
    },
    spiderFloweesList: async (body) => { // 获取用户的关注列表
        let uid = body.uid
        let token = body.token
        let searchStatus = await model.search.findOrInsert({uid: uid})
        if (searchStatus.followeesSpider == 'success') {
            return {data: 'success'}
        } else if (searchStatus.followeesSpider == 'loading') {
            return {data: 'loading'}
        } else if (searchStatus.followeesSpider == 'none') {
            await updateSpider(uid, 'followeesSpider', 'loading') // 更新爬取状态为loading
            spiderUserInfoAndInsert(uid, token, uid) // 把自己的信息也插入mongodb
            getFollowee(uid, token)
            return {data: 'none'}
        }
    },
    spiderStatus: async (body) => {
        let uid = body.uid
        let type = body.type + 'Spider'
        let spiderStatus = await model.search.getSpiderStatus({uid: uid, type: type})
        if (spiderStatus[type] === 'loading' || spiderStatus[type] === 'none') {
            return {data: false}
        } else if (spiderStatus[type] === 'success') {
            return {data: true}
        }
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
