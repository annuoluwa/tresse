const { Users } = require('./helperFunctions/helper');
const passport = require('passport');
const bcrypt = require('bcrypt');
const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;

// Hashing function for passwords
const passwordHash = async (password, saltRounds) => {
  try {
    const salt = await bcrypt.genSalt(saltRounds);
    return await bcrypt.hash(password, salt);
  } catch (err) {
    console.log(err);
  }
  return null;
};

// Local login strategy
passport.use(new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {
  try {
    const user = await Users.findByEmail(email);
    if (!user) return done(null, false, { message: 'Incorrect email' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return done(null, false, { message: 'Incorrect password' });

    return done(null, user);
  } catch (err) {
    return done(err);
  }
}));

// Google OAuth strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        console.log("Google Profile:", profile.id, profile.emails[0].value);
        
        let user = await Users.findByGoogleId(profile.id);
        console.log("Found existing user:", user ? user.id : "none");

        if (!user) {
          console.log("Creating new user from Google profile");
          user = await Users.createFromGoogle(profile);
          console.log("New user created:", user.id);
        }

        return done(null, user);
      } catch (err) {
        console.error("Google Strategy Error:", err.message);
        return done(err, null);
      }
    }
  )
);

// Serialize user for session
passport.serializeUser((user, done) => {
  console.log("Serializing user:", user.id);
  done(null, user.id); // store DB primary key (id) in session
  
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await Users.findById(id);
         if (!user) return done(null, false); // user not found
    done(null, user);
  } catch (err) {
    console.error("Error deserializing user:", err);
    done(err);
  }
});

module.exports = {
  passport,
  passwordHash
};
