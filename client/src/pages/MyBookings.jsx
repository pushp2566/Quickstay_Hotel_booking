import React, { useEffect, useState } from 'react'
import Title from '../components/Title'
import { assets } from '../assets/assets'
import { useAppContext } from '../context/AppContext'
import toast from 'react-hot-toast'

const MyBookings = () => {
    const { axios, getToken, user, currency } = useAppContext();
    const [bookings, setBookings] = useState([]);
    const [loadingPayment, setLoadingPayment] = useState(null);

    const fetchUserBookings = React.useCallback(async () => {
        try {
            const { data } = await axios.get('/api/bookings/user', { headers: { Authorization: `Bearer ${await getToken()}` } })
            if (data.success) {
                setBookings(data.bookings)
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }, [axios, getToken]);

    // Handle Razorpay Payment Modal
    const handleRazorpayPayment = async (bookingId) => {
        try {
            setLoadingPayment(bookingId);
            const token = await getToken();
            const { data } = await axios.post('/api/razorpay/create-order', { bookingId }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!data.success) {
                toast.error(data.message || "Failed to initiate payment");
                return;
            }

            const options = {
                key: data.keyId || import.meta.env.VITE_RAZORPAY_KEY_ID,
                amount: data.amount,
                currency: data.currency || "INR",
                name: "Quickstay Hotel Booking",
                description: `Payment for ${data.hotelName}`,
                order_id: data.orderId,
                handler: async function (response) {
                    try {
                        const freshToken = await getToken();
                        const verifyRes = await axios.post('/api/razorpay/verify-payment', {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            bookingId,
                        }, {
                            headers: { Authorization: `Bearer ${freshToken}` }
                        });

                        if (verifyRes.data.success) {
                            toast.success("Payment successful & verified!");
                            fetchUserBookings();
                        } else {
                            toast.error(verifyRes.data.message || "Payment verification failed");
                        }
                    } catch (verifyErr) {
                        toast.error(verifyErr.message);
                    }
                },
                prefill: {
                    name: user?.fullName || user?.firstName || "",
                    email: user?.primaryEmailAddress?.emailAddress || "",
                },
                theme: {
                    color: "#4F46E5",
                },
            };

            if (window.Razorpay) {
                const rzp = new window.Razorpay(options);
                rzp.on('payment.failed', function (response) {
                    toast.error(response.error.description || "Payment failed");
                });
                rzp.open();
            } else {
                toast.error("Razorpay SDK failed to load. Please refresh the page.");
            }
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoadingPayment(null);
        }
    };

    // Handle Refund / Booking Cancellation
    const handleCancelBooking = async (bookingId) => {
        if (!window.confirm("Are you sure you want to cancel this booking? If paid, a refund will be processed.")) {
            return;
        }
        try {
            const token = await getToken();
            const { data } = await axios.post('/api/razorpay/refund', { bookingId }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (data.success) {
                toast.success(data.message);
                fetchUserBookings();
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    useEffect(() => {
        if (user) {
            fetchUserBookings();
        }
    }, [user, fetchUserBookings]);

    return (
        <div className='py-28 md:pb-35 md:pt-32 px-4 md:px-16 lg:px-24 xl:px-32'>
            <Title title='My Bookings' subTitle='Easily manage your past, current, and upcoming hotel reservations in one place. Plan your trips seamlessly with just a few clicks' align='left' />
            <div className="max-w-6xl mt-8 w-full text-gray-800">
                <div className="hidden md:grid md:grid-cols-[3fr_2fr_1fr] w-full border-b border-gray-300 font-medium text-base py-3">
                    <div className="w-1/3">Hotels</div>
                    <div className="w-1/3">Date & Timings</div>
                    <div className="w-1/3">Payment & Status</div>
                </div>

                {bookings.length === 0 ? (
                    <p className="text-gray-500 py-10 text-center">No bookings found.</p>
                ) : (
                    bookings.map((booking) => (
                        <div key={booking._id} className="grid grid-cols-1 md:grid-cols-[3fr_2fr_1fr] w-full border-b border-gray-300 py-6 first:border-t">
                            <div className="flex flex-col md:flex-row">
                                <img className="min-md:w-44 rounded shadow object-cover" src={booking.room?.images?.[0]} alt="hotel-img" />
                                <div className="flex flex-col gap-1.5 max-md:mt-3 min-md:ml-4">
                                    <p className="font-playfair text-2xl">
                                        {booking.hotel?.name || 'Hotel'}
                                        <span className="font-inter text-sm"> ({booking.room?.roomType || 'Room'})</span>
                                    </p>
                                    <div className="flex items-center gap-1 text-sm text-gray-500">
                                        <img src={assets.locationIcon} alt="location-icon" />
                                        <span>{booking.hotel?.address}</span>
                                    </div>
                                    <div className="flex items-center gap-1 text-sm text-gray-500">
                                        <img src={assets.guestsIcon} alt="guests-icon" />
                                        <span>Guests: {booking.guests}</span>
                                    </div>
                                    <p className="text-base">Total: {currency}{booking.totalPrice}</p>
                                </div>
                            </div>

                            <div className="flex flex-row md:items-center md:gap-12 mt-3 gap-8">
                                <div>
                                    <p>Check-In:</p>
                                    <p className="text-gray-500 text-sm">{new Date(booking.checkInDate).toDateString()}</p>
                                </div>
                                <div>
                                    <p>Check-Out:</p>
                                    <p className="text-gray-500 text-sm">{new Date(booking.checkOutDate).toDateString()}</p>
                                </div>
                            </div>

                            <div className="flex flex-col items-start justify-center pt-3 gap-2">
                                <div className="flex items-center gap-2">
                                    <div className={`h-3 w-3 rounded-full ${booking.status === "cancelled" ? "bg-gray-400" : booking.isPaid ? "bg-green-500" : "bg-red-500"}`}></div>
                                    <p className={`text-sm font-medium ${booking.status === "cancelled" ? "text-gray-500" : booking.isPaid ? "text-green-600" : "text-red-500"}`}>
                                        {booking.status === "cancelled" ? "Cancelled" : booking.isPaid ? "Paid (Razorpay)" : "Unpaid"}
                                    </p>
                                </div>

                                {booking.status !== "cancelled" && !booking.isPaid && (
                                    <button
                                        disabled={loadingPayment === booking._id}
                                        onClick={() => handleRazorpayPayment(booking._id)}
                                        className="px-4 py-1.5 mt-2 text-xs bg-indigo-600 text-white font-medium rounded-full hover:bg-indigo-700 transition-all cursor-pointer shadow-sm disabled:opacity-50"
                                    >
                                        {loadingPayment === booking._id ? "Processing..." : "Pay Now (Razorpay)"}
                                    </button>
                                )}

                                {booking.status !== "cancelled" && (
                                    <button
                                        onClick={() => handleCancelBooking(booking._id)}
                                        className="px-3 py-1 text-xs text-red-600 border border-red-300 rounded-full hover:bg-red-50 transition-all cursor-pointer mt-1"
                                    >
                                        {booking.isPaid ? "Cancel & Refund" : "Cancel Booking"}
                                    </button>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}

export default MyBookings