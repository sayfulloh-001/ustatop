export type UserRole = 'USER' | 'ADMIN';
export type MasterStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface User {
  id: string;
  phone: string;
  role: UserRole;
  firstName?: string | null;
  lastName?: string | null;
  age?: number | null;
  avatarUrl?: string | null;
  createdAt: string;
  updatedAt: string;
  masterProfile?: MasterProfile | null;
}

export interface MasterProfile {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  profession: string;
  experienceYears: number;
  age: number;
  phone: string;
  description: string;
  city: string;
  district?: string | null;
  profileImageUrl?: string | null;
  status: MasterStatus;
  rating: number;
  reviewCount: number;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    phone: string;
    avatarUrl?: string | null;
  };
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl?: string | null;
  isActive: boolean;
  stock: number;
  createdAt: string;
  updatedAt: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  [key: string]: any;
}

export interface DashboardStats {
  totalUsers: number;
  totalMasters: number;
  pendingMasters: number;
  approvedMasters: number;
  rejectedMasters: number;
  totalProducts: number;
}
