const express = require('express');
const app = express();

const user = require('./routes/user.js');
const blog = require('./routes/blog.js');
// 抽离子路由
app.use('/user',user);
app.use('/blog',blog);
const port = 3000;
app.listen(port,() => {
    console.log(`应用运行在${port}端口`);
})
