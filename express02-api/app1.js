const express = require("express");
const app = express();
const path = require('path');
app.use(express.json());
app.use(express.urlencoded());

const publicPath = path.resolve(__dirname,'public');
app.use(express.static(publicPath));

app.post('/user',(req,res,next) => {
    console.log(req.body);  // undefined
    res.send('express.json')
})

// 这种方式获取资源太麻烦
// app.get("/index.css", (req, res, next) => {
//   res.setHeader("content-type", "text/css");
//   res.send("body{background:red}");
// });


app.listen(5000, () => {
  console.log("app运行在5000端口");
});
