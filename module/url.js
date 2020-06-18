
const getUrl = (req,res,next) => {
    console.log(req.url);
    next();
}

const getUrl2 = (options) => {
    return () => {
      console.log(`${options.pre}:+req.url`);
      next();
    }
}