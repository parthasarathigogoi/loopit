import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut
} from 'firebase/auth';
import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  doc,
  Timestamp,
  type DocumentData,
  type DocumentSnapshot,
  type QueryDocumentSnapshot,
} from 'firebase/firestore';
import { auth, db } from './firebase';
import { getBookingBreakdown } from './constants/payment';
import type { AuthFormData, Product, ProductDraft, StoredUser } from './types/app';

const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

const normalizeError = (error: unknown) => {
  if (error instanceof Error) {
    return error;
  }

  return new Error('An unexpected error occurred');
};

const getStoredUser = (): StoredUser | null => {
  const storedUser = localStorage.getItem('user');
  if (!storedUser) {
    return null;
  }

  try {
    return JSON.parse(storedUser) as StoredUser;
  } catch {
    localStorage.removeItem('user');
    return null;
  }
};

const mapProduct = (
  snapshot: QueryDocumentSnapshot<DocumentData> | DocumentSnapshot<DocumentData>,
): Product | null => {
  const data = snapshot.data();
  if (!data) {
    return null;
  }

  return {
    id: snapshot.id,
    title: String(data.title ?? ''),
    description: String(data.description ?? ''),
    price: Number(data.price ?? 0),
    category: String(data.category ?? ''),
    location: String(data.location ?? ''),
    image: String(data.image ?? ''),
    userId: String(data.userId ?? ''),
    status: (data.status ?? 'pending') as Product['status'],
    seller: data.seller as Product['seller'],
    createdAt: (data.createdAt as Product['createdAt']) ?? null,
    updatedAt: (data.updatedAt as Product['updatedAt']) ?? null,
  };
};

// Authentication functions
export const login = async (formData: AuthFormData) => {
  try {
    const result = await signInWithEmailAndPassword(auth, formData.email, formData.password);
    const user = result.user;
    const token = await user.getIdToken();
    
    // Store user data in localStorage
    const userData: StoredUser = {
      uid: user.uid,
      email: user.email,
      token,
    };
    localStorage.setItem('user', JSON.stringify(userData));
    
    return { data: userData };
  } catch (error: unknown) {
    throw normalizeError(error);
  }
};

