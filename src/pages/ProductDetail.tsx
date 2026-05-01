import React, { useEffect, useState } from 'react';
import { useParams, Link, useLocation, useNavigate } from 'react-router-dom';
import { MapPin, MessageCircle, ArrowLeft, ShieldCheck, Share2, Heart, Flag, Sparkles } from 'lucide-react';
import { createPaytmBooking, fetchPaytmBookingStatus, fetchProduct, fetchProducts } from '../api';
import { hasAcceptedCurrentPolicy } from '../constants/policy';
import { getBookingBreakdown } from '../constants/payment';
import ProductCard from '../components/ProductCard';
import type { Product, StoredUser } from '../types/app';

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentMessage, setPaymentMessage] = useState('');
  const [paymentError, setPaymentError] = useState('');
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);

  useEffect(() => {
    const getProduct = async () => {
      try {
        if (id) {
          const { data } = await fetchProduct(id);
          setProduct(data);
          const relatedResponse = await fetchProducts();
          setRelatedProducts(relatedResponse.data.filter((item) => item.id !== id && item.category === data.category).slice(0, 4));
        }
      } catch (error: unknown) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    getProduct();
  }, [id]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950"><div className="h-12 w-12 animate-spin rounded-full border-b-2 border-emerald-500" /></div>;
  }

  if (!product) {
    return <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950"><h2 className="text-2xl font-black text-slate-900 dark:text-white mb-4">Item not found</h2><Link to="/listings" className="text-emerald-600 font-bold hover:underline">Back to marketplace</Link></div>;
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
    const currentUser = storedUser ? (JSON.parse(storedUser) as StoredUser) : null;

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
    <div className="min-h-screen bg-slate-50 text-slate-950 dark:bg-slate-950 dark:text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link to="/listings" className="inline-flex items-center gap-2 text-sm font-black text-slate-500 hover:text-emerald-600 transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" /> Back to listings
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-6">
            <div className="relative aspect-square rounded-[2.5rem] overflow-hidden border border-white bg-white shadow-2xl shadow-emerald-950/10 dark:border-slate-800 dark:bg-slate-900">
              <img 
                src={product.image || '/item-placeholder.svg'} 
                alt={product.title}
                className="w-full h-full object-cover"
                crossOrigin="anonymous"
                onError={(event) => ((event.target as HTMLImageElement).src = '/item-placeholder.svg')}
              />
              <button className="absolute top-6 right-6 p-3 bg-white/90 backdrop-blur-md rounded-full text-slate-600 hover:text-red-500 shadow-lg transition-all">
                <Heart className="w-5 h-5" />
              </button>
              <div className="absolute bottom-6 left-6 rounded-full bg-emerald-500 px-4 py-2 text-sm font-black text-white shadow-lg">
                {product.condition || 'Good'} condition
              </div>
            </div>
            <div className="grid grid-cols-4 gap-3">
              {[product.image, product.image, product.image, product.image].map((image, index) => (
                <div key={index} className="aspect-square overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                  <img src={image || '/item-placeholder.svg'} alt="" className="h-full w-full object-cover" onError={(event) => ((event.target as HTMLImageElement).src = '/item-placeholder.svg')} />
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col">
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-black rounded-full uppercase tracking-wider dark:bg-emerald-400/10 dark:text-emerald-300">
                  {product.category}
                </span>
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-white text-slate-600 text-xs font-black rounded-full uppercase tracking-wider dark:bg-slate-900 dark:text-slate-300">
                  <Sparkles className="h-3 w-3 text-emerald-500" /> Available
                </span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight mb-4">
                {product.title}
              </h1>
              <div className="flex items-center gap-4 mb-6">
                <span className="text-4xl font-black text-emerald-600">₹{product.price}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600 font-bold bg-white px-4 py-2.5 rounded-2xl inline-flex dark:bg-slate-900 dark:text-slate-300">
                <MapPin className="w-4 h-4 text-emerald-600" />
                {product.location}
              </div>
            </div>

            <div className="space-y-8">
              {/* WhatsApp Contact Action */}
              <button
                onClick={handleContactSeller}
                className="flex items-center justify-center gap-3 bg-emerald-500 text-white py-4 rounded-2xl font-black text-lg hover:bg-emerald-600 shadow-xl shadow-emerald-100 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <MessageCircle className="w-6 h-6" />
                {hasAcceptedPolicy ? 'Contact via WhatsApp' : 'Review Policy to Contact Seller'}
              </button>
              <p className="text-sm text-gray-500 -mt-4">
                Users must agree to the LoopIt booking and usage policy before continuing to the seller.
              </p>

              <div className="bg-white border border-emerald-100 rounded-3xl p-6 space-y-4 shadow-xl shadow-emerald-950/5 dark:bg-slate-900 dark:border-slate-800">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Book With Paytm</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Reserve this item by paying the booking amount online. The fixed LoopIt fee is non-refundable.
                    </p>
                  </div>
                  <span className="text-2xl font-black text-emerald-600">₹{bookingBreakdown.totalBookingAmount}</span>
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
              <div className="border-t border-slate-200 pt-8 dark:border-slate-800">
                <h3 className="text-lg font-black mb-4">Description</h3>
                <p className="text-slate-600 leading-relaxed text-lg dark:text-slate-300">
                  {product.description}
                </p>
              </div>

              <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl shadow-emerald-950/5 dark:bg-slate-900 dark:border-slate-800">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-black">Seller Profile</h3>
                  <div className="flex items-center gap-1 text-yellow-500">
                    <ShieldCheck className="w-4 h-4 fill-yellow-500" />
                    <span className="text-sm font-bold">Student Verified</span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600 font-black text-2xl">
                    {product.seller?.name?.[0] || 'S'}
                  </div>
                  <div>
                    <h4 className="font-bold text-lg">{product.seller?.name || 'Student'}</h4>
                    <p className="text-sm text-slate-500 font-medium mt-1">Local Student Seller</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <button className="flex items-center gap-2 text-slate-400 hover:text-emerald-600 text-sm font-semibold transition-colors">
                  <Share2 className="w-4 h-4" /> Share
                </button>
                <button className="flex items-center gap-2 text-slate-400 hover:text-red-500 text-sm font-semibold transition-colors">
                  <Flag className="w-4 h-4" /> Report product
                </button>
              </div>
            </div>
          </div>
        </div>

        {relatedProducts.length > 0 && (
          <section className="mt-16">
            <h2 className="text-3xl font-black tracking-tight">Related products</h2>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {relatedProducts.map((item) => <ProductCard key={item.id} product={item} />)}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;
