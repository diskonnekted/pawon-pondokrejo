import type { Image, PortableTextBlock } from 'sanity';

export interface Vendor {
  _id: string;
  name: string;
  slug: string;
  phone: string;
  address?: string;
  logo?: Image;
  description?: string;
  isVerified?: boolean;
  isOpen?: boolean;
  closingMessage?: string;
  pin?: string;
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  image?: Image;
}

export interface Product {
  _id: string;
  name: string;
  slug: string;
  price: number;
  stock: number;
  image: Image;
  description?: string;
  vendor: Vendor;
  categories?: Category[];
  isBestSeller?: boolean;
  isPromo?: boolean;
  promoDiscount?: number;
}

export interface Banner {
  _id: string;
  title: string;
  imageDesktop: Image;
  imageMobile: Image;
  link?: string;
}

export type PriceType = 'fixed' | 'starting_from' | 'hourly' | 'negotiable';

export interface Service {
  _id: string;
  name: string;
  slug: string;
  price: number;
  priceType: PriceType;
  image: Image;
  description?: string;
  vendor: Vendor;
  categories?: Category[];
  isBestSeller?: boolean;
  isPromo?: boolean;
  promoDiscount?: number;
}

export interface OrderFormData {
  name: string;
  phone: string;
  address: string;
}

export interface Article {
  _id: string;
  title: string;
  slug: string;
  publishedAt: string;
  category: 'pelatihan' | 'pengumuman' | 'panduan';
  image: Image;
  excerpt?: string;
  content: PortableTextBlock[];
}

export interface IncubatorService {
  _id: string;
  title: string;
  slug: string;
  description: string;
  iconName: string;
  order: number;
}
