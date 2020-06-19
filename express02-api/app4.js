const express = require("express");
const app = express();
const path = require("path");
app.use(express.json());
app.use(express.urlencoded());

const publicPath = path.resolve(__dirname, "public");
app.use(express.static(publicPath));
const user = express.Router();

app.use('/user',user);


user.get('/add',(req,res) => {
    console.log(req.baseUrl);  // /user
    console.log(req.originalUrl); // /user/add
    res.send('hello');
})


app.listen(5000, () => {
  console.log("app运行在5000端口");
});
