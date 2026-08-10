import { Webhook } from "svix";
import User from "../models/User.js";

// API Controller Function to Manage Clerk User with database
// POST /api/clerk
const clerkWebhooks = async (req, res) => {
  try {
    // Create a Svix instance with clerk webhook secret.
    const whook = new Webhook(process.env.CLERK_WEBHOOK_SECRET);

    // Getting Headers
    const headers = {
      "svix-id": req.headers["svix-id"],
      "svix-timestamp": req.headers["svix-timestamp"],
      "svix-signature": req.headers["svix-signature"],
    };

    // Verifying Headers
    const payload = await whook.verify(req.body.toString(), headers);

    // Getting Data from request body
    const { data, type } = payload;

    const userData = {
      _id: data.id,
      email: data.email_addresses[0]?.email_address || "",
      username: ((data.first_name || "") + " " + (data.last_name || "")).trim() || "User",
      image: data.image_url || "",
    };

    // Switch Cases for different Events
    switch (type) {
      case "user.created":
      case "user.updated": {
        await User.findByIdAndUpdate(data.id, userData, { upsert: true, new: true });
        break;
      }

      case "user.deleted": {
        await User.findByIdAndDelete(data.id);
        break;
      }

      default:
        break;
    }

    res.json({ success: true, message: "Webhook Recieved" });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

export default clerkWebhooks;
