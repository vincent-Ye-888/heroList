//提供与英雄操作相关的接口
const express = require('express');
const multer = require('multer');
const router = express.Router();
//连接mysql数据库
const conn = require('../util/sql.js');
//用以下方法为上传的图片创建一个文件夹用于储存
// const upload= multer({dest:'upload'});
// 精细化去设置，如何去保存文件
const storage = multer.diskStorage({
    // 保存在哪里
    destination: function (req, file, cb) {
        cb(null, 'uploads');
    },
    // 保存时，文件名叫什么
    filename: function (req, file, cb) {
        // console.log('file', file)
        // 目标： 新名字是时间戳+后缀名
        const filenameArr = file.originalname.split('.');
        // filenameArr.length-1是找到最后一个元素的下标
        const fileName = Date.now() + "." + filenameArr[filenameArr.length-1]
        cb(null, fileName) //
    }
})
const upload = multer({storage })

//写接口

//获取所有英雄
router.get('/getHeroList',(req,res)=>{
    //1.获取用户传递的参数
    //   如何获取get方式在请求行中传递的数据?  -- req.query中
    console.log('用户传递的参数',req.query);
    const {heroName} = req.query;
    //2.拼接sql语句,去数据库做查询
    let sqlStr = `select * from heros where isdelete=0`
    if(heroName){
        sqlStr = `select * from heros where name="${heroName}" and isdelete=0`
    }
    console.log('sql',sqlStr);
    //3.去数据库做查询
    conn.query(sqlStr,(err,result)=>{
        if(err){
            res.json({code:500,msg:'查询有误'});
            return;
        }
        res.json({code:200,msg:'请求成功',data:result})
    })
})

//添加英雄
router.use(express.urlencoded());
router.post('/addHero',(req,res)=>{
    //1.获取参数   如何获取post传递的 普通键值对?
    console.log('接收到的参数',req.body);
    const { name, gender } = req.body;     //结构对象
    // 2.拼接sql,添加到heros表中
    const sqlStr = `insert into heros (name ,gender) values("${name}" , "${gender}") ` 
    // 3.操作数据库
    conn.query(sqlStr,(err,result)=>{
        // console.log(result);
        //4.根据操作结果,做不同的响应式
        if(err){
            // console.log('添加失败',err);
            res.json({"code":500,"msg":"服务器处理失败"});
            return;
        }
        // console.log('添加结果是',result);
        res.json({"code":200,"msg":"服务器处理成功"});
    })
    // res.json({msg:'ok'})
})

//删除英雄
router.get('/delHeroById',(req,res)=>{
    //接收前端GET 请求传递过来的参数
    const { id } = req.query;
    //软删英雄(修改isdelete的值)
    const sqlStr = `update heros set isdelete=1 where id=${id}`;
    //操作数据库
    conn.query(sqlStr,(err,result)=>{
        // console.log('结果',result);
        if(err){
            res.status(500).send({code:500,msg:"服务器处理失败"});
            return;
        }
        //这里用changedRows更加合适
        if(result.changedRows === 1){
            res.send({code:200,msg:'删除数据成功'})
        }else{
            res.status(400).send({code:400,msg:"参数有误"})
        }
    })
    // res.json({msg:'ok'})
})

// 获取单个英雄
router.get('/getHeroById',(req,res)=>{
    // console.log(res);
    //接收前端GET请求传递过来的参数
    const {id} = req.query;
    //拼接sql语句
    const sqlStr = `select * from heros where id=${id} and isdelete=0`;
    //处理数据库
    conn.query(sqlStr,(err,result)=>{
        // console.log(result);    //注意这里返回的是单个英雄数据,不是返回数组,
        if(err){
            res.status(500).send({code:500,msg:"服务器处理失败"});
            return;
        }
        const heroItem = result[0];
        if(heroItem){
            //如果拿到返回的英雄数据,就返回这个数据
            res.send({code:200,msg:"请求成功",data:heroItem})
        }else{
            res.status(400).send({code:400,msg:"参数错误"})
        }
    })
    // res.json({msg:"ok"})
})

//文件上传接口
/*
    1.先去上面声明一个upload,生成一个用于存储上传图片的文件夹
    2.写接口接收上传的图片
*/
router.post('/uploadFile', upload.single('file_data'),(req,res)=>{
    //如果文件上传成功,
    // console.log('本次上传的文件是',req.file);
    const{id} = req.body
    const file ="http://127.0.0.1:4444/uploads/" + req.file.filename
    console.log();
    const sql =`update heros set img ="${file}" where id=${id}`
    // 后面再做：错误处理
    conn.query(sql,(err,result)=>{
        if(err){
            return res.json({code:500,msg:'服务器错误'})
        }
        res.json({
            "code":200, 
            "msg":"上传成功", 
            "src": file
        })
    })
   
    //res.json({msg:'ok'})    //这行代码主要用于测试接口是否正确
})
//更新英雄数据
// router.post('/updateHero',(req,res)=>{
//     //1.获取参数
//     // console.log('获取的参数是',req.body);
//     const {name , id , gender, img} = req.body;
//     //修改数据时.不一定是四个数据都修改,所以这里最好给一些判断条件
//     const condition = [];
//     if(name){
//         condition.push(`name="${name}"`)
//     }
//     if(gender){
//         condition.push(`gender="${gender}"`)
//     }
//     if(img){
//         condition.push(`img="${img}"`)
//     }
//     //将数组转回字符串
//     const conditionStr = condition.join();
// console.log(sss);
//     //2.拼接sql字符串
//     // const sqlStr=`update heros set name="${name}", gender="${gender}",img="${img}" where id=${id}`
//     const sqlStr = `update heros set ${conditionStr} where id=${id}`
//     // console.log(sqlStr);
//     //3.执行sql操作数据库
//     conn.query(sqlStr,(err,result)=>{
//         if(err){
//             res.json({code:500,msg:'修改失败'})
//             return;
//         }
//         res.json({
//             code:200,
//             msg:'修改成功',

//         })
//     })

//     // res.json({msg:'ok'})
// })

// 导出exports对象
module.exports = router