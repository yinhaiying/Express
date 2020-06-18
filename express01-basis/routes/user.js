const express = require('express');

const router = express.Router();
router.get('/',(req,res) => {
    res.send('这里是user路由');
})
module.exports = router;