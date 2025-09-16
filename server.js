require('dotenv').config();
const express = require('express');
const morgan = require('morgan')
const app = express();
const errorHandler = require('errorhandler');
const pool = require('./db');
const passport = require("passport");
const Localstrategy = require("passport-local");
const passportJs = require('./passport');
const session = require('express-session');
const PORT = 3000;

app.use(morgan('dev'));

//import router 
const productRouter = require('./routes/product');
const usersRouter = require('./routes/users');
const cartRouter = require('./routes/cart');


//parse json
app.use(express.json());

//session
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 1000 * 60 * 60 //1 hour
  }

}))
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('Cookie secure?', process.env.NODE_ENV === 'production');

//passport
app.use(passport.initialize());
app.use(passport.session());

//mount all routes
app.use('/products', productRouter);
app.use('/users', usersRouter);
app.use('/cart', cartRouter);

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
  app

};

