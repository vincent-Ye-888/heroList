//提供与用户操作相关的接口
const express = require('express');
const conn = require('../util/sql.js');
const router = express.Router();
const jwt = require('jsonwebtoken')
router.use(express.urlencoded())

//写接口
//用户登录
router.post('/login',(req,res)=>{
    //1.获取参数
    console.log('接收到的参数是',req.body);
    const{userName , userPwd} = req.body;
    //2.拼接sql   根据用户输入的去做查询,同时查到用户名和密码,说明可以登录
    const sqlStr = `select * from user where username="${userName}" and password="${userPwd}"`
    //3.执行sql语句操作数据库
    conn.query(sqlStr,(err,result)=>{
        //4.根据操作结果,返回不同的响应
        if(err){
            res.json({code:500,msg:'服务器错误'});
            return;
        }
        if(result.length>0){
            //进来就表示找到了,可以登录
            //返回token
            const tokenStr = jwt.sign(
                {name:userName},
                'gz61',
                {expiresIn:2*60*60},
            )
            const token = 'Bearer ' + tokenStr;     //注意,'Beater '   B一定要大写,且单词后要有空格
            //把token返回给客户端浏览器
            res.send({
                code:200,
                msg:'登录成功',
                token,
            })
            // res.json({ code:200,msg:'登陆成功'})
        }else{
            res.json({code:201,msg:'登陆失败,用户名密码不对'})
        }
    })
    // res.json({msg:'ok'})
})

//用户注册
router.post('/register',(req,res)=>{
    //1.获取参数
    console.log('接收到的参数是',req.body);
    const { userName , userPwd} = req.body;
    //根据注册业务的要求,要检测用户名是否被占用
    //    根据用户名做一次查询 --- 先获取用户名看能否获取到
    const sqlStrSelect = `select username from user where username="${userName}"`
    conn.query(sqlStrSelect,(err,result)=>{
        if(err){
            res.json({code:500,msg:'服务器错误'});
            return;
        }
        if(result.length>0){
            res.json({code:201,msg:"注册失败,用户名已被占用"});
            return;
        }
        //没有占用
        //2.拼接sql
        const sqlStr=`insert into user (username, password) values ("${userName}","${userPwd}")`;
        //3.执行sql操作数据库
        conn.query(sqlStr,(err,result)=>{
            if(err){
                //4.根据操作结果,做不同的响应
                res.json({code:500,msg:'注册失败'})
                return;
            }
            res.json({code:200,msg:'注册成功'})
        })
        // res.json({msg:'ok'})
    })
})

// 导出exports对象module.exports = router
module.exports = router