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
  Timestamp
} from 'firebase/firestore';
import {
  ref,
  uploadBytes,
  getDownloadURL
} from 'firebase/storage';
import { auth, db, storage } from './firebase';

// Authentication functions
export const login = async (formData: any) => {
  try {
    const result = await signInWithEmailAndPassword(auth, formData.email, formData.password);
    const user = result.user;
    const token = await user.getIdToken();
    
    // Store user data in localStorage
    const userData = {
      uid: user.uid,
      email: user.email,
      token: token
    };
    localStorage.setItem('user', JSON.stringify(userData));
    
    return { data: userData };
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const signup = async (formData: any) => {
  try {
    const result = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
    const user = result.user;
    const token = await user.getIdToken();
    
    // Store user data in Firestore
    await addDoc(collection(db, 'users'), {
      uid: user.uid,
      email: user.email,
      name: formData.name || '',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    
    // Store user data in localStorage
    const userData = {
      uid: user.uid,
      email: user.email,
      token: token
    };
    localStorage.setItem('user', JSON.stringify(userData));
    
    return { data: userData };
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const logout = async () => {
  try {
    await signOut(auth);
    localStorage.removeItem('user');
  } catch (error: any) {
    throw new Error(error.message);
  }
};

// Product functions
export const fetchProducts = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'products'));
    const products = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    return { data: products };
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const fetchProduct = async (id: string) => {
  try {
    const docRef = doc(db, 'products', id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { data: { id: docSnap.id, ...docSnap.data() } };
    } else {
      throw new Error('Product not found');
    }
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const fetchUserProducts = async () => {
  try {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    if (!user) throw new Error('User not authenticated');
    
    const q = query(collection(db, 'products'), where('userId', '==', user.uid));
    const querySnapshot = await getDocs(q);
    const products = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    return { data: products };
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const createProduct = async (productData: any) => {
  try {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    if (!user) throw new Error('User not authenticated');
    
    const docRef = await addDoc(collection(db, 'products'), {
      ...productData,
      userId: user.uid,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    
    return { data: { id: docRef.id, ...productData } };
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const updateProduct = async (id: string, productData: any) => {
  try {
    const docRef = doc(db, 'products', id);
    await updateDoc(docRef, {
      ...productData,
      updatedAt: Timestamp.now()
    });
    return { data: { id, ...productData } };
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const deleteProduct = async (id: string) => {
  try {
    await deleteDoc(doc(db, 'products', id));
    return { data: { id } };
  } catch (error: any) {
    throw new Error(error.message);
  }
};

// Image upload function
export const uploadImage = async (file: File) => {
  try {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    if (!user) throw new Error('User not authenticated');
    
    const fileName = `${user.uid}/${Date.now()}-${file.name}`;
    const storageRef = ref(storage, `products/${fileName}`);
    
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);
    
    return { data: { url: downloadURL } };
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export default { login, signup, logout, fetchProducts, fetchProduct, createProduct, updateProduct, deleteProduct, fetchUserProducts, uploadImage };
