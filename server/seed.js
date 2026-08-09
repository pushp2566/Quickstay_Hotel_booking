// seed.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import Booking from "./models/Booking.js";
import User from "./models/User.js";
import Hotel from "./models/Hotel.js";
import Room from "./models/Room.js";
dotenv.config();
const MONGO_URI = process.env.MONGODB_URI;

// --- Users ---
// Two regular users and two hotel owners
const users = [
  {
    _id: "u_pushpendra",
    username: "Pushpendra Choure",
    email: "pushpendra@example.com",
    image: "https://example.com/images/pushpendra.jpg",
    role: "user",
    recentSearchedCities: ["Patna", "Bengaluru", "Mumbai"],
  },
  {
    _id: "u_anita",
    username: "Anita Sharma",
    email: "anita@example.com",
    image: "https://example.com/images/anita.jpg",
    role: "hotelOwner",
    recentSearchedCities: ["Chhindwara", "Nagpur"],
  },
  {
    _id: "u_rahul",
    username: "Rahul Verma",
    email: "rahul@example.com",
    image: "https://example.com/images/rahul.jpg",
    role: "user",
    recentSearchedCities: ["Goa", "Jaipur"],
  },
  {
    _id: "u_sneha",
    username: "Sneha Patel",
    email: "sneha@example.com",
    image: "https://example.com/images/sneha.jpg",
    role: "hotelOwner",
    recentSearchedCities: ["Delhi", "Agra"],
  },
];

// --- Hotels (owned by hotelOwners) ---
// Hotels are owned by users with the 'hotelOwner' role
const hotels = [
  {
    _id: "hotel_patna_grand",
    name: "The Patna Grand",
    address: "12 Exhibition Road, Patna",
    contact: "+91-9876543210",
    owner: "u_anita", // Belongs to Anita Sharma
    city: "Patna",
  },
  {
    _id: "hotel_goa_breeze",
    name: "Goa Sea Breeze",
    address: "45 Calangute Beach, Goa",
    contact: "+91-9876543211",
    owner: "u_sneha", // Belongs to Sneha Patel
    city: "Goa",
  },
  {
    _id: "hotel_delhi_palace",
    name: "Delhi Royal Palace",
    address: "78 Connaught Place, Delhi",
    contact: "+91-9876543212",
    owner: "u_sneha", // Also belongs to Sneha Patel
    city: "Delhi",
  },
];

// --- Rooms (belonging to specific hotels) ---
// Each room is linked to a valid hotel via the 'hotel' field
const rooms = [
  {
    _id: "room_patna_101",
    hotel: "hotel_patna_grand",
    roomType: "Deluxe Single",
    pricePerNight: 2500,
    amenities: ["WiFi", "AC", "TV", "Room Service"],
    images: ["https://example.com/rooms/patna101-1.jpg"],
    isAvailable: true,
  },
  {
    _id: "room_patna_202",
    hotel: "hotel_patna_grand",
    roomType: "Executive Double",
    pricePerNight: 4000,
    amenities: ["WiFi", "AC", "TV", "Mini Bar", "Breakfast Included"],
    images: ["https://example.com/rooms/patna202-1.jpg"],
    isAvailable: true,
  },
  {
    _id: "room_goa_301",
    hotel: "hotel_goa_breeze",
    roomType: "Sea View Suite",
    pricePerNight: 7500,
    amenities: ["Sea View Balcony", "WiFi", "AC", "Jacuzzi"],
    images: ["https://example.com/rooms/goa301-1.jpg"],
    isAvailable: true,
  },
  {
    _id: "room_delhi_401",
    hotel: "hotel_delhi_palace",
    roomType: "Standard Single",
    pricePerNight: 3000,
    amenities: ["WiFi", "AC"],
    images: ["https://example.com/rooms/delhi401-1.jpg", "https://example.com/rooms/delhi401-2.jpg"],
    isAvailable: false, // This room is currently unavailable
  },
];

// --- Bookings (linking users, rooms, and hotels) ---
// Each booking connects a user to a specific room in a specific hotel
const bookings = [
  {
    _id: "bkg_001",
    user: "u_pushpendra", // Pushpendra books a room
    room: "room_patna_202", // The Executive Double in Patna
    hotel: "hotel_patna_grand", // The booking is for The Patna Grand
    checkInDate: new Date("2025-10-15"),
    checkOutDate: new Date("2025-10-18"),
    totalPrice: 4000 * 3, // 3 nights
    guests: 2,
    status: "confirmed",
    paymentMethod: "Credit Card",
    isPaid: true,
  },
  {
    _id: "bkg_002",
    user: "u_rahul", // Rahul books a room
    room: "room_goa_301", // The Sea View Suite in Goa
    hotel: "hotel_goa_breeze", // The booking is for Goa Sea Breeze
    checkInDate: new Date("2025-11-20"),
    checkOutDate: new Date("2025-11-25"),
    totalPrice: 7500 * 5, // 5 nights
    guests: 2,
    status: "pending",
    paymentMethod: "Pay At Hotel",
    isPaid: false,
  },
  {
    _id: "bkg_003",
    user: "u_pushpendra", // Pushpendra had a past booking
    room: "room_delhi_401", // For the now-unavailable room in Delhi
    hotel: "hotel_delhi_palace", // The booking was for Delhi Royal Palace
    checkInDate: new Date("2025-07-01"), // A date in the past
    checkOutDate: new Date("2025-07-03"),
    totalPrice: 3000 * 2, // 2 nights
    guests: 1,
    status: "cancelled", // This booking was cancelled
    paymentMethod: "Debit Card",
    isPaid: false,
  },
];


async function seed() {
  try {
    if (!MONGO_URI) {
        throw new Error("MONGODB_URI is not defined in .env file");
    }
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB:", MONGO_URI);

    // Clear existing data in the correct order to avoid reference errors
    console.log("Deleting old data...");
    await Booking.deleteMany({});
    await Room.deleteMany({});
    await Hotel.deleteMany({});
    await User.deleteMany({});
    console.log("Old data deleted.");

    // Insert new data
    console.log("Seeding new data...");
    await User.insertMany(users);
    await Hotel.insertMany(hotels);
    await Room.insertMany(rooms);
    await Booking.insertMany(bookings);

    console.log("✅ Seeding completed successfully.");
    process.exit(0);
  } catch (err) {
    console.error("❌ Seeding error:", err);
    process.exit(1);
  }
}

seed();