'use client'

import React, { createContext, useContext, useState, useEffect, useRef } from 'react'
import { Product } from '@/types'
import type { Image } from 'sanity'

export interface CartItem {
  _id: string
  name: string
  price: number
  image: Image
  quantity: number
  vendorName: string
}

interface CartContextType {
  items: CartItem[]
  addItem: (product: Product) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, delta: number) => void
  clearCart: () => void
  totalItems: number
  totalPrice: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const isLoaded = useRef(false)

  // Load from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('pondokrejo-cart')
      if (saved) {
        try {
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setItems(JSON.parse(saved))
        } catch (e) {
          console.error('Failed to parse cart', e)
        }
      }
      isLoaded.current = true
    }
  }, [])

  // Save to localStorage
  useEffect(() => {
    if (isLoaded.current) {
      localStorage.setItem('pondokrejo-cart', JSON.stringify(items))
    }
  }, [items])

  const addItem = (product: Product) => {
    setItems((prev) => {
      const existing = prev.find((i) => i._id === product._id)
      if (existing) {
        return prev.map((i) =>
          i._id === product._id ? { ...i, quantity: i.quantity + 1 } : i
        )
      }
      return [
        ...prev,
        {
          _id: product._id,
          name: product.name,
          price: product.price,
          image: product.image,
          quantity: 1,
          vendorName: product.vendor?.name || 'UMKM Pondokrejo',
        },
      ]
    })
  }

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i._id !== id))
  }

  const updateQuantity = (id: string, delta: number) => {
    setItems((prev) =>
      prev
        .map((i) =>
          i._id === id ? { ...i, quantity: Math.max(0, i.quantity + delta) } : i
        )
        .filter((i) => i.quantity > 0)
    )
  }

  const clearCart = () => setItems([])

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0)
  const totalPrice = items.reduce((sum, i) => sum + i.price * i.quantity, 0)

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
