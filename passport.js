const { users } = require('./helperFunctions/helper');
const passport = require('passport');
const bcrypt = require('bcrypt');
const LocalStrategy = require('passport-local').Strategy;


const passwordHash = async (password, saltRounds)=>{
    try{
        const salt = await bcrypt.genSalt(saltRounds);
        return await bcrypt.hash(password, salt);
    } catch (err){
        console.log(err);
    }
    return null;
}

passport.use(new LocalStrategy (
    {usernameField: 'email'},
    function(email, password, done) {
 users.findByEmail(email, async (err, user) => {; 
    if(err) return done(err);
    
 console.log("Email attempted:", email);
      console.log("User found in DB:", user);
    if(!user)  return done(null, false);
    
    
    try {
        console.log("Password entered:", password);
console.log("Password in DB:", user.password);

    const match = await bcrypt.compare(password, user.password);
    console.log("Password match?", match);
    if(!match) {
        return done(null, false);
    }
    return done(null, user);
} catch (err) {
return done(err)
}
});
    }
));
   

//serialize & deserialize user
passport.serializeUser((user, done) => {
    done(null, user.id);
})
passport.deserializeUser((id, done)=>{
    users.findById(id, function(err, user){
        if(err)return done(err);
        if(!user) return done(null, false)
       return  done (err, user)
    })
});

module.exports = {
    passport,
passwordHash
};