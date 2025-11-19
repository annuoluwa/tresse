// Load .env only in development
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config({ path: './backend/.env' });
}

const express = require('express');
const path = require('path');
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

// Trust proxy for Render HTTPS
app.set('trust proxy', 1);

// CORS only for local development
if (process.env.NODE_ENV !== 'production') {
  app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
  }));
}

// Body parser
app.use(express.json());
const stripe = Stripe(process.env.STRIPE_SK);
app.use(morgan('dev'));

// Session configuration
app.use(session({
  store: new pgSession({ 
    pool, 
    tableName: 'session', 
    createTableIfMissing: true 
  }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  name: 'connect.sid',
  proxy: true,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    path: '/',
    maxAge: 1000 * 60 * 60
  }
}));

// Passport initialization
app.use(passport.initialize());
app.use(passport.session());

// OAuth routes
app.get('/auth/google',
  passport.authenticate('google', { 
    scope: ['profile', 'email'], 
    accessType: 'offline', 
    prompt: 'consent' 
  })
);

app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    req.session.save((err) => {
      if (err) {
        console.error('Session save error:', err);
        return res.redirect('/login?error=session');
      }
      res.redirect('/oauth-success');
    });
  }
);

// API Routes
const { productRouter } = require('./backend/routes/product');
const { usersRouter } = require('./backend/routes/users');
const { cartRouter } = require('./backend/routes/cart');
const { orderRouter } = require('./backend/routes/order');
const { categoryRouter } = require('./backend/routes/category');
const { newsletterRouter } = require('./backend/routes/newsLetterRouter');

app.use('/api/products', productRouter);
app.use('/api/users', usersRouter);
app.use('/api/cart', cartRouter);
app.use('/api/order', orderRouter);
app.use('/api/category', categoryRouter);
app.use('/api/newsletter', newsletterRouter);

// Serve React frontend in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'frontend/build')));
  
  app.get(/^\/(?!api).*/, (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend/build', 'index.html'));
  });
}

// Development error handler and test route
if (process.env.NODE_ENV === 'development') {
  app.use(errorHandler());
  app.get('/', (req, res) => res.send('Server is running!'));
}

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

module.exports = { app };