// app.xxx
const express = require("express");

const app = express();
const path = require('path');
const ejs = require('ejs');
// 设置视图引擎
app.set('view engine', 'html');
// 设置html引擎 将ejs模板映射到html
app.engine("html", ejs.__express);

// 设置局部变量
app.set('name','express');

app.get("/user", (req, res, next) => {
  // app.get()用于获取
  const name = app.get('name');
  console.log(name);
  res.render('index')
});



app.listen(5000, () => {
  console.log("app运行在5000端口");
});
