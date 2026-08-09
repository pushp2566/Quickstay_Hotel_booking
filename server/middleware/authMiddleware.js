import User from "../models/User.js";

// Middleware to check if user is authenticated
export const protect = async (req, res, next) => {
  const userId = req.auth?.userId;
  if (!userId) {
    return res.status(401).json({ success: false, message: "Not authenticated" });
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(401).json({ success: false, message: "User account is not ready yet" });
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};
