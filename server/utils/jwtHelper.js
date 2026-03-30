const jwt = require("jsonwebtoken");

const signToken = (id,secret,expiresIn) => {
    return jwt.sign({id},secret,{expiresIn:expiresIn});
}

module.exports = signToken;