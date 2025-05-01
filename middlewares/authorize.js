const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
    let token = req.headers['authorization'];
    
    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    token = token.split(' ')[1].trim(); // Remove 'Bearer' from the token
    try {
        jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decoded) => {
            if (err) {
                return res.status(401).json({ message: 'Unauthorized' });
            }
            req.user = decoded; // Attach the decoded token to the request object
        });
        next();
    } catch (error) {
        res.status(401).json({ message: 'Invalide Token!' });
    }  
    // If you want to check the token against a database or perform other checks, do it here.   
}