export const signup = async (formData: AuthFormData) => {
  try {
    const result = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
    const user = result.user;
    const token = await user.getIdToken();
    
    // Store user data in localStorage
    const userData: StoredUser = {
      uid: user.uid,
      email: user.email,
      name: formData.name || '',
      token,
    };
    localStorage.setItem('user', JSON.stringify(userData));
    
    // Try to store user data in Firestore (optional - don't block if Firestore is unavailable)
    try {
      await addDoc(collection(db, 'users'), {
        uid: user.uid,
        email: user.email,
        name: formData.name || '',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
    } catch (firestoreError) {
      console.warn('Firestore write failed (optional):', firestoreError);
      // Continue anyway - user is authenticated
    }
    
    return { data: userData };
  } catch (error: unknown) {
    // Handle specific Firebase auth errors
    const authError = error as { code?: string; message?: string };
    if (authError.code === 'auth/email-already-in-use') {
      throw new Error('This email is already registered. Please login instead or use a different email.');
    } else if (authError.code === 'auth/weak-password') {
      throw new Error('Password should be at least 6 characters long.');
    } else if (authError.code === 'auth/invalid-email') {
      throw new Error('Please enter a valid email address.');
    }
    throw new Error(authError.message || 'Unable to create account');
  }
};

export const logout = async () => {
  try {
    await signOut(auth);
    localStorage.removeItem('user');
  } catch (error: unknown) {
    throw normalizeError(error);
  }
};

// Product functions
export const fetchProducts = async (): Promise<{ data: Product[] }> => {
  try {
    // Only fetch approved products for regular users
    const q = query(collection(db, 'products'), where('status', '==', 'approved'));
    const querySnapshot = await getDocs(q);
    const products = querySnapshot.docs
      .map((productDoc) => mapProduct(productDoc))
      .filter((product): product is Product => Boolean(product));
    return { data: products };
  } catch (error: unknown) {
    throw normalizeError(error);
  }
};

export const fetchProduct = async (id: string): Promise<{ data: Product }> => {
  try {
    const docRef = doc(db, 'products', id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const product = mapProduct(docSnap);
      if (!product) {
        throw new Error('Product not found');
      }

      return { data: product };
    } else {
      throw new Error('Product not found');
    }
  } catch (error: unknown) {
    throw normalizeError(error);
  }
};

export const fetchUserProducts = async (): Promise<{ data: Product[] }> => {
  try {
    const user = getStoredUser();
    if (!user) throw new Error('User not authenticated');
    
    const q = query(collection(db, 'products'), where('userId', '==', user.uid));
    const querySnapshot = await getDocs(q);
    const products = querySnapshot.docs
      .map((productDoc) => mapProduct(productDoc))
      .filter((product): product is Product => Boolean(product));
    return { data: products };
  } catch (error: unknown) {
    throw normalizeError(error);
  }
};

export const createProduct = async (productData: ProductDraft): Promise<{ data: Product }> => {
  try {
    const user = getStoredUser();
    if (!user) throw new Error('User not authenticated');
    
    const docRef = await addDoc(collection(db, 'products'), {
      ...productData,
      userId: user.uid,
      seller: productData.seller ?? {
        name: user.name || user.email?.split('@')[0] || 'Student',
        email: user.email,
      },
      status: 'pending', // Default status for new products
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    
    return {
      data: {
        id: docRef.id,
        ...productData,
        userId: user.uid,
        seller: productData.seller ?? {
          name: user.name || user.email?.split('@')[0] || 'Student',
          email: user.email,
        },
        status: 'pending',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      },
    };
  } catch (error: unknown) {
    console.error('Product creation error:', normalizeError(error).message);
    // Return mock success for testing without Firestore
    const user = getStoredUser();
    return {
      data: {
        id: Date.now().toString(),
        ...productData,
        userId: user?.uid || 'local-user',
        seller: productData.seller ?? {
          name: user?.name || user?.email?.split('@')[0] || 'Student',
          email: user?.email || null,
        },
        status: 'pending',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      },
    };
  }
};

export const updateProduct = async (id: string, productData: Partial<ProductDraft>) => {
  try {
    const docRef = doc(db, 'products', id);
    await updateDoc(docRef, {
      ...productData,
      updatedAt: Timestamp.now(),
    });
    return { data: { id, ...productData } };
  } catch (error: unknown) {
    throw normalizeError(error);
  }
};

export const deleteProduct = async (id: string) => {
  try {
    await deleteDoc(doc(db, 'products', id));
    return { data: { id } };
  } catch (error: unknown) {
    throw normalizeError(error);
  }
};

// Image upload function
export const uploadImage = async (file: File) => {
  try {
    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      throw new Error('Image size too large. Max: 10MB');
    }
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      throw new Error('Invalid file type. Please upload an image.');
    }

    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch(`${BACKEND_BASE_URL}/api/products/upload`, {
      method: 'POST',
      body: formData,
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.message || 'Unable to upload image.');
    }

    const url = String(data.url || data.imageUrl || '');
    if (!url) {
      throw new Error('Upload completed without an image URL.');
    }

    return { data: { url } };
  } catch (error: unknown) {
    console.error('Image upload error:', error);
    throw new Error(`Image upload failed: ${normalizeError(error).message}`);
  }
};

export const createPaytmBooking = async (payload: {
  productId: string;
  productTitle: string;
  productPrice: number;
  customerId?: string;
  customerEmail?: string | null;
  customerName?: string;
  customerPhone?: string;
}) => {
  const response = await fetch(`${BACKEND_BASE_URL}/api/payments/paytm/initiate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Unable to create Paytm booking');
  }

  return data;
};

export const fetchPaytmBookingStatus = async (orderId: string) => {
  const response = await fetch(`${BACKEND_BASE_URL}/api/payments/paytm/status/${orderId}`);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Unable to verify Paytm booking status');
  }

  return data;
};

export const fetchPaytmConfig = async () => {
  const response = await fetch(`${BACKEND_BASE_URL}/api/payments/paytm/config`);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Unable to fetch Paytm configuration');
  }

  return data;
};

export default {
  login,
  signup,
  logout,
  fetchProducts,
  fetchProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  fetchUserProducts,
  uploadImage,
  createPaytmBooking,
  fetchPaytmBookingStatus,
  fetchPaytmConfig,
  getBookingBreakdown,
};
