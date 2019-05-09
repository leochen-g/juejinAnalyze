const Koa = require("koa")
const Router = require("koa-router")
const bodyParser = require('koa-bodyparser')
const ctrl = require("../controller/index")
const app = new Koa()
const router = new Router()
app.use(bodyParser())

router.post('/api/getUserFlower', async(ctx, next) => { // 爬取并写入关注者信息
	let body = ctx.request.body;
	let res = await ctrl.spiderFlowerList(body);
	ctx.response.status = 200;
	ctx.body = { code: 200, msg: "ok", data: res.data }
	next()
})

router.post('/api/getUserFlowees', async(ctx, next) => { // 爬取并写入关注信息
	let body = ctx.request.body;
	let res = await ctrl.spiderFloweesList(body);
	ctx.response.status = 200;
	ctx.body = { code: 200, msg: "ok", data: res.data }
	next()
})

router.post('/api/getCurrentUserInfo', async(ctx, next) => { // 获取当前用的基本信息
	let body = ctx.request.body;
	let res = await ctrl.getUserInfo(body)
	ctx.response.status = 200;
	ctx.body = { code: 200, msg: "ok", data: res }
	next()
})
router.post('/api/getFollowerAnalyzeData', async(ctx, next) => { // 获取你的关注者分析数据
	let body = ctx.request.body;
	let res = await ctrl.getFollowerAnalyzeData(body)
	ctx.response.status = 200;
	ctx.body = { code: 200, msg: "ok", data: res }
	next()
})
router.post('/api/getFolloweesAnalyzeData', async(ctx, next) => { // 获取你关注用户的分析数据
	let body = ctx.request.body;
	let res = await ctrl.getFolloweesAnalyzeData(body)
	ctx.response.status = 200;
	ctx.body = { code: 200, msg: "ok", data: res }
	next()
})

const handler = async(ctx, next) => {
	try {
		await next();
	} catch (err) {
		console.log(err)
		ctx.respose.status = err.statusCode || err.status || 500;
		ctx.response.type = 'html';
		ctx.response.body = '<p>出错啦</p>';
		ctx.app.emit('error', err, ctx);
	}
}

app.use(handler)
app.on('error', (err) => {
	console.error('server error:', err)
})

app.use(router.routes())
app.use(router.allowedMethods())
app.listen(3008, () => {
	console.log('route-use-middleware is starting at port 3008')
})
