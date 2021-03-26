const Koa = require("koa")
const Router = require("koa-router")
const path = require('path')
const bodyParser = require('koa-bodyparser')
const koaStatic = require('koa-static')
const ctrl = require("../controller/index")
const app = new Koa()
const router = new Router()
const publicPath = '../public'
app.use(bodyParser())
app.use(koaStatic(
	path.join(__dirname, publicPath)
))
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

router.post('/api/getSpiderStatus', async(ctx, next) => { // 获取爬取状态
	let body = ctx.request.body;
	let res = await ctrl.spiderStatus(body);
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
router.post('/api/getAnalyzeData', async(ctx, next) => { // 获取你的关注者分析数据
	let body = ctx.request.body;
	let res = await ctrl.getAnalyze(body)
	ctx.response.status = 200;
	ctx.body = { code: 200, msg: "ok", data: res }
	next()
})

const handler = async(ctx, next) => {
	try {
		await next();
	} catch (err) {
		console.log('服务器错误',err)
		ctx.respose.status = 500;
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
app.listen(9081, () => {
	console.log('juejinAnalyze is starting at port 9081')
	console.log('please  Preview at  http://localhost:9081')
})
