import type { Timestamp } from 'firebase/firestore';

export type ProductStatus = 'pending' | 'approved' | 'rejected';

export interface SellerInfo {
  name?: string;
  phone?: string;
  email?: string | null;
}

export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  location: string;
  locationLat?: number | null;
  locationLng?: number | null;
  image: string;
  condition?: string;
  sold?: boolean;
  featured?: boolean;
  userId: string;
  status: ProductStatus;
  seller?: SellerInfo;
  createdAt?: Timestamp | null;
  updatedAt?: Timestamp | null;
}

export interface StoredUser {
  uid: string;
  email: string | null;
  token: string;
  name?: string;
}

export interface AuthFormData {
  email: string;
  password: string;
  name?: string;
}

export interface ProductDraft {
  title: string;
  description: string;
  price: number;
  category: string;
  location: string;
  locationLat?: number | null;
  locationLng?: number | null;
  image: string;
  condition?: string;
  seller?: SellerInfo;
}
