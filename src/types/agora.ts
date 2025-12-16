export type UserRole = 'ADMIN' | 'PRODUCER' | 'CUSTOMER';
export type ProducerStatus = 'OFFLINE' | 'ONLINE' | 'WORKING';
export type JobStatus = 'OPEN' | 'TAKEN' | 'COMPLETED';
export type ProducerApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  credits: number;
  createdAt: Date;
}

export interface Marketplace {
  id: string;
  name: string;
  slug: string;
  city: string;
  createdAt: Date;
  ownerId: string;
}

export interface MarketplaceUser {
  userId: string;
  marketplaceId: string;
  role: UserRole;
  status?: ProducerStatus;
  approvalStatus?: ProducerApprovalStatus;
  rating?: number;
  completedJobs?: number;
  jobsCreated?: number;
  description?: string;
  earnings?: number;
}

export interface Job {
  id: string;
  marketplaceId: string;
  customerId: string;
  producerId?: string;
  title: string;
  description: string;
  address: string;
  preferredTime: string;
  price: number;
  isPaid: boolean;
  status: JobStatus;
  createdAt: Date;
  lat?: number;
  lng?: number;
}

export interface FavoriteMarketplace {
  userId: string;
  marketplaceId: string;
}
