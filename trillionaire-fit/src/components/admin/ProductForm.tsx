'use client';

import { useState, useEffect } from 'react';
import ImageUpload from '@/components/ui/ImageUpload';
import { useToast } from '@/hooks/useToast';

interface Product {
  _id?: string;
  name: string;
  description: string;
  designer: string;
  price: number;
  originalPrice?: number;
  images: string[];
  gender: 'men' | 'women' | 'unisex';
  category: string;
  subcategory?: string;
  sizes: string[];
  colors: string[];
  materials: string[];
  tags: string[];
  isActive: boolean;
  isFeatured: boolean;
  isOnSale: boolean;
  isPreowned: boolean;
  condition?: 'excellent' | 'very-good' | 'good' | 'fair';
  stock: {
    [size: string]: {
      [color: string]: number;
    };
  };
  sku: string;
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  careInstructions?: string;
  shippingInfo?: {
    freeShipping: boolean;
    estimatedDays: number;
  };
  seo: {
    title?: string;
    description?: string;
    keywords?: string[];
  };
}

interface ProductFormProps {
  product?: Product | null;
  onClose: () => void;
  onSuccess: () => void;
}

const COMMON_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '28', '30', '32', '34', '36', '38', '40', '42', '44', '46', '48'];
const COMMON_COLORS = ['Black', 'White', 'Navy', 'Gray', 'Brown', 'Beige', 'Red', 'Blue', 'Green', 'Yellow', 'Pink', 'Purple'];
const COMMON_MATERIALS = ['Cotton', 'Wool', 'Silk', 'Leather', 'Denim', 'Linen', 'Polyester', 'Cashmere', 'Lycra', 'Viscose'];
const COMMON_CATEGORIES = ['Tops', 'Bottoms', 'Dresses', 'Outerwear', 'Shoes', 'Accessories', 'Bags', 'Jewelry'];

