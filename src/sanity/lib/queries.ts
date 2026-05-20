import { defineQuery } from 'next-sanity'

export const PRODUCTS_QUERY = defineQuery(`
  *[_type == "product" && (!defined($search) || name match $search + "*")] | order(_createdAt desc) {
    _id,
    name,
    "slug": slug.current,
    price,
    stock,
    image,
    isBestSeller,
    isPromo,
    promoDiscount,
    "vendor": vendor->{
      name,
      "slug": slug.current,
      isVerified
    },
    "categories": categories[]->{
      name,
      "slug": slug.current
    }
  }
`)

export const BEST_SELLERS_QUERY = defineQuery(`
  *[_type == "product" && isBestSeller == true] | order(_createdAt desc) [0...8] {
    _id,
    name,
    "slug": slug.current,
    price,
    stock,
    image,
    isBestSeller,
    isPromo,
    promoDiscount,
    "vendor": vendor->{
      name,
      "slug": slug.current,
      isVerified
    }
  }
`)

export const PROMO_PRODUCTS_QUERY = defineQuery(`
  *[_type == "product" && isPromo == true] | order(_createdAt desc) [0...8] {
    _id,
    name,
    "slug": slug.current,
    price,
    stock,
    image,
    isBestSeller,
    isPromo,
    promoDiscount,
    "vendor": vendor->{
      name,
      "slug": slug.current,
      isVerified
    }
  }
`)

export const BANNERS_QUERY = defineQuery(`
  *[_type == "banner" && isActive == true] | order(_createdAt desc) {
    _id,
    title,
    imageDesktop,
    imageMobile,
    link
  }
`)

export const CATEGORIES_QUERY = defineQuery(`
  *[_type == "category"] | order(name asc) {
    _id,
    name,
    "slug": slug.current,
    image
  }
`)

export const PRODUCT_BY_SLUG_QUERY = defineQuery(`
  *[_type == "product" && slug.current == $slug][0] {
    _id,
    name,
    "slug": slug.current,
    price,
    stock,
    description,
    image,
    isBestSeller,
    isPromo,
    promoDiscount,
    "vendor": vendor->{
      name,
      phone,
      address,
      "slug": slug.current,
      isVerified
    }
  }
`)

export const VENDORS_QUERY = defineQuery(`
  *[_type == "vendor" && isVerified == true] | order(name asc) {
    _id,
    name,
    "slug": slug.current,
    logo,
    address,
    description,
    isVerified
  }
`)

export const VENDOR_BY_SLUG_QUERY = defineQuery(`
  *[_type == "vendor" && slug.current == $slug][0] {
    _id,
    name,
    "slug": slug.current,
    logo,
    address,
    description,
    phone,
    isVerified
  }
`)

export const PRODUCTS_BY_VENDOR_QUERY = defineQuery(`
  *[_type == "product" && vendor->slug.current == $slug] | order(_createdAt desc) {
    _id,
    name,
    "slug": slug.current,
    price,
    stock,
    image,
    isBestSeller,
    isPromo,
    promoDiscount,
    "vendor": vendor->{
      name,
      "slug": slug.current,
      isVerified
    }
  }
`)

export const SERVICES_QUERY = defineQuery(`
  *[_type == "service" && (!defined($search) || name match $search + "*")] | order(_createdAt desc) {
    _id,
    name,
    "slug": slug.current,
    price,
    priceType,
    image,
    isBestSeller,
    isPromo,
    promoDiscount,
    "vendor": vendor->{
      name,
      "slug": slug.current,
      isVerified
    },
    "categories": categories[]->{
      name,
      "slug": slug.current
    }
  }
`)

export const SERVICE_BY_SLUG_QUERY = defineQuery(`
  *[_type == "service" && slug.current == $slug][0] {
    _id,
    name,
    "slug": slug.current,
    price,
    priceType,
    description,
    image,
    isBestSeller,
    isPromo,
    promoDiscount,
    "vendor": vendor->{
      name,
      phone,
      address,
      "slug": slug.current,
      isVerified
    }
  }
`)

export const SERVICES_BY_VENDOR_QUERY = defineQuery(`
  *[_type == "service" && vendor->slug.current == $slug] | order(_createdAt desc) {
    _id,
    name,
    "slug": slug.current,
    price,
    priceType,
    image,
    isBestSeller,
    isPromo,
    promoDiscount,
    "vendor": vendor->{
      name,
      "slug": slug.current,
      isVerified
    }
  }
`)

export const ARTICLES_QUERY = defineQuery(`
  *[_type == "article"] | order(publishedAt desc) {
    _id,
    title,
    "slug": slug.current,
    publishedAt,
    category,
    image,
    excerpt
  }
`)

export const LATEST_ARTICLES_QUERY = defineQuery(`
  *[_type == "article"] | order(publishedAt desc) [0...3] {
    _id,
    title,
    "slug": slug.current,
    publishedAt,
    category,
    image,
    excerpt
  }
`)

export const ARTICLE_BY_SLUG_QUERY = defineQuery(`
  *[_type == "article" && slug.current == $slug][0] {
    _id,
    title,
    "slug": slug.current,
    publishedAt,
    category,
    image,
    excerpt,
    content
  }
`)

export const INCUBATOR_SERVICES_QUERY = defineQuery(`
  *[_type == "incubatorService"] | order(order asc) {
    _id,
    title,
    "slug": slug.current,
    description,
    iconName,
    order
  }
`)

export const INCUBATOR_SETTINGS_QUERY = defineQuery(`
  *[_type == "article" && title == "Aset Visual Inkubator UMKM"][0] {
    image
  }
`)

export const ORDER_BY_NUMBER_QUERY = defineQuery(`
  *[_type == "order" && orderNumber == $orderNumber][0] {
    _id,
    orderNumber,
    customerName,
    status,
    totalAmount,
    deliveryAddress,
    _createdAt,
    "items": items[] {
      _key,
      quantity,
      price,
      "product": product->{
        name,
        image
      }
    },
    "courier": courier->{
      name,
      phone
    }
  }
`)
