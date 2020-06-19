# Express的基础
Express系列文章：<br/>
(一)[Express核心之中间件](https://juejin.im/post/5eeb385e5188256591249045)

## 前言
在[Express核心之中间件](https://juejin.im/post/5eeb385e5188256591249045)这篇文章中，我们讲解了Express的核心——中间件，理解了Express的核心功能之后，再去熟悉Express的基础API就变得很容易了。通过进一步掌握Express的基础知识，我们就可以使用Express进行简单的后台开发了。Express的核心API主要包括五类：express.xxx、app.xxx、router.xxx、request.xxx和response.xxx。
1. express.xxx 是express函数内置的中间件
2. app.xxx 是express创建的app对象所具有的属性和方法
3. router.xxx 是跟路由相关的router对象的方法
4. request.xxx 是请求时的request对象所具有的方法
5. response.xxx 是响应时的response对象所具有的方法


通过掌握这五类核心API，我们就掌握了Express的基础了。本文的主要内容就是介绍这些基础API。

## express.xxx
express是express模块暴露出来的顶级的函数，用于生成一个应用。因此，我们先了解一下express的应用。
### 主应用和子应用
创建一个应用：
```javascript
const express = require('express');
const app = express();
```
这里的app就是express生成的一个主应用。通常来说一个项目只有一个应用，但是express可以生成多个应用，其中一个是主应用，其他的是子应用，子应用通过挂载点挂载到主应用上，子应用具有跟主应用相同的功能，这样方便进行模块化开发。示例：
```javascript
const express = require('express');
// 创建两个应用
const app = express();
const admin = express();
// 通过挂载点/admin 将admin作为子应用挂载到app主应用身上。
app.use('/admin',admin);
// 子应用具有跟主应用app相同的功能
admin.get('/',(req,res,next) => {
    res.send('admin子应用');
})
app.listen(5000,() => {
    console.log('app运行在5000端口')
})

```
在上面的代码片段中，我们通过express函数生成了两个应用app和admin，然后将admin通过挂载点/admin挂载到app上。这样以后访问/admin都会由admin子应用控制。因此，我们就可以将admin抽离出来作为一个模块，实现模块化开发。

### express内置的中间件
在[Express核心之中间件](https://juejin.im/post/5eeb385e5188256591249045)这篇文章中，我们提到中间件的分类包括内置的中间件，而内置的中间件主要就是指express自带的中间件`express.xxx`。接下来我们将介绍几种可能用到的中间件。

#### express.json
```javascript
const app = express();
app.post('/user',(req,res,next) => {
    console.log(req.body);  // undefined
    req.on('data',(chunk) => {
        console.log(chunk);
    })
    res.send('express.json')
})
```
当我们使用post进行请求时，如果请求主体中的数据是json格式，那么我们通过req.body无法获取到请求的数据。因为在node中默认是以流来传输数据的，如果我们想要获取到body中的数据，需要监听data。示例如下：
```javascript
const app = express();
app.post('/user',(req,res,next) => {
    console.log(req.body);  // undefined
    req.on('data',(chunk) => {
        console.log(chunk); // {name:'hello'}
    })
    res.send('express.json')
})
```
在上面的代码片段中，我们通过req.on('data',() => {})获取到了body中的数据。但是这种获取数据太过麻烦了，因此express提供了内置的一些方法用于数据的获取，express.json就是用于获取json格式的数据。我们只需要在获取数据之前使用这个中间件即可。
```javascript
const app = express();
app.use(express.json());
app.post('/user',(req,res,next) => {
    console.log(req.body);  // {name:'hello'}
    res.send('express.json')
})
```
使用express.json中间件，我们就可以很方便地在req.body中获取请求的json格式的数据。同理express还提供了几个中间件用于处理其他格式的数据：
1. express.row 用于处理二进制的数据
2. express.text 用于处理文本数据
3. express.urlencoded 用于处理&a=123&b=455这种格式的数据
<br/>
#### express.static

通过网络发送静态文件，比如图片,css文件，以及HTML文件等对web应用来说是一个非常常见的场景。我们可以通过res.sendFile去发送文件，但是实际上一个简单的发送文件，处理起来非常麻烦，需要非常多的代码量来处理各种情况。比如，我们发送一个简单的css文件。
```javascript
app.get("/index.css", (req, res, next) => {
  res.setHeader("content-type", "text/css");
  res.send("body{background:red}");
});
```
我们需要设置发送的文件类型或者还需要对请求头等进行处理，试想一下，整个web网站需要请求多少css文件，多少图片资源，如果每个静态资源都通过路由去处理，这样项目会变得非常沉重。事实上，这些都是静态资源，不会动态修改，我们可以将其存储在服务器的一个目录下，然后再从这个目录中进行获取即可。express.static中间件就是用来处理这种静态文件的获取。
```javascript
const publicPath = path.resolve(__dirname,'public');
app.use(express.static(publicPath));
```
这样的话，我们就可以访问public目下下的所有文件了。
```javascript
http://localhost:5000/index.css
http://localhost:5000/1.jpg
```
注意：express会自动到public目录下查找，因此请求文件的url不要携带public目录名。
<br/>
#### express.Router

express.Router用于创建一个新的router对象，这个a路由对象可以像一个子应用一样设置路由，其目的同样是用于模块化开发。
```javascript
const router = express.Router();
// rotuer类似于子应用，具有与app同样的功能
router.get('/',(req,res) => {
    res.send('blog');
})
```
## app.xxx
app应用是express函数执行后得到的对象，他的核心就是app.use()用于执行中间件，这我们已经在之前的[Express核心之中间件](https://juejin.im/post/5eeb385e5188256591249045)这篇文章中讲述过了，而且我们知道app.xxx等其他方法实际上都是app.use()的语法糖，也就是说
app.xxx所有的功能都可以通过app.use来实现。因此，这里我们只是列举一下一些常用的app方法。

### 路由相关类方法
主要包括以下几种路由相关的方法：
1. app.all()
2. app.METHOD()
3. app.get()
4. app.post()
5. app.put()
#### app.all
app.all()是匹配所有的路由，不区分请求方法。示例：
```javascript
app.all("/user", (req, res, next) => {
  console.log("hello");
  next();
});
```
app.all('/user')既可以匹配app.get('/user'),又可以匹配app.post('/user')的请求，只要是/user的请求，无论是什么方法都可以做出响应。

#### app.METHOD
app.Method()支持所有的方法
#### app.get/post/put/delete
这些是常见的路由请求方法
```javascript
app.get("/user", (req, res, next) => {
  console.log('get方法');
  next();
});
app.post("/user", (req, res, next) => {
    console.log('post方法');
   res.send("app.get");
});
```
### 模板引擎相关的方法
#### app.engine
express默认使用jade模板，但是同时支持其他的模板，因此如果我们想要使用其他的模板，需要设置模板引擎。
比如我们想要使用ejs模板，那么应该使用如下设置：
```javascript
app.set('view engine', 'ejs');
```
app.set()中的'view engine',表示使用的文件模板格式，如果这里设置为ejs，那么它会默认去views下查找ejs文件，也只查找ejs
文件。也就是说这样设置后所有的views下的模板文件后缀都必须是ejs。不能是html这种。然而，有时候我们更喜欢模板文件是html，但是又
希望使用ejs，这时候就可以使用app.engine()进行设置。
```javascript
const ejs = require('ejs');
// 设置视图模板格式
app.set('view engine', 'html');
// 设置html引擎 将ejs模板映射到html
app.engine("html", ejs.__express);   // 使用ejs渲染html模板
```
app.engine()用于将EJS模板映射至".html"文件。

#### app.set/get
app.set用于设置局部变量,但是最最常用的是app.set('view engin')用于设置模板引擎。app.get()用于获取app.set()设置的变量。
```javascript
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
```
#### app.locals
app.locals同样是用于设置局部变量，只不过通过app.locals设置的局部变量在任何地方都可以被访问到。
```javascript
// 设置
app.locals.title = 'Hello,Express'
app.locals.email = 'me@myapp.com'
// 获取
cosnole.log(app.locals.title);
```
## router.xxx
router可以看做是app的一个子应用，app对象所具有的功能基本上router对象也都可以使用。包括router.all类似于app.all()、router.get/post/put类似于app.get/post/put、rotuer.use()类似于app.use()。router对象只是为了更加方便路由的模块化管理。所以app怎么使用的，router就怎么使用即可。
```javascript
const express = require('express');
cosnt router = express.Router();
router.get('/', function (req, res) {
  res.send('hello world')
})
```