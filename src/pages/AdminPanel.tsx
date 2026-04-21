import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { collection, query, where, onSnapshot, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { ChevronDown, Trash2, CheckCircle, XCircle, Clock } from 'lucide-react';
import { ADMIN_EMAIL, normalizeEmail } from '../constants/admin';

interface Product {
  id: string;
  title: string;
  price: number;
  location: string;
  image: string;
  userId: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: any;
}

type StatusTab = 'pending' | 'approved' | 'rejected';

const AdminPanel: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<StatusTab>('pending');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [adminEmail, setAdminEmail] = useState<string>('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is admin
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (!user) {
        navigate('/login');
        return;
      }

      if (normalizeEmail(user.email) !== normalizeEmail(ADMIN_EMAIL)) {
        navigate('/');
        return;
      }

      setAdminEmail(user.email || '');
    });

    return () => unsubscribeAuth();
  }, [navigate]);

  useEffect(() => {
    // Real-time listener for products
    const q = query(collection(db, 'products'), where('status', '==', activeTab));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const productsData: Product[] = [];
      snapshot.forEach((doc) => {
        productsData.push({
          id: doc.id,
          ...doc.data(),
        } as Product);
      });
      setProducts(productsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [activeTab]);

  const handleApprove = async (productId: string) => {
    try {
      await updateDoc(doc(db, 'products', productId), {
        status: 'approved',
      });
    } catch (error) {
      console.error('Error approving product:', error);
      alert('Failed to approve product');
    }
  };

  const handleReject = async (productId: string) => {
    try {
      await updateDoc(doc(db, 'products', productId), {
        status: 'rejected',
      });
    } catch (error) {
      console.error('Error rejecting product:', error);
      alert('Failed to reject product');
    }
  };

  const handleDelete = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      await deleteDoc(doc(db, 'products', productId));
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Failed to delete product');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
              <p className="text-gray-600 mt-1">Manage product listings</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Logged in as:</p>
              <p className="text-sm font-medium text-gray-900">{adminEmail}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-gray-200">
          {[
            { id: 'pending', label: 'Pending', icon: Clock, color: 'text-yellow-600' },
            { id: 'approved', label: 'Approved', icon: CheckCircle, color: 'text-green-600' },
            { id: 'rejected', label: 'Rejected', icon: XCircle, color: 'text-red-600' },
          ].map(({ id, label, icon: Icon, color }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as StatusTab)}
              className={`flex items-center gap-2 px-6 py-3 font-medium border-b-2 transition-colors ${
                activeTab === id
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <Icon className={`w-5 h-5 ${color}`} />
              {label}
              <span className="ml-2 bg-gray-200 text-gray-700 text-xs font-bold px-2 py-1 rounded-full">
                {products.length}
              </span>
            </button>
          ))}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        )}

        {/* Empty State */}
        {!loading && products.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No {activeTab} products</p>
          </div>
        )}

        {/* Products Grid */}
        {!loading && products.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                {/* Product Image */}
                <div className="relative overflow-hidden bg-gray-200 h-48">
                  <img
                    src={product.image}
                    alt={product.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://via.placeholder.com/300x200?text=No+Image';
                    }}
                  />
                  <div className="absolute top-3 right-3 bg-white px-3 py-1 rounded-full text-sm font-semibold text-gray-900">
                    ₹{product.price}
                  </div>
                </div>

                {/* Product Info */}
                <div className="p-4">
                  <h3 className="font-bold text-gray-900 text-lg mb-1 truncate">{product.title}</h3>
                  <div className="flex items-center gap-2 text-gray-600 text-sm mb-3">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" />
                    </svg>
                    {product.location}
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-2">
                    {activeTab === 'pending' && (
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => handleApprove(product.id)}
                          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2"
                        >
                          <CheckCircle className="w-4 h-4" /> Approve
                        </button>
                        <button
                          onClick={() => handleReject(product.id)}
                          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2"
                        >
                          <XCircle className="w-4 h-4" /> Reject
                        </button>
                      </div>
                    )}
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="w-full bg-gray-200 hover:bg-gray-300 text-gray-900 px-4 py-2 rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" /> Delete
                    </button>
                  </div>

                  {/* Expandable Details */}
                  <button
                    onClick={() => setExpandedId(expandedId === product.id ? null : product.id)}
                    className="w-full mt-3 flex items-center justify-center gap-2 text-indigo-600 text-sm font-medium hover:text-indigo-700"
                  >
                    <ChevronDown
                      className={`w-4 h-4 transition-transform ${
                        expandedId === product.id ? 'rotate-180' : ''
                      }`}
                    />
                    Details
                  </button>

                  {expandedId === product.id && (
                    <div className="mt-3 pt-3 border-t border-gray-200 space-y-2 text-sm text-gray-600">
                      <p>
                        <strong>Product ID:</strong> {product.id.substring(0, 8)}...
                      </p>
                      <p>
                        <strong>Seller ID:</strong> {product.userId.substring(0, 8)}...
                      </p>
                      <p>
                        <strong>Created:</strong>{' '}
                        {product.createdAt?.toDate?.()?.toLocaleDateString?.() || 'N/A'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
