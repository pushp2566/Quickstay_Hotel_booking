



# 🏨 Hotel Booking Platform

A full-stack hotel booking platform where users can search, filter, book, and manage their hotel room reservations. Admins or hotel owners can monitor bookings and earnings. Built with **React**, **Node.js**, **Express**, **MongoDB**, and integrated with **Razorpay (Test Mode)** for secure online payments (UPI, Cards, NetBanking).

---

## 📌 Features

### ✅ User Features:

* View and filter rooms based on type, price, and location
* View detailed room information with amenities and availability
* Book rooms with check-in/out dates and number of guests
* Choose between "Pay at Hotel" or "Pay with Razorpay"
* View and manage all your bookings
* Process full refunds upon booking cancellation
* Email confirmation after booking

### 🛠️ Admin/Hotel Owner Features:

* View all hotel bookings
* See total revenue and number of bookings
* Monitor payment status (Paid/Unpaid/Refunded)

---

## 💻 Tech Stack

| Frontend                        | Backend            |
| ------------------------------- | ------------------ |
| React (with Hooks, Context API) | Node.js + Express  |
| Tailwind CSS                    | MongoDB + Mongoose |
| React Router                    | Razorpay SDK       |
| Axios                           | Nodemailer         |
| React Hot Toast                 | RESTful APIs       |

---

## 🔧 Getting Started

### 📦 Prerequisites

* Node.js (v16+ recommended)
* MongoDB (local or Atlas)
* Razorpay Test Mode Account
* `.env` file configured (see below)

---

## 💳 Razorpay Payment Flow

1. User clicks **Pay Now (Razorpay)**
2. Razorpay Checkout modal opens with UPI/Card options
3. Frontend receives payment signature and sends to `/api/razorpay/verify-payment`
4. Backend verifies HMAC-SHA256 signature & updates booking as paid
5. User can click **Cancel & Refund** for automated refund processing

---

## 📬 Email Notifications

After successful booking, user receives an email with:

* Booking ID
* Hotel Name and Address
* Price and Dates

---

## 🚀 Deployment

* Frontend: Vercel
* Backend: Vercel / Node Server
* MongoDB: MongoDB Atlas

---

## 🙌 Acknowledgements

* [Razorpay](https://razorpay.com/)
* [Nodemailer](https://nodemailer.com/)
* [MongoDB Atlas](https://www.mongodb.com/atlas)
* [React Hot Toast](https://react-hot-toast.com/)


