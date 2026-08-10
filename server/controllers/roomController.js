import Hotel from "../models/Hotel.js";
import Room from "../models/Room.js";
import { v2 as cloudinary } from "cloudinary";

// API to create a new room for a hotel
// POST /api/rooms
export const createRoom = async (req, res) => {
  try {
    const { roomType, pricePerNight, amenities } = req.body;

    const ownerId = req.user?._id || req.auth?.userId;
    const hotel = await Hotel.findOne({ owner: ownerId });

    if (!hotel) return res.json({ success: false, message: "No Hotel found" });
    if (!req.files?.length) {
      return res.status(400).json({ success: false, message: "At least one room image is required" });
    }

    // upload images to cloudinary
    const uploadImages = req.files.map(async (file) => {
      const response = await cloudinary.uploader.upload(file.path);
      return response.secure_url;
    });

    // Wait for all uploads to complete
    const images = await Promise.all(uploadImages);

    let parsedAmenities = [];
    try {
      parsedAmenities = typeof amenities === "string" ? JSON.parse(amenities) : amenities;
    } catch {
      parsedAmenities = [];
    }

    await Room.create({
      hotel: hotel._id,
      roomType,
      pricePerNight: +pricePerNight,
      amenities: parsedAmenities,
      images,
    });

    res.json({ success: true, message: "Room created successfully" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// API to get all rooms
// GET /api/rooms
export const getRooms = async (req, res) => {
  try {
    const rooms = await Room.find({ isAvailable: true })
      .populate({
        path: 'hotel',
        populate: {
          path: 'owner', 
          select: 'image',
        },
      }).sort({ createdAt: -1 });

    const validRooms = rooms.filter((room) => room.hotel !== null);
    res.json({ success: true, rooms: validRooms });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// API to get all rooms for a specific hotel
// GET /api/rooms/owner
export const getOwnerRooms = async (req, res) => {
  try {
    const ownerId = req.user?._id || req.auth?.userId;
    const hotelData = await Hotel.findOne({ owner: ownerId });
    if (!hotelData) {
      return res.json({ success: false, message: "No Hotel found", rooms: [] });
    }
    const rooms = await Room.find({ hotel: hotelData._id.toString() }).populate("hotel");
    res.json({ success: true, rooms });
  } catch (error) {
    console.log(error);
    
    res.json({ success: false, message: error.message });
  }
};

// API to toggle availability of a room
// POST /api/rooms/toggle-availability
export const toggleRoomAvailability = async (req, res) => {
  try {
    const { roomId } = req.body;
    const roomData = await Room.findById(roomId);
    if (!roomData) {
      return res.status(404).json({ success: false, message: "Room not found" });
    }

    const hotel = await Hotel.findOne({ _id: roomData.hotel, owner: req.user._id });
    if (!hotel) {
      return res.status(403).json({ success: false, message: "You cannot update this room" });
    }

    roomData.isAvailable = !roomData.isAvailable;
    await roomData.save();
    res.json({ success: true, message: "Room availability Updated" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};
