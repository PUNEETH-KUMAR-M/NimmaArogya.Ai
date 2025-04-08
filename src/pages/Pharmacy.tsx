import { useState, useEffect, useCallback, useMemo } from "react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Search, ShoppingCart, Upload, Star, Plus, Minus, Loader2, ImageIcon } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { useNavigate } from "react-router-dom";
import PrescriptionUpload from "@/components/pharmacy/PrescriptionUpload";
import { ProductService } from "@/services/api/product-service";
import { Product } from "@/services/api/types";
import { useQuery } from "@tanstack/react-query";

const productService = new ProductService();

const Pharmacy = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [showCart, setShowCart] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { cartItems, addToCart, removeFromCart, updateQuantity, clearCart, totalItems, subtotal } = useCart();

  const { data: products = [], isLoading, isError } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      return await productService.getProducts();
    }
  });

  // Memoize the filter function to prevent recreation on each render
  const filterProducts = useCallback((productList: Product[], type: string) => {
    if (type === "all") return productList;
    if (type === "prescription") return productList.filter(p => p.prescription);
    return productList.filter(p => !p.prescription);
  }, []);

  // Memoize the filtered results based on products, searchTerm, and filterType
  const searchResults = useMemo(() => {
    if (!products || products.length === 0) return [];
    
    const filtered = filterProducts(products, filterType);
    
    if (!searchTerm.trim()) {
      return filtered;
    }
    
    return filtered.filter(product => 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [products, searchTerm, filterType, filterProducts]);

  const handleAddToCart = (product: Product) => {
    addToCart({
      id: Number(product.id), // Convert string ID to number
      name: product.name,
      price: product.price,
      quantity: 1,
      image: product.image
    });
    
    toast({
      title: "Added to Cart",
      description: `${product.name} has been added to your cart.`,
    });
  };

  const handleRemoveFromCart = (productId: number) => {
    removeFromCart(productId);
  };

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // The search is already handled by the useEffect
    // This is just to handle the form submission
    
    toast({
      title: "Search results",
      description: `Found ${searchResults.length} products matching "${searchTerm}"`,
    });
  };

  const calculateTotal = () => {
    return subtotal + 5; // Add $5 for shipping
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-screen">
          <Loader2 className="h-8 w-8 text-gray-600 dark:text-gray-400" />
        </div>
      </Layout>
    );
  }

  if (isError) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-screen">
          <p className="text-gray-600 dark:text-gray-400">Error loading products</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Hero section */}
      <div className="bg-gradient-to-br from-mediwrap-blue/10 to-mediwrap-green/10 dark:from-mediwrap-blue/5 dark:to-mediwrap-green/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100">
              Online Pharmacy & Medicine Delivery
            </h1>
            <p className="mt-4 text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Order prescription medicines and healthcare products for delivery to your doorstep
            </p>
          </div>
          
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto">
            <div className="bg-white dark:bg-card rounded-lg shadow-md p-6 flex flex-col items-center justify-center hover:shadow-lg transition-shadow">
              <PrescriptionUpload />
            </div>
            <div className="bg-white dark:bg-card rounded-lg shadow-md p-6 flex flex-col items-center justify-center hover:shadow-lg transition-shadow">
              <div className="w-full">
                <h3 className="text-lg font-medium mb-4">Search Products</h3>
                <form onSubmit={handleSearch} className="flex">
                  <Input
                    type="text"
                    placeholder="Search medicines and health products"
                    className="w-full"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <Button type="submit" className="ml-2 bg-mediwrap-blue hover:bg-mediwrap-blue-light text-white">
                    <Search className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-between items-center mb-8">
          <Tabs defaultValue="all" className="">
            <TabsList>
              <TabsTrigger 
                value="all" 
                onClick={() => setFilterType("all")}
              >
                All Products
              </TabsTrigger>
              <TabsTrigger 
                value="otc" 
                onClick={() => setFilterType("otc")}
              >
                Over The Counter
              </TabsTrigger>
              <TabsTrigger 
                value="prescription" 
                onClick={() => setFilterType("prescription")}
              >
                Prescription Only
              </TabsTrigger>
            </TabsList>
          </Tabs>
          
          <Button
            variant="outline"
            className="relative flex items-center border-mediwrap-blue text-mediwrap-blue hover:bg-mediwrap-blue/10"
            onClick={() => setShowCart(!showCart)}
          >
            <ShoppingCart className="h-5 w-5 mr-2" />
            View Cart
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-mediwrap-red text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                {totalItems}
              </span>
            )}
          </Button>
        </div>
        
        {/* Product Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {searchResults.length > 0 ? (
            searchResults.map((product) => (
              <Card key={product.id} className="overflow-hidden flex flex-col h-full">
                <div className="relative h-48 bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                  {!product.image ? (
                    <div className="flex flex-col items-center justify-center text-gray-400">
                      <ImageIcon className="h-10 w-10 mb-2" />
                      <span className="text-sm">No image available</span>
                    </div>
                  ) : (
                    <img 
                      src={product.image} 
                      alt=""
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.onerror = null; // Prevent infinite loop
                        
                        // Replace the img element with a placeholder div
                        const parent = target.parentElement;
                        if (parent) {
                          // Create placeholder content
                          const placeholder = document.createElement('div');
                          placeholder.className = 'flex flex-col items-center justify-center h-full w-full text-gray-400';
                          placeholder.innerHTML = `
                            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mb-2">
                              <rect x="2" y="2" width="20" height="20" rx="2" ry="2"></rect>
                              <circle cx="8.5" cy="8.5" r="1.5"></circle>
                              <polyline points="21 15 16 10 5 21"></polyline>
                            </svg>
                            <span class="text-sm">Image unavailable</span>
                          `;
                          
                          // Replace the img with the placeholder
                          parent.innerHTML = '';
                          parent.appendChild(placeholder);
                        }
                      }}
                    />
                  )}
                  {product.prescription && (
                    <div className="absolute top-2 left-2 bg-mediwrap-blue text-white text-xs px-2 py-1 rounded">
                      Prescription Required
                    </div>
                  )}
                </div>
                <CardContent className="p-4 flex-grow">
                  <div className="mb-2 flex items-center">
                    <span className="text-sm text-mediwrap-green font-medium">{product.category}</span>
                    <div className="ml-auto flex items-center">
                      <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                      <span className="ml-1 text-xs text-gray-600 dark:text-gray-400">{product.rating} ({product.reviews})</span>
                    </div>
                  </div>
                  <h3 className="font-medium text-lg mb-1">{product.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{product.description}</p>
                  <p className="text-lg font-bold text-mediwrap-blue dark:text-mediwrap-blue-light">₹{product.price.toFixed(2)}</p>
                </CardContent>
                <CardFooter className="p-4 pt-0">
                  <Button 
                    className="w-full bg-mediwrap-blue hover:bg-mediwrap-blue-light text-white"
                    onClick={() => handleAddToCart(product)}
                    disabled={product.prescription}
                  >
                    {product.prescription ? "Prescription Required" : "Add to Cart"}
                  </Button>
                </CardFooter>
              </Card>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-500">No products found matching your search criteria.</p>
            </div>
          )}
        </div>
        
        {/* Shopping Cart Sidebar */}
        {showCart && (
          <div className="fixed inset-0 bg-black/20 dark:bg-black/50 z-40 flex justify-end">
            <div className="bg-white dark:bg-gray-900 w-full max-w-md animate-fade-in overflow-y-auto">
              <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
                <h3 className="text-xl font-semibold">Your Cart</h3>
                <Button variant="ghost" size="sm" onClick={() => setShowCart(false)}>
                  &times;
                </Button>
              </div>
              
              <div className="p-6">
                {cartItems.length === 0 ? (
                  <div className="text-center py-16">
                    <ShoppingCart className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-4 text-gray-600 dark:text-gray-400">Your cart is empty</p>
                  </div>
                ) : (
                  <div>
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex items-center py-4 border-b border-gray-200 dark:border-gray-800">
                        <img 
                          src={item.image} 
                          alt={item.name}
                          className="w-16 h-16 object-cover rounded"
                        />
                        <div className="ml-4 flex-grow">
                          <h4 className="font-medium">{item.name}</h4>
                          <p className="text-gray-600 dark:text-gray-400">₹{item.price.toFixed(2)}</p>
                        </div>
                        <div className="flex items-center">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8"
                            onClick={() => handleRemoveFromCart(item.id)}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="mx-2">{item.quantity}</span>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8"
                            onClick={() => addToCart({...item, quantity: 1})}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    
                    <div className="mt-6 py-4 border-t border-gray-200 dark:border-gray-800">
                      <div className="flex justify-between mb-4">
                        <span className="text-gray-600 dark:text-gray-400">Subtotal:</span>
                        <span className="font-medium">₹{subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between mb-4">
                        <span className="text-gray-600 dark:text-gray-400">Delivery:</span>
                        <span className="font-medium">₹5.00</span>
                      </div>
                      <div className="flex justify-between text-lg font-bold">
                        <span>Total:</span>
                        <span>${calculateTotal().toFixed(2)}</span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 mt-6">
                        <Button 
                          variant="outline"
                          onClick={() => navigate("/cart")}
                        >
                          View Cart
                        </Button>
                        <Button 
                          className="bg-mediwrap-blue hover:bg-mediwrap-blue-light text-white"
                          onClick={() => {
                            navigate("/cart");
                            setShowCart(false);
                          }}
                        >
                          Checkout
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Pharmacy;
