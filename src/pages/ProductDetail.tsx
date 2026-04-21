import React, { useEffect, useState } from 'react';
import { useParams, Link, useLocation, useNavigate } from 'react-router-dom';
import { MapPin, MessageCircle, ArrowLeft, ShieldCheck, Share2, Heart } from 'lucide-react';
import { createPaytmBooking, fetchPaytmBookingStatus, fetchProduct } from '../api';
import { hasAcceptedCurrentPolicy } from '../constants/policy';
import { getBookingBreakdown } from '../constants/payment';

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentMessage, setPaymentMessage] = useState('');
  const [paymentError, setPaymentError] = useState('');

  useEffect(() => {
    const getProduct = async () => {
      try {
        if (id) {
          const { data } = await fetchProduct(id);
          setProduct(data);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    getProduct();
  }, [id]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Item not found</h2>
        <Link to="/listings" className="text-indigo-600 font-bold hover:underline">Back to marketplace</Link>
      </div>
    );
  }

  const whatsappUrl = `https://wa.me/${product.seller?.phone}?text=Hi ${product.seller?.name}, I'm interested in your ${product.title} listed on LoopIt.`;
  const hasAcceptedPolicy = hasAcceptedCurrentPolicy();
  const bookingBreakdown = getBookingBreakdown(Number(product.price || 0));

  const loadPaytmScript = (paytmHost: string, mid: string) =>
    new Promise<void>((resolve, reject) => {
      const scriptId = `paytm-checkout-${mid}`;
      const existingScript = document.getElementById(scriptId) as HTMLScriptElement | null;

      if (existingScript) {
        if (window.Paytm?.CheckoutJS) {
          resolve();
          return;
        }

        existingScript.addEventListener('load', () => resolve(), { once: true });
        existingScript.addEventListener('error', () => reject(new Error('Unable to load Paytm checkout script')), { once: true });
        return;
      }

      const script = document.createElement('script');
      script.id = scriptId;
      script.type = 'application/javascript';
      script.src = `${paytmHost}/merchantpgpui/checkoutjs/merchants/${mid}.js`;
      script.crossOrigin = 'anonymous';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Unable to load Paytm checkout script'));
      document.body.appendChild(script);
    });

  const handleContactSeller = () => {
    if (hasAcceptedPolicy) {
      window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
      return;
    }

    const params = new URLSearchParams({
      returnTo: location.pathname,
      target: whatsappUrl,
    });

    navigate(`/policy?${params.toString()}`);
  };

  const handlePaytmBooking = async () => {
    const storedUser = localStorage.getItem('user');
    const currentUser = storedUser ? JSON.parse(storedUser) : null;

    if (!currentUser) {
      navigate('/login');
      return;
    }

    if (!hasAcceptedPolicy) {
      const params = new URLSearchParams({
        returnTo: location.pathname,
      });
      navigate(`/policy?${params.toString()}`);
      return;
    }

    setPaymentLoading(true);
    setPaymentError('');
    setPaymentMessage('');

    try {
      const bookingResponse = await createPaytmBooking({
        productId: product.id,
        productTitle: product.title,
        productPrice: Number(product.price),
        customerId: currentUser.uid,
        customerEmail: currentUser.email,
        customerName: currentUser.name || currentUser.email?.split('@')[0] || 'LoopIt Buyer',
      });

      const { orderId, txnToken, amount, paytmMid, paytmHost } = bookingResponse.data;
      await loadPaytmScript(paytmHost, paytmMid);

      if (!window.Paytm?.CheckoutJS) {
        throw new Error('Paytm Checkout is unavailable right now.');
      }

      const verifyPayment = async () => {
        const statusResponse = await fetchPaytmBookingStatus(orderId);
        if (statusResponse.data.isSuccess) {
          setPaymentMessage('Booking payment successful. Seller contact is now unlocked for this item.');
        } else {
          setPaymentError('Payment was not completed. Please try again.');
        }
        setPaymentLoading(false);
      };

      window.Paytm.CheckoutJS.onLoad(() => {
        window.Paytm?.CheckoutJS?.init({
          root: '',
          flow: 'DEFAULT',
          data: {
            orderId,
            token: txnToken,
            tokenType: 'TXN_TOKEN',
            amount,
          },
          merchant: {
            redirect: false,
          },
          handler: {
            notifyMerchant: (eventName: string) => {
              if (eventName === 'APP_CLOSED') {
                setPaymentLoading(false);
                setPaymentError('Payment window was closed before completion.');
              }
            },
            transactionStatus: async () => {
              await verifyPayment();
            },
          },
        })
          .then(() => {
            window.Paytm?.CheckoutJS?.invoke();
          })
          .catch((error: unknown) => {
            setPaymentLoading(false);
            setPaymentError(error instanceof Error ? error.message : 'Unable to open Paytm checkout');
          });
      });
    } catch (error) {
      setPaymentLoading(false);
      setPaymentError(error instanceof Error ? error.message : 'Unable to start Paytm payment');
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link to="/listings" className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-indigo-600 transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" /> Back to listings
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left: Image */}
          <div className="space-y-6">
            <div className="relative aspect-square rounded-3xl overflow-hidden border border-gray-100 shadow-xl">
              <img 
                src={product.image} 
                alt={product.title}
                className="w-full h-full object-cover"
                crossOrigin="anonymous"
              />
              <button className="absolute top-6 right-6 p-3 bg-white/90 backdrop-blur-md rounded-full text-gray-600 hover:text-red-500 shadow-lg transition-all">
                <Heart className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Right: Info */}
          <div className="flex flex-col">
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-xs font-bold rounded-full uppercase tracking-wider">
                  {product.category}
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 leading-tight mb-4">
                {product.title}
              </h1>
              <div className="flex items-center gap-4 mb-6">
                <span className="text-4xl font-black text-indigo-600">₹{product.price}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600 font-medium bg-gray-50 px-4 py-2.5 rounded-2xl inline-flex">
                <MapPin className="w-4 h-4 text-indigo-600" />
                {product.location}
              </div>
            </div>

            <div className="space-y-8">
              {/* WhatsApp Contact Action */}
              <button
                onClick={handleContactSeller}
                className="flex items-center justify-center gap-3 bg-green-500 text-white py-4 rounded-2xl font-bold text-lg hover:bg-green-600 shadow-xl shadow-green-100 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <MessageCircle className="w-6 h-6" />
                {hasAcceptedPolicy ? 'Contact via WhatsApp' : 'Review Policy to Contact Seller'}
              </button>
              <p className="text-sm text-gray-500 -mt-4">
                Users must agree to the LoopIt booking and usage policy before continuing to the seller.
              </p>

              <div className="bg-indigo-50 border border-indigo-100 rounded-3xl p-6 space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Book With Paytm</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Reserve this item by paying the booking amount online. The fixed LoopIt fee is non-refundable.
                    </p>
                  </div>
                  <span className="text-2xl font-black text-indigo-600">₹{bookingBreakdown.totalBookingAmount}</span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm text-gray-700">
                  <div className="bg-white rounded-2xl p-4">
                    <p className="text-gray-500">Refundable</p>
                    <p className="font-bold text-gray-900 mt-1">₹{bookingBreakdown.refundableAmount}</p>
                  </div>
                  <div className="bg-white rounded-2xl p-4">
                    <p className="text-gray-500">LoopIt Fee</p>
                    <p className="font-bold text-gray-900 mt-1">₹{bookingBreakdown.serviceFee}</p>
                  </div>
                </div>
                <button
                  onClick={handlePaytmBooking}
                  disabled={paymentLoading}
                  className="w-full flex items-center justify-center gap-3 bg-[#00baf2] text-white py-4 rounded-2xl font-bold text-lg hover:bg-[#009fd1] transition-all disabled:opacity-60"
                >
                  {paymentLoading ? 'Opening Paytm...' : `Pay ₹${bookingBreakdown.totalBookingAmount} with Paytm`}
                </button>
                {paymentMessage && (
                  <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
                    <p className="text-green-700 font-medium">{paymentMessage}</p>
                  </div>
                )}
                {paymentError && (
                  <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                    <p className="text-red-700 font-medium">{paymentError}</p>
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="border-t border-gray-100 pt-8">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Description</h3>
                <p className="text-gray-600 leading-relaxed text-lg">
                  {product.description}
                </p>
              </div>

              {/* Seller Info */}
              <div className="bg-gray-50 p-8 rounded-3xl border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-bold text-gray-900">Seller Profile</h3>
                  <div className="flex items-center gap-1 text-yellow-500">
                    <ShieldCheck className="w-4 h-4 fill-yellow-500" />
                    <span className="text-sm font-bold">Student Verified</span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600 font-black text-2xl">
                    {product.seller?.name?.[0] || 'S'}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-lg">{product.seller?.name || 'Student'}</h4>
                    <p className="text-sm text-gray-500 font-medium mt-1">Local Student Seller</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <button className="flex items-center gap-2 text-gray-400 hover:text-indigo-600 text-sm font-semibold transition-colors">
                  <Share2 className="w-4 h-4" /> Share
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
