const roleMiddleware = (...allowedRoles) => {
    return (req, res, next) => {
        // 1. Check if user exists (set by authMiddleware)
        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        // 2. Check if the user's role is allowed
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ message: "Access Denied" });
        }

        // 3. If all checks pass, proceed
        next();
    };
};

module.exports = roleMiddleware;