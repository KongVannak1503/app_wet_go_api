// middlewares/authorize.js
const authorize = (roles = []) => {

    if (typeof roles === 'string') {
        roles = [roles];
    }

    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Forbidden: Access denied' });
        }

        next();
    };
};

module.exports = authorize;
