
export function requireAuth(req, res, next) {

    // Check whether the user has an active session
    if (!req.session?.user) {
        return res.status(401).json({
            success: false,
            message: "Authentication required. Please log in."
        });
    }

    // Allow the request to continue
    next();
}
