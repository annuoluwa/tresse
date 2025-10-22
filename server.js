require('dotenv').config();
const express = require('express');
const morgan = require('morgan')
const app = express();
const errorHandler = require('errorhandler');
const pool = require('./backend/db');
const passport = require("passport");
const Localstrategy = require("passport-local");
const passportJs = require('./backend/passport');
const session = require('express-session');
const cors = require('cors') 
const PORT = 9000;


app.use(morgan('dev'));

//import router 
const {productRouter} = require('./backend/routes/product');
const {usersRouter} = require('./backend/routes/users');
const {cartRouter} = require('./backend/routes/cart');
const {orderRouter} = require('./backend/routes/order');
const {categoryRouter} = require('./backend/routes/category');

app.use(cors());

//parse json
app.use(express.json());

app.use(morgan('dev'));

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
app.use('/order', orderRouter);
app.use('/category', categoryRouter)

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

app.get('/', (req, res) => res.send('Server is running!'));

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`)
});

module.exports = { 
  app

};

