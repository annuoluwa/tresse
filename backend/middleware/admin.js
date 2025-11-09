const express = require('express');


function isAdmin(req, res, next) {
    if(req.user && req.user.is_admin === true) {
        return next();
    }
    return res.status(403).json({error: "Access denied"});
}

module.exports = isAdmin;