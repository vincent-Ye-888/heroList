//1.导入自定义模块
const conn = require('./sql.js');

const sqlStr = 'select * from heros';

conn.query(sqlStr,(err,result)=>{
    if(err){
        console.log(err);
    }
    console.log(result);
})