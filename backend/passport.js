const { Users } = require('./helperFunctions/helper');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const bcrypt = require('bcrypt');

// Password hash function
async function passwordHash(password, saltRounds) {
  try {
    return await bcrypt.hash(password, saltRounds);
  } catch (err) {
    console.error('Password hashing error:', err);
    return null;
  }
}

// LOCAL STRATEGY (for email/password login)
passport.use(new LocalStrategy(
  {
    usernameField: 'email',
    passwordField: 'password'
  },
  async (email, password, done) => {
    try {
      const user = await Users.findByEmail(email);
      
      if (!user) {
        return done(null, false, { message: 'Invalid email or password' });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      
      if (!isMatch) {
        return done(null, false, { message: 'Invalid email or password' });
      }

      return done(null, user);
    } catch (err) {
      console.error('Local strategy error:', err);
      return done(err);
    }
  }
));

// GOOGLE STRATEGY (for OAuth login)
passport.use(new GoogleStrategy({
  clientID: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const googleId = profile.id;
    let user = await Users.findByGoogleId(googleId);
    
    if (!user) {
      user = await Users.createFromGoogle(profile);
    }
    
    return done(null, user);
  } catch (err) {
    console.error('Google OAuth Error:', err);
    return done(err, null);
  }
}));

// Serialize user
passport.serializeUser((user, done) => {
  console.log('=== Serializing user ===');
  console.log('User ID:', user.id);
  done(null, user.id);
});

// Deserialize user
passport.deserializeUser(async (id, done) => {
  try {
    console.log('=== Deserializing user ===');
    console.log('User ID to deserialize:', id);
    const user = await Users.findById(id);
    console.log('Deserialized user:', user?.id);
    done(null, user);
  } catch (err) {
    console.error('User deserialization error:', err);
    done(err, null);
  }
});

module.exports = { passport, passwordHash };
