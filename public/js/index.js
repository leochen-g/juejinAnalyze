window.onload = function () {
	var vm = new Vue({
		el: '#main',
		data: {
			hasAuth: false,
			loading: false,
			loadingTips: '数据正在分析中...',
			cycleNumber: 0,
			uid: '',
			token: '' || localStorage.getItem('token'),
			userInfo: {
				joinDay: ''
			},
			selected: 'postedPostsCount',
			screenWidth: window.innerWidth,
			screenHeight: window.innerHeight,
			mainWidth: '',
			mainHeight: '',
			type: '',
			analyzeData: '',
			timer: false
		},
		computed: {
			transForm: function () {
				let _this = this
				let wRate = _this.screenWidth / _this.mainWidth;
				let hRate = _this.screenHeight / _this.mainHeight;
				return "scale(" + wRate + "," + hRate + ")"
			}
		},
		mounted() {
			"use strict";
			let _this = this
			_this.mainWidth = _this.$refs.main.offsetWidth
			_this.mainHeight = _this.$refs.main.offsetHeight
			console.log(_this.screenWidth,_this.screenHeight)
			window.onresize = () => {
				return (() => {
					_this.screenWidth = window.innerWidth
					_this.screenHeight = window.innerHeight
				})()
			}
			
		},
		watch: {
			screenWidth(val) {
				if (!this.timer) {
					this.screenWidth = val
					this.timer = true
					let that = this
					setTimeout(function () {
						that.timer = false
						console.log('223')
					}, 400)
				}
			},
			screenHeight(val) {
				if (!this.timer) {
					this.screenHeight = val
					this.timer = true
					let that = this
					setTimeout(function () {
						that.timer = false
					}, 400)
				}
			}
		},
		methods: {
			initBar(obj) {
				let options = {
					tooltip: {
						trigger: 'axis',
						axisPointer: {
							type: 'shadow'
						}
					},
					grid: {
						top: 0,
						left: '3%',
						right: '4%',
						bottom: '3%',
						containLabel: true
					},
					xAxis: {
						type: 'value',
						axisLine: {show: false},
						axisTick: {show: false},
						splitLine: {show: false},
						axisLabel: {show: false}
					},
					yAxis: {
						axisTick: {show: false},
						axisLine: {show: false},
						axisLabel: {
							color: '#bebec1'
						},
						type: 'category',
						data: obj.name
					},
					series: [
						{
							name: obj.title,
							type: 'bar',
							barCategoryGap: '60%',/*多个并排柱子设置柱子之间的间距*/
							itemStyle: {
								normal: {
									color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [{
										offset: 0,
										color: "#7052f4" // 0% 处的颜色
									}, {
										offset: 0.5,
										color: "#3881fa" // 50% 处的颜色
									}, {
										offset: 1,
										color: "#00b0ff" // 100% 处的颜色
									}], false)
								}
							},
							label: {
								normal: {
									show: false,
									position: 'inside',
									color: '#ffffff'
								}
							},
							data: obj.value
						}
					]
				}
				var ele = document.getElementById('user-top-chart');//获取渲染图表的节点
				var myChart = echarts.init(ele);//初始化一个图表实例
				myChart.setOption(options);//给这个实例设置配置文件
			},
			initPie(obj) {
				let options = {
					tooltip: {
						trigger: 'item',
						formatter: "{b} : {c} ({d}%)"
					},
					legend: {
						textStyle: {
							color: '#ffffff',
						},
						top: 10,
						right: 0,
						type: 'scroll',
						orient: 'vertical',
						data: obj.data,
						pageTextStyle: {
							color: '#ffffff'
						},
						formatter: function (name) {
							let count = 0
							for (let j of obj.data){
								count = count +j.value
							}
							for (let i of obj.data) {
								if (i.name === name)
									return name +'  '+ ((i.value/count) * 100).toFixed(2)+ '%'
							}
						}
					},
					color: ['#207fff','#00b0ff', '#5ddd9c', '#e7e666', '#ffc853', '#f77d4c'],
					series: [
						{
							type: 'pie',
							center: ['30%', '50%'],
							label: {
								normal: {
									show: false
								},
							},
							data: obj.data
						}
					]
				}
				var ele = document.getElementById('user-level-chart');//获取渲染图表的节点
				var myChart = echarts.init(ele);//初始化一个图表实例
				myChart.setOption(options);//给这个实例设置配置文件
			},
			spiderFollower(type) {
				let _this = this
				let reg = /^[0-9]+$/
				if(!_this.uid || !_this.token){
					alert('请输入uid和token值')
					return false
				}else if(!reg.test(_this.uid)||_this.uid.length<15){
					alert('请输入正确的用户ID，可在掘金->我的主页->浏览器地址栏看到')
					return false
				}
				_this.loading = true
				_this.type = type
				let data = {
					uid: _this.uid,
					token: _this.token
				}
				let url = type==='follower'?'/api/getUserFlower':'/api/getUserFlowees'
				axios.post(url,data).then(res => {
					if(res.data.code === 200){
						localStorage.setItem('token', _this.token)
						if(res.data.data==='success'){
							_this.getUserInfo()
							_this.getAnalyzeData()
							_this.hasAuth = true
							_this.loading = false
						}else {
							setTimeout(function () {
								_this.getSpiderStatus()
							}, 5000)
						}
					}else {
						alert(res.data.msg)
						_this.hasAuth = false
						_this.loading = false
					}
				})
			},
			getSpiderStatus() {
				let _this = this
				let data = {
					uid: _this.uid,
					type: _this.type
				}
				axios.post('/api/getSpiderStatus', data).then(res=>{
					if(res.data.data){
							_this.loading = false
							_this.hasAuth = true
							_this.getUserInfo()
							_this.getAnalyzeData()
							_this.cycleNumber = 0
						_this.loadingTips = '数据正在分析中...'
					}else {
						setTimeout(function () {
							_this.cycleNumber = _this.cycleNumber+1
							if(_this.cycleNumber >= 3&&_this.cycleNumber<5 ){
								_this.loadingTips = '看起来你的人缘很好，数据太多了，正在努力分析中..'
							}else if(_this.cycleNumber >= 5&&_this.cycleNumber<8){
								_this.loadingTips = '你的人缘爆棚啊！服务器全力分析中，您耐心等待一下..'
							}else if(_this.cycleNumber >= 8&&_this.cycleNumber<15){
								_this.loadingTips = '大佬驾到！服务器马力加大，请您先喝杯茶再来看看..'
							}else if(_this.cycleNumber >= 20){
								_this.loadingTips = '不用说了，你是不是掘金内部小编...'
							}
							_this.getSpiderStatus()
						},10000)
					}
				})
			},
			getUserInfo() {
				let _this = this
				let data = {
					uid: _this.uid,
					token: _this.token,
				}
				axios.post('/api/getCurrentUserInfo', data).then(res => {
					if (res.data.code === 200) {
						_this.userInfo = res.data.data
						_this.userInfo.joinDay = _this.getJoinDay(res.data.data.createdAt)
					} else {
						alert(res.data.msg)
					}
				})
			},
			getAnalyzeData() {
				let _this = this
				let data = {
					uid: _this.uid,
					top: 10,
					type: _this.type
				}
				axios.post('/api/getAnalyzeData', data).then(res => {
					if (res.data.code === 200) {
						_this.analyzeData = res.data.data
						let obj = _this.dealData(_this.analyzeData['postedPostsCount'], 'postedPostsCount')
						let pie = _this.dealPieData(_this.analyzeData.level)
						_this.initBar(obj)
						_this.initPie(pie)
					} else {
						alert(res.data.msg)
					}
				})
			},
			backLogin () {
				this.hasAuth = false
			},
			getJoinDay(time) {
				if(time.length === 10) {
					time = time + '000'
				}
				var s1 = time
				s1 = new Date(s1);
				s2 = new Date();//当前日期：2017-04-24
				var days = s2.getTime() - s1.getTime();
				return parseInt(days / (1000 * 60 * 60 * 24));
			},
			changeTop() {
				console.log('change', this.selected)
				let obj = this.dealData(this.analyzeData[this.selected], this.selected)
				this.initBar(obj)
			},
			dealPieData(arr) {
				let list = {
					data: [],
					name: []
				}
				for (let i of arr) {
					let obj = {}
					obj.name = 'LV' + i._id
					obj.icon = 'circle'
					obj.value = i.total
					list.name.push(obj.name)
					list.data.push(obj)
				}
				return list
			},
			dealData(arr, type) {
				let map = {
					postedPostsCount: '发布文章',
					juejinPower: '掘力值',
					totalCollectionsCount: '获得点赞',
					totalViewsCount: '文章被阅读',
					followersCount: '粉丝数',
				}
				let obj = {
					name: [],
					value: [],
					title: map[type]
				}
				for (let i of arr) {
					obj.name.push(i.username)
					obj.value.push(i[type])
				}
				obj.name = obj.name.reverse()
				obj.value = obj.value.reverse()
				return obj
			}
		}
	})
}