export default function ProductForm({ product, onClose, onSuccess }: ProductFormProps) {
  const { showError } = useToast();
  const [formData, setFormData] = useState<Product>({
    name: '',
    description: '',
    designer: '',
    price: 0,
    originalPrice: 0,
    images: [''],
    gender: 'unisex',
    category: '',
    subcategory: '',
    sizes: [],
    colors: [],
    materials: [],
    tags: [],
    isActive: true,
    isFeatured: false,
    isOnSale: false,
    isPreowned: false,
    condition: undefined,
    stock: {},
    sku: '',
    weight: 0,
    dimensions: {
      length: 0,
      width: 0,
      height: 0
    },
    careInstructions: '',
    shippingInfo: {
      freeShipping: false,
      estimatedDays: 7
    },
    seo: {
      title: '',
      description: '',
      keywords: []
    }
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Initialize form with product data if editing
  useEffect(() => {
    if (product) {
      console.log('🔄 Initializing form with product data:', JSON.stringify(product, null, 2));
      const initialData = {
        ...product,
        images: product.images.length > 0 ? product.images : [''],
        sizes: product.sizes || [],
        colors: product.colors || [],
        materials: product.materials || [],
        tags: product.tags || [],
        stock: product.stock || {},
        dimensions: product.dimensions || { length: 0, width: 0, height: 0 },
        shippingInfo: product.shippingInfo || { freeShipping: false, estimatedDays: 7 },
        seo: product.seo || { title: '', description: '', keywords: [] }
      };
      console.log('📝 Initial form data:', JSON.stringify(initialData, null, 2));
      setFormData(initialData);
    }
  }, [product]);

  const handleInputChange = (field: string, value: any) => {
    console.log(`🔍 handleInputChange called: ${field} = ${value}`);
    setFormData(prev => {
      const newData = {
        ...prev,
        [field]: value
      };
      console.log('🔍 New form data:', newData);
      return newData;
    });
  };

  const handleNestedInputChange = (parentField: string, childField: string, value: any) => {
    setFormData(prev => {
      const currentParent = prev[parentField as keyof Product];
      const parentValue = currentParent && typeof currentParent === 'object' ? currentParent : {};
      
      return {
        ...prev,
        [parentField]: {
          ...parentValue,
          [childField]: value
        }
      };
    });
  };

  const handleArrayChange = (field: string, value: string[]) => {
    setFormData(prev => {
      const newData = {
        ...prev,
        [field]: value
      };
      
      // If sizes or colors changed, update stock structure
      if (field === 'sizes' || field === 'colors') {
        const currentTotal = getTotalStockFromForm();
        console.log(`🔄 ${field} changed to:`, value);
        console.log('📊 Current total stock:', currentTotal);
        
        if (currentTotal > 0) {
          // Redistribute existing stock across new size/color combinations
          const newStock: { [size: string]: { [color: string]: number } } = {};
          
          if (value.length > 0 && (field === 'sizes' ? prev.colors : prev.sizes).length > 0) {
            const sizes = field === 'sizes' ? value : prev.sizes;
            const colors = field === 'colors' ? value : prev.colors;
            
            console.log('📏 New sizes:', sizes);
            console.log('🎨 New colors:', colors);
            
            const stockPerCombination = Math.floor(currentTotal / (sizes.length * colors.length));
            const remainingStock = currentTotal % (sizes.length * colors.length);
            
            sizes.forEach((size, sizeIndex) => {
              newStock[size] = {};
              colors.forEach((color, colorIndex) => {
                let stockForThisCombination = stockPerCombination;
                if (sizeIndex * colors.length + colorIndex < remainingStock) {
                  stockForThisCombination += 1;
                }
                newStock[size][color] = stockForThisCombination;
              });
            });
          } else {
            // If no sizes or colors, create default structure
            if (value.length > 0) {
              value.forEach(item => {
                newStock[item] = { 'Default': currentTotal };
              });
            } else {
              newStock['Default'] = { 'Default': currentTotal };
            }
          }
          
          newData.stock = newStock;
          console.log('📊 New stock structure:', JSON.stringify(newStock, null, 2));
        } else {
          // If no current stock, initialize empty structure
          const newStock: { [size: string]: { [color: string]: number } } = {};
          if (value.length > 0) {
            const otherArray = field === 'sizes' ? prev.colors : prev.sizes;
            if (otherArray.length > 0) {
              const sizes = field === 'sizes' ? value : otherArray;
              const colors = field === 'colors' ? value : otherArray;
              sizes.forEach(size => {
                newStock[size] = {};
                colors.forEach(color => {
                  newStock[size][color] = 0;
                });
              });
            } else {
              value.forEach(item => {
                newStock[item] = { 'Default': 0 };
              });
            }
          }
          newData.stock = newStock;
        }
      }
      
      return newData;
    });
  };

  const handleImagesChange = (newImages: string[]) => {
    setFormData(prev => ({
      ...prev,
      images: newImages
    }));
  };

  // Helper function to get total stock from the stock structure
  const getTotalStockFromForm = () => {
    let total = 0;
    for (const sizeStock of Object.values(formData.stock)) {
      for (const colorStock of Object.values(sizeStock)) {
        total += colorStock;
      }
    }
    return total;
  };

  // Helper function to handle stock quantity changes
  const handleStockQuantityChange = (totalStock: number) => {
    console.log('🔄 Stock quantity changed to:', totalStock);
    console.log('📏 Current sizes:', formData.sizes);
    console.log('🎨 Current colors:', formData.colors);
    
    // If we have sizes and colors selected, distribute the stock
    if (formData.sizes.length > 0 && formData.colors.length > 0) {
      const stockPerCombination = Math.floor(totalStock / (formData.sizes.length * formData.colors.length));
      const remainingStock = totalStock % (formData.sizes.length * formData.colors.length);
      
      const newStock: { [size: string]: { [color: string]: number } } = {};
      
      formData.sizes.forEach((size, sizeIndex) => {
        newStock[size] = {};
        formData.colors.forEach((color, colorIndex) => {
          let stockForThisCombination = stockPerCombination;
          // Distribute remaining stock to first few combinations
          if (sizeIndex * formData.colors.length + colorIndex < remainingStock) {
            stockForThisCombination += 1;
          }
          newStock[size][color] = stockForThisCombination;
        });
      });
      
      console.log('📊 Distributed stock structure:', JSON.stringify(newStock, null, 2));
      
      setFormData(prev => ({
        ...prev,
        stock: newStock
      }));
    } else {
      // If no sizes/colors selected, create a default structure
      const newStock: { [size: string]: { [color: string]: number } } = {};
      if (formData.sizes.length > 0) {
        formData.sizes.forEach(size => {
          newStock[size] = { 'Default': totalStock };
        });
      } else if (formData.colors.length > 0) {
        formData.colors.forEach(color => {
          newStock['Default'] = { ...newStock['Default'], [color]: totalStock };
        });
      } else {
        newStock['Default'] = { 'Default': totalStock };
      }
      
      console.log('📊 Default stock structure:', JSON.stringify(newStock, null, 2));
      
      setFormData(prev => ({
        ...prev,
        stock: newStock
      }));
    }
  };

  // Helper function to handle individual stock changes
  const handleIndividualStockChange = (size: string, color: string, quantity: number) => {
    setFormData(prev => ({
      ...prev,
      stock: {
        ...prev.stock,
        [size]: {
          ...prev.stock[size],
          [color]: quantity
        }
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Filter out empty images
      const filteredImages = formData.images.filter(url => url.trim() !== '');
      
      if (filteredImages.length === 0) {
        throw new Error('At least one image is required');
      }

      // Validate stock structure
      const totalStock = getTotalStockFromForm();
      if (totalStock <= 0) {
        throw new Error('Stock quantity must be greater than 0');
      }

      // Ensure stock structure is properly initialized
      if (!formData.stock || Object.keys(formData.stock).length === 0) {
        console.log('⚠️ No stock structure found, initializing...');
        handleStockQuantityChange(totalStock);
        // Wait for state update
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      const submitData = {
        ...formData,
        images: filteredImages
      };

      console.log('🔍 Form data being submitted:', JSON.stringify(submitData, null, 2));
      console.log('🔍 isPreowned value:', submitData.isPreowned);
      console.log('🔍 condition value:', submitData.condition);
      console.log('🔍 Stock structure:', JSON.stringify(submitData.stock, null, 2));
      console.log('🔍 Total stock calculated:', getTotalStockFromForm());

      const url = product ? `/api/products/${product._id}` : '/api/products';
      const method = product ? 'PUT' : 'POST';

      // Submitting product data

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(submitData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save product');
      }

      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-black">
              {product ? 'Edit Product' : 'Add New Product'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-black transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Product Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Designer *
                </label>
                <input
                  type="text"
                  value={formData.designer}
                  onChange={(e) => handleInputChange('designer', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Price *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Original Price
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.originalPrice || ''}
                  onChange={(e) => handleInputChange('originalPrice', parseFloat(e.target.value) || undefined)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Stock Quantity *
                </label>
                <input
                  type="number"
                  min="0"
                  value={getTotalStockFromForm()}
                  onChange={(e) => handleStockQuantityChange(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Total number of items available in stock</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Gender *
                </label>
                <select
                  value={formData.gender}
                  onChange={(e) => handleInputChange('gender', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                  required
                >
                  <option value="men">Men</option>
                  <option value="women">Women</option>
                  <option value="unisex">Unisex</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Category *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                  required
                >
                  <option value="">Select Category</option>
                  {COMMON_CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Subcategory
                </label>
                <input
                  type="text"
                  value={formData.subcategory || ''}
                  onChange={(e) => handleInputChange('subcategory', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  SKU
                </label>
                <input
                  type="text"
                  value={formData.sku || ''}
                  onChange={(e) => handleInputChange('sku', e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-black mb-2">
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                required
              />
            </div>

            {/* Images */}
            <div>
              <label className="block text-sm font-medium text-black mb-2">
                Product Images *
              </label>
              <ImageUpload
                images={formData.images}
                onImagesChange={handleImagesChange}
                maxImages={10}
                onError={showError}
              />
            </div>

            {/* Stock Breakdown */}
            {formData.sizes.length > 0 && formData.colors.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Stock Breakdown by Size & Color
                </label>
                <div className="border border-gray-300 rounded-md p-4 bg-gray-50">
                  <div className="grid grid-cols-1 gap-4">
                    {formData.sizes.map(size => (
                      <div key={size} className="space-y-2">
                        <h4 className="font-medium text-sm text-gray-700">Size: {size}</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                          {formData.colors.map(color => (
                            <div key={`${size}-${color}`} className="flex items-center space-x-2">
                              <label className="text-xs text-gray-600 w-16">{color}:</label>
                              <input
                                type="number"
                                min="0"
                                value={formData.stock[size]?.[color] || 0}
                                onChange={(e) => handleIndividualStockChange(size, color, parseInt(e.target.value) || 0)}
                                className="w-16 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-black"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-300">
                    <p className="text-sm text-gray-600">
                      Total Stock: <span className="font-medium">{getTotalStockFromForm()}</span>
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Sizes, Colors, Materials */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Sizes *
                </label>
                <div className="space-y-2">
                  {COMMON_SIZES.map(size => (
                    <label key={size} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.sizes.includes(size)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            handleArrayChange('sizes', [...formData.sizes, size]);
                          } else {
                            handleArrayChange('sizes', formData.sizes.filter(s => s !== size));
                          }
                        }}
                        className="mr-2"
                      />
                      <span className="text-sm">{size}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Colors *
                </label>
                <div className="space-y-2">
                  {COMMON_COLORS.map(color => (
                    <label key={color} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.colors.includes(color)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            handleArrayChange('colors', [...formData.colors, color]);
                          } else {
                            handleArrayChange('colors', formData.colors.filter(c => c !== color));
                          }
                        }}
                        className="mr-2"
                      />
                      <span className="text-sm">{color}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Materials *
                </label>
                <div className="space-y-2">
                  {COMMON_MATERIALS.map(material => (
                    <label key={material} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.materials.includes(material)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            handleArrayChange('materials', [...formData.materials, material]);
                          } else {
                            handleArrayChange('materials', formData.materials.filter(m => m !== material));
                          }
                        }}
                        className="mr-2"
                      />
                      <span className="text-sm">{material}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Status Toggles */}
            <div className="flex flex-wrap gap-6">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => handleInputChange('isActive', e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm font-medium">Active</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.isFeatured}
                  onChange={(e) => handleInputChange('isFeatured', e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm font-medium">Featured</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.isOnSale}
                  onChange={(e) => handleInputChange('isOnSale', e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm font-medium">On Sale</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.isPreowned}
                  onChange={(e) => {
                    console.log('🔍 Preowned checkbox changed:', e.target.checked);
                    handleInputChange('isPreowned', e.target.checked);
                  }}
                  className="mr-2"
                />
                <span className="text-sm font-medium">Preowned</span>
              </label>
            </div>

            {/* Preowned Condition */}
            {formData.isPreowned && (
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Condition *
                </label>
                <select
                  value={formData.condition || ''}
                  onChange={(e) => {
                    console.log('🔍 Condition changed:', e.target.value);
                    handleInputChange('condition', e.target.value || undefined);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                  required={formData.isPreowned}
                >
                  <option value="">Select Condition</option>
                  <option value="excellent">Excellent</option>
                  <option value="very-good">Very Good</option>
                  <option value="good">Good</option>
                  <option value="fair">Fair</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">Required for preowned items</p>
              </div>
            )}

            {/* Submit Buttons */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Saving...' : (product ? 'Update Product' : 'Create Product')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
