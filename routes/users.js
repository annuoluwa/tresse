const express = require('express');
const usersRoute = express.Router();
const pool = require('../db');
const{ users } = require('../helperFunctions/helper')
const passport = require('passport');
const {passwordHash} = require('../passport')

//middleware to check log in
function isLoggedIn(req, res, next) { //making sure only logged-inuser can acces it
    if (req.isAuthenticated()) return next();
    res.redirect('/login');
};

function isAdmin(req, res, next) {
    if(req.user && req.user.is_admin === true) {
        return next();
    }
    return res.status(403).json({error: "Access denied"});
}

//login
/* browser redirect logic
usersRoute.post('/login', passport.authenticate("local", {
    failureRedirect: "/login" //if login fails, redirect to login page
}), (req, res)=>{
    res.json({ //using json for the sake of postman testing because it doesnt follow redirects like a browser does. 
        message: "Login sucessful",
        user: {
            id: req.user.id,
            email: req.user.email
        },
    })
    //res.redirect("/profile"); //if login succeeds,redirect to user profile
});
*/

// login - postman testing logic with json and no redirect
usersRoute.post('/login', (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
        if (err) return next(err); // handle internal errors
        if (!user) {
            // Instead of redirecting, return JSON for Postman
            return res.status(401).json({ message: "Invalid email or password" });
        }

        req.login(user, (err) => {
            if (err) return next(err);
            res.json({
                message: "Login successful",
                user: {
                    id: user.id,
                    email: user.email
                }
                
            });
        });
    })(req, res, next);
    
});




//logout
usersRoute.get('/logout', (req, res)=> {
    req.logout(function(err){
        if(err) {return next(err); }
        res.json({message: "Logged out successfully"})
    });
    //res.redirect('/') //browser option
});

//register
usersRoute.post('/register', (req, res, next)=>{
    let { username, email, password, is_admin} = req.body
    if(!username || !email || !password){
       return res.status(400).json({error: "Invalid input"})
    };

    is_admin= is_admin === true || is_admin === 'true';
    users.findByEmail(email, async (err, existingUser) => {
if(err) return next(err);
    if(existingUser){
       res.status(400).send('User already exists')
    }
    //hash paassword
    const hashedPassword = await passwordHash(password, 10);
    if(!hashedPassword) {
        return next(new Error('Password hashing failed'))
    };

    //save a new user
    users.createUser(username, email, hashedPassword, is_admin, (err, newUser) => {
        if(err) return next(err);
        res.status(201).json({message: "User registered", user: newUser});
    })
   }) 
})

//profile protected
usersRoute.get('/profile', isLoggedIn, (req, res)=>{
    res.render("dashboard", {user: req.user})
});

//CRUD operation

usersRoute.get('/', isLoggedIn, isAdmin, async(req, res, next)=> {
try {
    const result = await pool.query("SELECT  id, username, email FROM users")
    res.status(200).json({users: result.rows})
} catch (err) {
    next(err);
}
});

usersRoute.get('/:id', isLoggedIn, isAdmin, async (req, res, next) => {
    try {
const userId = req.params.id
const result = await pool.query('SELECT * FROM users WHERE id = $1', [userId])
if (req.user.id !== parseInt(userId)  && result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json(result.rows[0]);
  } catch (err) {       
    next(err);          
  }
});

//update users info by ID
usersRoute.put('/:id', async (req, res, next)=> {
    try {
    const userId = req.params.id;
    const {id, username, email, password} = req.body;
    const fields = [];
    const values = [];
    let idx =1;

    if(username){fields.push(`username = $${idx++}` ); values.push(username)};
    if(email){fields.push(`email = $${idx++}` ); values.push(email)};
    
    //hash paassword
    if(password){
    const hashedPassword = await passwordHash(password, 10);
    if(!hashedPassword) {
        return next(new Error('Password hashing failed'))
    };
    fields.push(`password = $${idx++}` ); values.push(hashedPassword)
}

if(fields.length === 0 ) {
    return res.status(404).json({error: "No field provided"});
}
values.push(userId);
const query = `UPDATE users SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`;

const result = await pool.query(query, values);

if (result.rows.length === 0) {
  return res.status(404).json({error: "User not found"})
} 
 res.json({message: "User updated successfully", user: result.rows[0]});
} catch (err) {
  next(err)
}

});

usersRoute.delete('/:id', isLoggedIn, isAdmin, async (req, res, next)=>{
    try{
const userId = req.params.id;
const result = await pool.query("DELETE FROM users WHERE id = $1", [userId])
if (result.rowCount === 0) {
    return res.status(404).json({error: "Delete unsucessful"})
}
res.status(200).json({error: "Account deleted successfully"}); 
} catch (err) {
    next(err)
}

});

module.exports = usersRoute;