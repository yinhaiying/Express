# express入门

## 前言
Express的官方描述是：一个基于Node.js平台的快速，开放，极简的web框架。这句话中有两个关键词：
1. 基于Node。说明Express的初衷就是为了拓展Node的功能，从而提高开发效率。
2. web框架。说明Express主要是为了更加方便处理HTTP请求和响应。

总而言之，Express其实就是在Node内置的HTTP模块上构建了一层抽象，理论上所有Express能够实现的功能，
都可以通过Node来实现。相比于Node，Express具有的优势：
* 更加方便地处理HTTP请求与响应（对 request 和 response 对象方法进行了拓展。）
* 更加方便地连接数据库
* 更加方便的路由（路由语法糖）
* 更加方便地渲染模板（允许动态渲染和改变 HTML 内容，并且使用其他语言编写 HTML）

## 中间件
中间件（Middleware） 是一个函数，它可以访问请求对象（request）, 响应对象（response）, 和 web 应用中处于请求-响应循环流程中的 next的变量。接下来我们先编写一个简单的express应用，看看究竟中间件是什么？
```javascript
const express = require('express');
const app = express();

const fn = (req, res, next) => {
  console.log("hello,world");
};
app.use(fn)
const port = 3000;
app.listen(port,() => {
    console.log(`应用运行在${port}端口`);
})
```
当我们访问localhost:3000时就会发现，打印出了函数fn中的hello,world。这里的函数fn就是一个中间件，app.use(fn)就是运行这个中间件，实现他的功能。事实上，整个Express的功能就是由中间件组成，中间件具有的功能包括：
1. 执行任何代码。如果没有主动中止，会一直执行所有的中间件。
2. 调用堆栈中的下一个中间件。如果没有终结请求-响应循环，则必须调用 next() 方法将控制权交给下一个中间件。否则当前程序会被挂起
3. 终结请求-响应循环。终结请求-响应循环后，之后的中间件不再执行。

我们通过代码看一下中间件的这些功能：
```javascript
const express = require('express');
const app = express();
// 第一个中间件
app.use((req, res, next) => {
  console.log("中间件1");
  next();// 如果没有next则会被挂起
})
// 第二个中间件
app.use((req, res, next) => {
  console.log("中间件2");   //继续执行第二个中间件
  next();
})
// 第三个中间件
app.use((req, res, next) => {
  console.log("中间件3");
  res.send('hello');       // 终结请求-响应循环
})
// 第四个中间件
app.use((req, res, next) => {
  console.log("中间件4");   // 中介后的中间件不再执行
});
const port = 3000;
app.listen(port,() => {
    console.log(`应用运行在${port}端口`);
})
```
最终的输出结果为：`中间件1，中间件2，中间件3`。从上面的代码中我们可以知道，如果没有中止请求-响应循环，会执行所有的中间件；如果不是最后一个中止的中间件，必须执行next()。
我们看一下express中间件的模型：
![](https://imgkr.cn-bj.ufileos.com/98719956-afcd-4f55-9a8c-31ea3d01a8d7.png)
从上面的编程模型，我们可以看出每一个**中间件**就是插入到请求开始和响应结束**中间**的东西，这也是中间件名字的由来。
### 中间件的优点——模块化
中间件的最大优点就是模块化，每一个中间件是一个独立的函数，实现一个特定的功能，然后通过app.sue将这个函数整合起来。抽离出来就是一个单独的模块。比如，我们要实现一个功能，获取当前请求的url,那么我们就可以将这个功能，封装成一个中间件。

```javascript
//实现获取url的模块,封装成中间件
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
```


