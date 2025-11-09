require('dotenv').config();
const express = require('express');
const Stripe = require('stripe')
const morgan = require('morgan')
const app = express();
const errorHandler = require('errorhandler');
const pool = require('./backend/db');
const passport = require("passport");
const Localstrategy = require("passport-local");
const passportJs = require('./backend/passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const cors = require('cors') 
const PORT = 9000;



app.use(cors({
  origin: "http://localhost:3000", 
  credentials: true,}));

//import router 
const {productRouter} = require('./backend/routes/product');
const {usersRouter} = require('./backend/routes/users');
const {cartRouter} = require('./backend/routes/cart');
const {orderRouter} = require('./backend/routes/order');
const {categoryRouter} = require('./backend/routes/category');
const {newsletterRouter} = require('./backend/routes/newsletterRouter');




//parse json
app.use(express.json());
const stripe = Stripe(process.env.STRIPE_SK);

app.use(morgan('dev'));

//session
app.use(session({
  store: new pgSession({
    pool: pool,              
    tableName: 'session',
    createTableIfMissing: true 
  }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    httpOnly: true,
    sameSite: "lax",
    maxAge: 1000 * 60 * 60 // 1 hour
  }
}));
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('Cookie secure?', process.env.NODE_ENV === 'production');



//passport
app.use(passport.initialize());
app.use(passport.session());


//Google OAuth strategy
passport.use(new GoogleStrategy({
  clientID: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  callbackURL: 'http://localhost:9000/auth/google/callback'
},
(accessToken, refreshToken, profile, done) => {
  return done(null, profile);
}
))

app.get(
  '/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

// Google OAuth callback
app.get(
  '/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  async (req, res, next) => {
    try {
      // Extract info from Google profile
      const { id: googleId, displayName, emails } = req.user;
      const email = emails[0].value;

      //  Check if the user already exists by google_id
      let existingUser = await pool.query(
        "SELECT * FROM users WHERE google_id = $1",
        [googleId]
      );

      let dbUser;

      if (!existingUser.rows.length) {
        //  Insert new user and get DB record
        const insertResult = await pool.query(
          "INSERT INTO users (username, email, google_id) VALUES ($1, $2, $3) RETURNING *",
          [displayName, email, googleId]
        );
        dbUser = insertResult.rows[0];
      } else {
        dbUser = existingUser.rows[0];
      }

      // Log in the DB user
      req.login(dbUser, (err) => {
        if (err) return next(err);

        //  Redirect to frontend
        res.redirect('http://localhost:3000/');
      });
    } catch (err) {
      console.error("Google OAuth callback error:", err);
      next(err);
    }
  }
);


//mount all routes
app.use('/products', productRouter);
app.use('/users', usersRouter);
app.use('/cart', cartRouter);
app.use('/order', orderRouter);
app.use('/category', categoryRouter);
app.use('/newsletter', newsletterRouter)

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

