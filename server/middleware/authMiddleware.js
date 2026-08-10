import User from "../models/User.js";
import { clerkClient, getAuth } from "@clerk/express";

// Middleware to check if user is authenticated
export const protect = async (req, res, next) => {
  const auth = getAuth(req);
  const userId = auth?.userId || req.auth?.userId;

  if (!userId) {
    return res.status(401).json({ success: false, message: "Not authenticated" });
  }

  try {
    let user = await User.findById(userId);
    if (!user) {
      // Auto-provision user from Clerk if webhook has not run yet
      try {
        const clerkUser = await clerkClient.users.getUser(userId);
        const email = clerkUser.emailAddresses?.[0]?.emailAddress || "";
        const firstName = clerkUser.firstName || "";
        const lastName = clerkUser.lastName || "";
        const username = (firstName + " " + lastName).trim() || email.split("@")[0] || "User";
        const image = clerkUser.imageUrl || "";

        user = await User.create({
          _id: userId,
          email,
          username,
          image,
          role: "user",
          recentSearchedCities: [],
        });
      } catch (clerkErr) {
        console.error("Auto user provisioning error:", clerkErr.message);
        return res.status(200).json({ success: false, message: "User account is not ready yet" });
      }
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};
