const express = require('express');
// 生成两个应用s
const app = express();
const admin = express();

app.use('/admin',admin);

// 子应用的功能
admin.get('/',(req,res,next) => {
    res.send('admin子应用');
})


app.listen(5000,() => {
    console.log('app运行在5000端口')
})