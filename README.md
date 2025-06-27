# Quickstay_Hotel_booking

Sure! Here's a well-structured `README.md` content for your **hotel booking project** that includes frontend and backend features, technologies, setup instructions, and deployment sections. You can adjust specific details as per your actual project name and links.

---

# 🏨 Hotel Booking Platform

A full-stack hotel booking platform where users can search, filter, book, and manage their hotel room reservations. Admins or hotel owners can monitor bookings and earnings. Built with **React**, **Node.js**, **Express**, **MongoDB**, and integrated with **Stripe** for secure online payments.

---

## 📌 Features

### ✅ User Features:

* View and filter rooms based on type, price, and location
* View detailed room information with amenities and availability
* Book rooms with check-in/out dates and number of guests
* Choose between "Pay at Hotel" or "Pay with Stripe"
* View and manage all your bookings
* Email confirmation after booking

### 🛠️ Admin/Hotel Owner Features:

* View all hotel bookings
* See total revenue and number of bookings
* Monitor payment status (Paid/Unpaid)

---

## 💻 Tech Stack

| Frontend                        | Backend            |
| ------------------------------- | ------------------ |
| React (with Hooks, Context API) | Node.js + Express  |
| Tailwind CSS                    | MongoDB + Mongoose |
| React Router                    | Stripe API         |
| Axios                           | Nodemailer         |
| React Hot Toast                 | RESTful APIs       |

---

## 🔧 Getting Started

### 📦 Prerequisites

* Node.js (v16+ recommended)
* MongoDB (local or Atlas)
* Stripe Account
* `.env` file configured (see below)

---

### 📁 Folder Structure

```
/client      - React Frontend
/server      - Node/Express Backend
```

---

### ⚙️ Backend Setup

```bash
cd server
npm install
```

#### Create a `.env` file:

```env
PORT=5000
MONGO_URI=your_mongo_uri
JWT_SECRET=your_jwt_secret
SENDER_EMAIL=your_email@gmail.com
EMAIL_PASSWORD=your_email_app_password
STRIPE_SECRET_KEY=your_stripe_secret
STRIPE_WEBHOOK_SECRET=your_webhook_secret
CURRENCY=USD
```

```bash
npm start
```

---

### 🖥️ Frontend Setup

```bash
cd client
npm install
npm start
```

---

## 💳 Stripe Payment Flow

1. User clicks **Pay Now**
2. Stripe session is created → redirects to Stripe Checkout
3. Stripe sends a webhook to backend
4. Backend verifies event & updates booking as paid
5. User is redirected to success/cancel page

---

## 📬 Email Notifications

After successful booking, user receives an email with:

* Booking ID
* Hotel Name and Address
* Price and Dates

---

## 🚀 Deployment

* Frontend: \[Vercel / Netlify]
* Backend: \[Render / Railway / Heroku]
* MongoDB: \[MongoDB Atlas]

---

## 🧪 Testing Stripe Webhook (Locally)

```bash
stripe listen --forward-to localhost:5000/api/stripe
```

---

## 🙌 Acknowledgements

* [Stripe](https://stripe.com/)
* [Nodemailer](https://nodemailer.com/)
* [MongoDB Atlas](https://www.mongodb.com/atlas)
* [React Hot Toast](https://react-hot-toast.com/)


