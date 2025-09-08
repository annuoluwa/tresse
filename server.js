require('dotenv').config();
const express = require('express');
const morgan = require('morgan')
const app = express();
const errorHandler = require('errorhandler');
const pool = require('./db');
const PORT = 3000;

app.use(morgan('dev'));

//import router 
const productRouter = require('./routes/product');
//const userRouter = require('./routes/users')


//parse json
app.use(express.json());

//mount all routes
//product router
app.use('/products', productRouter);
//app.use('/users', userRouter);


//error handling 
if (process.env.NODE_ENV === 'development') {
  app.use(errorHandler()); // dev-friendly stack traces
}

//central error handler
app.use((err, req, res, next)=>{
  console.error('Central error:', err); // full error log
  res.status(err.status || 500).json({
    error: err.message,
    stack: err.stack
  });
});



app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`)
});

module.exports = { 
  pool,
  app

};

