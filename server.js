// Load .env only in development
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config({ path: './backend/.env' });
}

const express = require('express');
const Stripe = require('stripe');
const morgan = require('morgan');
const errorHandler = require('errorhandler');
const pool = require('./backend/db');
const passport = require('./backend/passport').passport;
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const cors = require('cors');

const PORT = process.env.PORT || 9000;
const app = express();

//CORS
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));

//Body parser
app.use(express.json());
const stripe = Stripe(process.env.STRIPE_SK);
app.use(morgan('dev'));

//Session
app.use(session({
  store: new pgSession({ pool, tableName: 'session', createTableIfMissing: true }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    domain: process.env.NODE_ENV === 'production' ? process.env.COOKIE_DOMAIN : undefined,
    maxAge: 1000 * 60 * 60
  }
}));


//Passport
app.use(passport.initialize());
app.use(passport.session());

//OAuth routes
app.get('/auth/google',
  passport.authenticate('google', { 
    scope: ['profile', 'email'], 
    accessType: 'offline', 
    prompt: 'consent' 
  })
);

app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/login', session: true }),
  async (req, res, next) => {
    try {
      req.session.save((err) => {
        if (err) {
          console.error("Session save error:", err);
          return res.redirect(`${process.env.CORS_ORIGIN}/login?error=session_failed`);
        }
        res.redirect(`${process.env.CORS_ORIGIN}/oauth-success`);
      });
    } catch (err) {
      console.error("OAuth callback error:", err);
      res.redirect(`${process.env.CORS_ORIGIN}/login?error=oauth_failed`);
    }
  }
);


//API Routes
const { productRouter } = require('./backend/routes/product');
const { usersRouter } = require('./backend/routes/users');
const { cartRouter } = require('./backend/routes/cart');
const { orderRouter } = require('./backend/routes/order');
const { categoryRouter } = require('./backend/routes/category');
const { newsletterRouter } = require('./backend/routes/newsLetterRouter');

app.use('/products', productRouter);
app.use('/users', usersRouter);
app.use('/cart', cartRouter);
app.use('/order', orderRouter);
app.use('/category', categoryRouter);
app.use('/newsletter', newsletterRouter);

if (process.env.NODE_ENV === 'development') {
  app.use(errorHandler());
}

app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message,
    stack: err.stack
  });
});

app.get('/', (req, res) => res.send('Server is running!'));

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

module.exports = { app };