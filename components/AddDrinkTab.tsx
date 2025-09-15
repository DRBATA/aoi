"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Plus, Minus, Loader2 } from "lucide-react"

// Simple currency formatter
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount)
}

interface Product {
  id: string
  name: string
  description: string
  price: number
  image: string
  tags?: string[]
  qty_on_hand?: number
  faqs?: {
    sections: {
      title: string
      questions: {
        q: string
        a: string
      }[]
    }[]
  }
}

interface CartItem {
  product_id: string
  quantity: number
}

interface AddDrinkTabProps {
  customerEmail?: string
}

const FILTER_CATEGORIES = ['electrolytes', 'coffee', 'energy', 'hydration', 'greens', 'focus']

export default function AddDrinkTab({ customerEmail }: AddDrinkTabProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [activeFilters, setActiveFilters] = useState<string[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [email, setEmail] = useState(customerEmail || '')
  const [addingToCart, setAddingToCart] = useState<string | null>(null)

  // Fetch products on mount
  useEffect(() => {
    fetchProducts()
  }, [])

  // Filter products when activeFilters change
  useEffect(() => {
    if (activeFilters.length === 0) {
      setFilteredProducts(products)
    } else {
      const filtered = products.filter(product => 
        product.tags && activeFilters.some(filter => 
          product.tags!.some(tag => tag.toLowerCase().includes(filter.toLowerCase()))
        )
      )
      setFilteredProducts(filtered)
    }
  }, [products, activeFilters])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/products/venue-stock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          venueName: 'Art of Implosion x Johny Dar Experience' 
        })
      })
      
      if (response.ok) {
        const data = await response.json()
        setProducts(data.products || [])
        setFilteredProducts(data.products || [])
      }
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleFilter = (filter: string) => {
    setActiveFilters(prev => 
      prev.includes(filter) 
        ? prev.filter(f => f !== filter)
        : [...prev, filter]
    )
  }

  const addToCart = async (product: Product) => {
    if (!email.trim()) {
      alert('Please enter an email address')
      return
    }
    try {
      setAddingToCart(product.id)
      const response = await fetch('/api/cart/add-drink', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: product.id,
          qty: 1,
          where: 'here',
          customerEmail: email.trim()
        })
      })

      if (response.ok) {
        // Update local cart state
        setCart(prev => {
          const existing = prev.find(item => item.product_id === product.id)
          if (existing) {
            return prev.map(item => 
              item.product_id === product.id 
                ? { ...item, quantity: item.quantity + 1 }
                : item
            )
          }
          return [...prev, { product_id: product.id, quantity: 1 }]
        })
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to add to cart')
      }
    } catch (error) {
      console.error('Error adding to cart:', error)
      alert('Failed to add to cart')
    } finally {
      setAddingToCart(null)
    }
  }

  const removeFromCart = async (productId: string) => {
    if (!email.trim()) return

    try {
      const response = await fetch('/api/cart/remove', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: productId,
          customerEmail: email.trim()
        })
      })

      if (response.ok) {
        // Update local cart state
        setCart(prev => {
          const existing = prev.find(item => item.product_id === productId)
          if (existing && existing.quantity > 1) {
            return prev.map(item => 
              item.product_id === productId 
                ? { ...item, quantity: item.quantity - 1 }
                : item
            )
          }
          return prev.filter(item => item.product_id !== productId)
        })
      }
    } catch (error) {
      console.error('Error removing from cart:', error)
    }
  }

  const getQuantityInCart = (productId: string) => {
    const item = cart.find(item => item.product_id === productId)
    return item?.quantity || 0
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Email Input */}
      <div className="bg-gradient-to-r from-purple-100 to-blue-100 p-4 rounded-lg">
        <label htmlFor="customer-email" className="block text-sm font-medium text-gray-700 mb-2">
          Customer Email
        </label>
        <input
          id="customer-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter customer email for cart"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        />
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap gap-2 justify-center">
        {FILTER_CATEGORIES.map((filter) => (
          <Button
            key={filter}
            size="sm"
            variant={activeFilters.includes(filter) ? "default" : "outline"}
            className={
              activeFilters.includes(filter)
                ? "bg-purple-600 hover:bg-purple-700 text-white"
                : "border-purple-300 text-purple-600 hover:bg-purple-50"
            }
            onClick={() => toggleFilter(filter)}
          >
            {filter}
          </Button>
        ))}
        {activeFilters.length > 0 && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setActiveFilters([])}
            className="text-gray-500 hover:text-gray-700"
          >
            Clear all
          </Button>
        )}
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => (
          <Card 
            key={product.id}
            className="bg-white/40 backdrop-blur-lg border-white/50 shadow-lg hover:shadow-xl transition-all border rounded-xl"
          >
            <div className="relative h-32 w-full">
              <Image
                src={product.image || "/placeholder.svg"}
                alt={product.name}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                style={{ objectFit: "cover" }}
                className="rounded-t-xl"
              />
            </div>
            
            <CardHeader className="p-4 pb-2">
              <div className="flex items-center gap-2">
                <CardTitle className="text-lg font-semibold text-gray-800">
                  {product.name}
                </CardTitle>
                {product.faqs && (
                  <Dialog>
                    <DialogTrigger asChild>
                      <span className="px-2 py-1 text-xs bg-blue-100 text-blue-600 rounded cursor-pointer hover:bg-blue-200 transition-colors">
                        FAQ
                      </span>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>{product.name} - Frequently Asked Questions</DialogTitle>
                      </DialogHeader>
                      <div className="mt-4">
                        {product.faqs.sections.map((section, sectionIdx) => (
                          <div key={sectionIdx} className="mb-6">
                            <h3 className="text-lg font-semibold mb-3 text-gray-700">{section.title}</h3>
                            <Accordion type="single" collapsible className="w-full">
                              {section.questions.map((faq, qIdx) => (
                                <AccordionItem key={qIdx} value={`${sectionIdx}-${qIdx}`}>
                                  <AccordionTrigger className="text-left">{faq.q}</AccordionTrigger>
                                  <AccordionContent className="text-gray-600">{faq.a}</AccordionContent>
                                </AccordionItem>
                              ))}
                            </Accordion>
                          </div>
                        ))}
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
              <CardDescription className="text-sm text-gray-600 mt-1">
                {product.description}
              </CardDescription>
              {product.qty_on_hand !== undefined && (
                <p className="text-xs text-green-600 font-medium">
                  {product.qty_on_hand} in stock
                </p>
              )}
            </CardHeader>
            
            <CardContent className="flex items-center justify-between p-4 pt-0">
              <span className="text-lg font-bold text-purple-700">
                {formatCurrency(product.price)}
              </span>
              <div className="flex items-center gap-2">
                {getQuantityInCart(product.id) > 0 && (
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={() => removeFromCart(product.id)}
                    className="h-8 w-8"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                )}
                {getQuantityInCart(product.id) > 0 && (
                  <span className="w-4 text-center font-medium">
                    {getQuantityInCart(product.id)}
                  </span>
                )}
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={() => addToCart(product)}
                  disabled={addingToCart === product.id}
                  className="h-8 w-8"
                >
                  {addingToCart === product.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Plus className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProducts.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            {activeFilters.length > 0 
              ? 'No products match the selected filters' 
              : 'No products available'
            }
          </p>
        </div>
      )}
    </div>
  )
}
