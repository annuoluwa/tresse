const { Users } = require('./helperFunctions/helper');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

passport.use(new GoogleStrategy({
  clientID: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL
}, async (accessToken, refreshToken, profile, done) => {
  try {
    console.log("=== Google Strategy Callback ===");
    console.log("Profile ID:", profile.id);
    console.log("Email:", profile.emails[0]?.value);
    
    const email = profile.emails[0]?.value;
    const googleId = profile.id;
    
    let user = await Users.getUserByGoogleId(googleId);
    
    if (!user) {
      console.log("User not found, creating new user");
      user = await Users.createUser({
        email,
        google_id: googleId,
        first_name: profile.name?.givenName || '',
        last_name: profile.name?.familyName || ''
      });
      console.log("New user created:", user.id);
    } else {
      console.log("Existing user found:", user.id);
    }
    
    return done(null, user);
  } catch (err) {
    console.error("Google Strategy Error:", err);
    return done(err, null);
  }
}));

passport.serializeUser((user, done) => {
  console.log("=== Serializing user ===");
  console.log("User object:", user);
  console.log("User ID to serialize:", user.id);
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  console.log("=== Deserializing user ===");
  console.log("User ID to deserialize:", id);
  
  try {
    const user = await Users.getUserById(id);
    console.log("Deserialized user:", user?.id);
    done(null, user);
  } catch (err) {
    console.error("Deserialization error:", err);
    done(err, null);
  }
});

module.exports = { passport };
