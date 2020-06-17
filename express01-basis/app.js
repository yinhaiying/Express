const express = require('express');
const app = express();


//实现获取url的模块
const fn = (req, res, next) => {
  const url = req.url;
  console.log(url);
  next();
};

app.use(fn);

const port = 3000;
app.listen(port,() => {
    console.log(`应用运行在${port}端口`);
})
