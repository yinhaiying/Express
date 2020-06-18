# express核心之中间件

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

## 中间件的分类
Express中的中间件，根据作用范围大致可以分为应用级中间件和路由级中间件。事实上中间件的分类并没有特别明显的区别。
* 应用级中间件 app.use()以及它的一些语法糖中使用的中间件
* 路由级中间件 router.use(),以及它的一些语法糖中使用的中间件

### 应用级中间件
应用级中间件主要是通过app.use()，以及它的一些语法糖中应用的中间件。
```javascript
const express = require('express');
const app = express();
//  应用级中间件
app.use((req, res, next) => {
  const url = req.url;
  next();
});

//  应用级中间件
app.get('/user',(req,res) => {
  res.send('应用级中间件');
})
const port = 3000;
app.listen(port,() => {
    console.log(`应用运行在${port}端口`);
})
```
上面的代码中，我们调用了两个中间件，一个是app.use()直接调用的中间件，另外一个是app.use的语法糖app.get()执行的中间件，为什么说app.get()是app.use()的语法糖，因为app.get能够实现的方法使用app.use都能够实现。我们试着将上面app.get的中间件用app.use实现。
```javascript
app.use((req,res,next) => {
  console.log(req.path)
  if(req.method === "GET" && req.path == '/users'){
    res.send('使用app.use实现的中间件');
  }
})
// 功能上等价于
app.get('/user',(req,res) => {
  res.send('应用级中间件');
})
```

### 路由级中间件
```javascript
const express = require('express');
const app = express();

// 定义一个路由
const user = express.Router();
user.use("/", (req, res) => {
  res.send("user.use");
});
user.get("/user", (req, res) => {
  res.send("路由级别中间件");
});
user.get("/blog", (req, res) => {
  res.send("路由级中间件");
});

const port = 3000;
app.listen(port,() => {
    console.log(`应用运行在${port}端口`);
})

```
路由级中间件是通过使用express内置的Router生成一个小应用，这个应用跟app具有相同的功能，只不过它主要的功能是用来实现路由。
这种路由功能可以很方便地帮助我们进行路由模块化开发。我们可以将相关的路由弄到同一个模块当中。比如上面的user和blog路由可以抽成
user子路由模块和blog子路由模块。示例如下：
```javascript
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
```
之后只要路径是/user的都会交给user这个子路由去处理。子路由user.js中代码如下：
```javascript
const express = require('express');

const router = express.Router();
router.get('/',(req,res) => {
    res.send('这里是user路由');
})
module.exports = router;
```

## 开发中间件
在上面的讲述中，我们知道中间件是一个函数，它是嵌入到一个请求和响应循环中的一个独立的功能块。函数的参数是req,res,next。因此编写一个中间件就显得很简单了。相当于编写一个函数，参数为req,res,next。
```javascript
// 定义
const getUrl = (req,res,next) => {
    console.log(req.url);
    next();
}
// 使用
app.use(getUrl)
```
从上面的代码我们可以看出，开发一个中间件就是编写一个函数。但是有时候为了能够配置一些参数，我们通常是返回一个函数，比如这样:
```javascript
const getUrl2 = (options) => {
    return () => {
      console.log(`${options.pre}+req.url`);
      next();
    }
}
app.use(getUrl2({pre:'url:'}))
```
这样的话，就需要app.use(getUrl())这样执行了。这就是为什么我们经常看到app.use(bodyParser())这样的使用方法了。实际上返回的还是一个函数，只是为了方便配置参数罢了。
## 常用中间件
最后我们例举一些express常用的中间件
* express.static express自带的中间件，用于访问静态文件
* body-parser 第三方中间件，用于解析post数据
* cookie-parser 第三方中间件，用于处理cookie
* cookie-session 第三方中间件，用于处理session
* bcrypt 第三方中间件，用于加密
* passport 第三方中间件，用于鉴权
* passport-jwt 第三方中间件，用于jwt鉴权


## 总结
到目前为止，我们详细介绍了Express的核心中间件，从中间件的详细理解到中间件的分类和使用，以及中间件的编写，最后列举了一些常见的中间件。通过本文我们基本上就能够掌握Express的核心功能了，其他的Express的API都是中间件的使用罢了。
