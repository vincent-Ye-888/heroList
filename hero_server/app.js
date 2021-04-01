//1.引入模块
const express = require('express');

//2.创建服务
const server = express();
//解决跨域问题
const cors = require('cors');
server.use(cors());
server.use('/uploads',express.static('uploads'))
// const jwt = require('express-jwt');
// // app.use(jwt().unless());
// // jwt() 用于解析token，并将 token 中保存的数据 赋值给 req.user
// // unless() 约定某个接口不需要身份认证
// server.use(jwt({
//     secret: 'gz61', // 生成token时的 钥匙，必须统一
//     algorithms: ['HS256'] // 必填，加密算法，无需了解
// }).unless({
//     path: ['/user/login', '/user/register', /^\/uploads\/.*/] // 除了这些接口，其他都需要认证
// }))


//3.路由中间件 ,可以加载不同的中间件
const heroRouter = require('./router/hero_router.js');
const userRouter = require('./router/user_router.js');
server.use('/hero',heroRouter)
server.use('/user',userRouter)

// //错误处理 -- 中间件
// server.use((err, req, res, next) => {
//     if (err.name === 'UnauthorizedError') {
//         // res.status(401).send('invalid token...');
//         res.status(401).send({ code: 1, message: '身份认证失败！' });
//     }
// });

//4.启动服务
server.listen(4444,()=>{
    console.log('服务器已经在4444端口就绪');
})