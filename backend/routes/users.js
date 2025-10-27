const express = require('express');
const usersRouter = express.Router();
const pool = require('../db');
const{ Users } = require('../helperFunctions/helper')
const passport = require('passport');
const {passwordHash} = require('../passport')

//middleware to check log in
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
      return next();
  }
  return res.status(401).json({ message: "Not authenticated" });
}

function isAdmin(req, res, next) {
    if(req.user && req.user.is_admin === true) {
        return next();
    }
    return res.status(403).json({error: "Access denied"});
}

//login
//browser redirect logic
async function userBrowserLogin(req, res, next) {
  try {
    const user = await new Promise((resolve, reject) => {
      passport.authenticate('local', (err, user, info) => {
        if (err) return reject(err);             // internal error
        if (!user) return reject(new Error('Invalid email or password')); // invalid login
        resolve(user);                           // successful login
      })(req, res, next);
    });

    await new Promise((resolve, reject) => {
      req.login(user, (err) => {
        if (err) return reject(err);
        resolve();
      });
    });

    res.status(200).json({user})
//res.redirect('/profile');

  } catch (err) {
    res.status(401).json({ message: err.message });
  }
};



// login - postman testing logic with json and no redirect
/*async function userLogin(req, res, next) {
   await passport.authenticate("local", (err, user, info) => {
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
    
};*/




//logout
function userLogout(req, res, next) {
    req.logout(err => {
        if (err) return next(err);

        req.session.destroy(err => {
            if (err) return next(err);

            // clear session cookie
            res.clearCookie('connect.sid');

            res.json({ message: "Logged out successfully" });
        });
    });
}

//register
async function registerNewUser(req, res, next) {
   try {
               let { username, email, password, is_admin} = req.body
       if(!username || !email || !password){
          return res.status(400).json({error: "Email and Password required"})
       };
   
       const adminFlag = is_admin === true || is_admin === 'true';
   
       //check if user already exists
      const existingUser = await Users.findByEmail(email);
       if(existingUser){
         return res.status(409).json({message:'User already exists'})
       }
   
       //hash paassword
       const hashedPassword = await passwordHash(password, 10);
       if(!hashedPassword) {
           return next(new Error('Password hashing failed'))
       };
   
       //create a new user
       const newUser = await Users.createUser(username, email, hashedPassword, adminFlag);
           
           res.status(201).json({message: "User registered successfully", user: newUser});
       
   }catch (err) {
       next(err)
   };
       };

//server side rendering
usersRouter.get('/profile', isLoggedIn, (req, res)=>{
    res.render("dashboard", {user: req.user})
});

//React SPA
usersRouter.get("/me", isLoggedIn, (req, res) => {
  res.json(req.user); 
});

//CRUD operation

 async function getAllProfilesByAdmin(req, res, next) {
try {
    const result = await pool.query("SELECT  id, username, email FROM users")
    res.status(200).json({users: result.rows})
} catch (err) {
    next(err);
}
};

/*async function getUserById(req, res, next) {
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
};*/

async function getUserById(req, res, next) {
    try {
        const userId = req.params.id;
        const result = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "User not found" });
        }

        // Simply return the user data without checking req.user
        res.status(200).json(result.rows[0]);
    } catch (err) {
        next(err);
    }
};


//update users info by ID
 async function updateUserRoute(req, res, next) {
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
};
 };

async function deleteUserPath(req, res, next) {
    try{
const userId = req.params.id;
const result = await pool.query("DELETE FROM users WHERE id = $1", [userId])
if (result.rowCount === 0) {
    return res.status(404).json({error: "Delete unsuccessful"})
}
res.status(200).json({message: "Account deleted successfully"}); 
} catch (err) {
    next(err)
}

};

module.exports ={ usersRouter, isAdmin, isLoggedIn, deleteUserPath, updateUserRoute, getUserById, getAllProfilesByAdmin, registerNewUser, userLogout, userBrowserLogin};
usersRouter.post('/login', userBrowserLogin)
//usersRoute.post('/login', userLogin)
usersRouter.post('/logout', userLogout)
usersRouter.post('/register', registerNewUser)
usersRouter.get('/', isLoggedIn, isAdmin, getAllProfilesByAdmin)
usersRouter.get('/:id', getUserById)
usersRouter.put('/:id', updateUserRoute)
usersRouter.delete('/:id', isLoggedIn, isAdmin, deleteUserPath);