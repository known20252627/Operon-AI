'use client';

import React, { useState, useEffect } from 'react';
import { getCompanyProducts, addCompanyProduct, deleteCompanyProduct, updateCompanyProduct } from '@/services/inventory';
import type { Product } from '@/types';

export function ProductsView() {
  const [productsList, setProductsList] = useState<Product[]>(() => getCompanyProducts());
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  // New product form state
  const [formName, setFormName] = useState('');
  const [formSku, setFormSku] = useState('');
  const [formBrand, setFormBrand] = useState('');
  const [formSupplier, setFormSupplier] = useState('');
  const [formCategory, setFormCategory] = useState('General Medical');
  const [formRate, setFormRate] = useState('');
  const [formGst, setFormGst] = useState('18');
  const [formStock, setFormStock] = useState('25');
  const [formWarranty, setFormWarranty] = useState('1 Year Standard');

  const loadProducts = () => {
    setProductsList(getCompanyProducts());
  };

  useEffect(() => {
    const handleUpdate = () => {
      setProductsList(getCompanyProducts());
    };
    window.addEventListener('operon_ai_inventory_updated', handleUpdate);
    return () => window.removeEventListener('operon_ai_inventory_updated', handleUpdate);
  }, []);

  const showNotify = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  const openNewProductModal = () => {
    setEditingId(null);
    setFormName('');
    setFormSku('');
    setFormBrand('');
    setFormSupplier('');
    setFormRate('');
    setFormGst('18');
    setFormStock('25');
    setFormWarranty('1 Year Standard');
    setShowAddModal(true);
  };

  const handleStartEdit = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(product.id);
    setFormName(product.name);
    setFormSku(product.sku);
    setFormBrand(product.brand || '');
    setFormSupplier(product.supplier || '');
    setFormCategory(product.category || 'General Medical');
    setFormRate(product.rate.toString());
    setFormGst((product.gst !== undefined ? product.gst : 18).toString());
    setFormStock((product.stock !== undefined ? product.stock : 25).toString());
    setFormWarranty(product.warranty || '1 Year Standard');
    setShowAddModal(true);
  };

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formRate) {
      showNotify('⚠️ Please enter at least Product Name and Rate (₹)');
      return;
    }

    if (editingId) {
      updateCompanyProduct(editingId, {
        name: formName,
        sku: formSku,
        brand: formBrand || 'Operon AI Certified',
        supplier: formSupplier || 'Direct Supplier',
        category: formCategory,
        rate: Number(formRate) || 0,
        gst: Number(formGst) || 18,
        stock: Number(formStock) || 0,
        warranty: formWarranty || '1 Year Standard',
      });
      showNotify(`✏️ Successfully updated "${formName}" in Company Catalog!`);
    } else {
      const newProd = addCompanyProduct({
        name: formName,
        sku: formSku,
        brand: formBrand || 'Operon AI Certified',
        supplier: formSupplier || 'Direct Supplier',
        category: formCategory,
        rate: Number(formRate) || 0,
        gst: Number(formGst) || 18,
        stock: Number(formStock) || 20,
        warranty: formWarranty || '1 Year Standard',
      });
      showNotify(`✅ Successfully added "${newProd.name}" (${newProd.sku}) to Company Products!`);
    }

    setShowAddModal(false);
    setEditingId(null);
    // Reset form
    setFormName('');
    setFormSku('');
    setFormBrand('');
    setFormSupplier('');
    setFormRate('');
    setProductsList(getCompanyProducts());
  };

  const handleDelete = (id: string, name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Are you sure you want to remove "${name}" from Company Products?`)) {
      deleteCompanyProduct(id);
      showNotify(`🗑️ Removed "${name}" from catalog.`);
      loadProducts();
    }
  };

  // Dynamic categories
  const categories = ['All', ...Array.from(new Set(productsList.map(p => p.category || 'General Medical')))];

  const filteredProducts = productsList.filter((p: Product) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || 
                          p.sku.toLowerCase().includes(search.toLowerCase()) ||
                          (p.brand && p.brand.toLowerCase().includes(search.toLowerCase()));
    const matchesCategory = category === 'All' || p.category === category;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="products-view flex flex-col h-full bg-zinc-50 dark:bg-zinc-900 min-h-screen relative">
      {/* Notification Banner */}
      {notification && (
        <div className="fixed top-6 right-6 z-50 bg-indigo-900 text-white px-5 py-3 rounded-xl shadow-xl border border-indigo-700 flex items-center gap-3 animate-fade-in text-sm font-medium">
          <span>{notification}</span>
        </div>
      )}

      {/* Top Header Section */}
      <div className="p-6 pb-0 flex flex-col gap-6">
        {/* AI Learning Status Banner */}
        <div className="bg-gradient-to-r from-indigo-900/90 to-purple-900/90 text-white p-4 rounded-xl shadow-md border border-indigo-700/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-xl shrink-0">
              ⚡
            </div>
            <div>
              <h4 className="font-bold text-sm">Operon AI Inventory Officer Active</h4>
              <p className="text-xs text-indigo-200">
                New products discovered during OCR scans or finalized in quotations are automatically learned and saved to this company catalog.
              </p>
            </div>
          </div>
          <div className="bg-white/10 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap">
            {productsList.length} Total Items
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Company Products &amp; Catalog</h1>
            <p className="text-xs text-zinc-500 mt-0.5">Manage medical equipment prices, SKUs, and stock levels.</p>
          </div>
          <div className="flex gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-initial">
              <span className="absolute inset-y-0 left-3 flex items-center text-zinc-400">🔍</span>
              <input 
                type="text" 
                placeholder="Search products, SKU, brand..." 
                className="pl-10 pr-4 py-2 w-full sm:w-64 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-zinc-900 dark:text-white"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button 
              onClick={openNewProductModal}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm flex items-center gap-2 whitespace-nowrap"
            >
              <span>+</span> Add Company Product
            </button>
          </div>
        </div>

        {/* Categories Bar */}
        <div className="flex gap-2 overflow-x-auto pb-2 border-b border-zinc-200 dark:border-zinc-800">
          {categories.map(c => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${category === c ? 'bg-indigo-600 text-white shadow-sm' : 'bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700'}`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      <div className="p-6 overflow-y-auto flex-1">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-zinc-800/50 rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-700">
            <div className="text-4xl mb-3">📦</div>
            <h3 className="text-base font-semibold text-zinc-700 dark:text-zinc-300">No products found</h3>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto mt-1 mb-6">
              We couldn&apos;t find any items matching your filter. Try clearing the search or click below to add a new product.
            </p>
            <button 
              onClick={() => { setSearch(''); setCategory('All'); openNewProductModal(); }}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-xs font-medium shadow"
            >
              + Add Product Now
            </button>
          </div>
        ) : (
          <div className="products-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product: Product) => {
              const stock = product.stock || 0;
              const stockStatus = stock > 10 ? 'good' : stock > 0 ? 'low' : 'out';
              const isAutoLearned = product.supplier?.includes('Learned') || product.brand?.includes('Learned') || product.category === 'OCR Learned Items';
              
              return (
                <div key={product.id} className="product-card bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 overflow-hidden hover:shadow-lg transition-all group flex flex-col relative">
                  {/* Edit & Delete Buttons */}
                  <div className="absolute top-3 right-3 z-10 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-all">
                    <button
                      onClick={(e) => handleStartEdit(product, e)}
                      title="Edit Product Details"
                      className="w-7 h-7 bg-indigo-500/10 hover:bg-indigo-600 text-indigo-600 dark:text-indigo-400 hover:text-white rounded-full flex items-center justify-center text-xs transition-all shadow-sm"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={(e) => handleDelete(product.id, product.name, e)}
                      title="Remove from Company Catalog"
                      className="w-7 h-7 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-full flex items-center justify-center text-xs transition-all shadow-sm"
                    >
                      🗑️
                    </button>
                  </div>

                  <div className="h-36 bg-zinc-100 dark:bg-zinc-900/50 flex items-center justify-center p-6 relative">
                    {product.brand && (
                      <span className="absolute top-3 left-3 bg-white/90 dark:bg-zinc-800/90 backdrop-blur text-[10px] font-bold px-2 py-0.5 rounded shadow-sm text-zinc-700 dark:text-zinc-300">
                        {product.brand}
                      </span>
                    )}
                    {isAutoLearned && (
                      <span className="absolute bottom-2 right-2 bg-indigo-600/90 text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow">
                        ⚡ Auto-Learned
                      </span>
                    )}
                    <span className="text-4xl text-zinc-300 dark:text-zinc-700 group-hover:scale-110 transition-transform">
                      {product.image || '🏥'}
                    </span>
                  </div>
                  
                  <div className="p-5 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-2 gap-2">
                      <h3 className="font-semibold text-sm text-zinc-900 dark:text-white line-clamp-2 leading-snug">{product.name}</h3>
                      <div className="text-right shrink-0">
                        <div className="font-bold text-indigo-600 dark:text-indigo-400 text-sm">₹{product.rate.toLocaleString('en-IN')}</div>
                        <div className="text-[10px] text-zinc-500">+{product.gst || 18}% GST</div>
                      </div>
                    </div>
                    
                    <div className="product-meta text-xs text-zinc-500 mb-4 flex items-center gap-2">
                      <span className="font-mono bg-zinc-100 dark:bg-zinc-900 px-1.5 py-0.5 rounded text-[10px] text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800">
                        SKU: {product.sku}
                      </span>
                      <span className="text-[10px] bg-zinc-100 dark:bg-zinc-900 px-1.5 py-0.5 rounded text-zinc-500">
                        {product.category}
                      </span>
                    </div>
                    
                    <div className="mt-auto space-y-3">
                      <div className="grid grid-cols-2 gap-2 text-[11px] border-t border-zinc-100 dark:border-zinc-700/50 pt-3">
                        <div className="text-zinc-600 dark:text-zinc-400"><span className="text-zinc-400">Supplier:</span> <span className="truncate block font-medium text-zinc-700 dark:text-zinc-300">{product.supplier || 'Direct'}</span></div>
                        <div className="text-zinc-600 dark:text-zinc-400"><span className="text-zinc-400">Warranty:</span> <span className="truncate block font-medium text-zinc-700 dark:text-zinc-300">{product.warranty || '1 Year'}</span></div>
                      </div>
                      
                      <div className="flex items-center justify-between bg-zinc-50 dark:bg-zinc-900/50 px-3 py-2 rounded-lg border border-zinc-200/60 dark:border-zinc-800">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${stockStatus === 'good' ? 'bg-emerald-500' : stockStatus === 'low' ? 'bg-amber-500' : 'bg-red-500'}`} />
                          <span className={`text-[11px] font-medium ${stockStatus === 'good' ? 'text-emerald-700 dark:text-emerald-400' : stockStatus === 'low' ? 'text-amber-700 dark:text-amber-400' : 'text-red-700 dark:text-red-400'}`}>
                            {stockStatus === 'good' ? `In Stock (${stock})` : stockStatus === 'low' ? `Low Stock (${stock})` : 'Out of Stock'}
                          </span>
                        </div>
                        {product.barcode && <span className="text-zinc-400 text-[10px] font-mono">|||||||</span>}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Company Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 w-full max-w-lg rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden animate-scale-up">
            <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center bg-zinc-50 dark:bg-zinc-800/50">
              <div>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                  <span>🏥</span> {editingId ? 'Edit Company Product' : 'Add Company Product'}
                </h3>
                <p className="text-xs text-zinc-500">
                  {editingId ? 'Modify equipment specifications and pricing.' : 'Manually add a new equipment item to your Operon AI catalog.'}
                </p>
              </div>
              <button 
                onClick={() => { setShowAddModal(false); setEditingId(null); }}
                className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center text-zinc-600 dark:text-zinc-300 hover:bg-zinc-300"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Product Name *
                </label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Digital Pulse Oximeter Pro" 
                  value={formName}
                  onChange={e => setFormName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm focus:ring-2 focus:ring-indigo-500 text-zinc-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Rate / Unit Price (₹) *
                  </label>
                  <input 
                    type="number" 
                    required
                    placeholder="e.g. 2450" 
                    value={formRate}
                    onChange={e => setFormRate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm focus:ring-2 focus:ring-indigo-500 text-zinc-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    GST Slab (%)
                  </label>
                  <select 
                    value={formGst}
                    onChange={e => setFormGst(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm focus:ring-2 focus:ring-indigo-500 text-zinc-900 dark:text-white"
                  >
                    <option value="5">5% GST</option>
                    <option value="12">12% GST</option>
                    <option value="18">18% Standard GST</option>
                    <option value="28">28% GST</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    SKU Code (Optional)
                  </label>
                  <input 
                    type="text" 
                    placeholder="Auto-generated if empty" 
                    value={formSku}
                    onChange={e => setFormSku(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm focus:ring-2 focus:ring-indigo-500 text-zinc-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Category
                  </label>
                  <select 
                    value={formCategory}
                    onChange={e => setFormCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm focus:ring-2 focus:ring-indigo-500 text-zinc-900 dark:text-white"
                  >
                    <option value="General Medical">General Medical</option>
                    <option value="Diagnostics">Diagnostics</option>
                    <option value="Cardiology">Cardiology</option>
                    <option value="Surgical">Surgical</option>
                    <option value="Consumables">Consumables</option>
                    <option value="ICU Equipment">ICU Equipment</option>
                    <option value="OCR Learned Items">OCR Learned Items</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Brand / Manufacturer
                  </label>
                  <input 
                    type="text" 
                    placeholder="e.g. Omron / Philips / Operon" 
                    value={formBrand}
                    onChange={e => setFormBrand(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm focus:ring-2 focus:ring-indigo-500 text-zinc-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Initial Stock (Units)
                  </label>
                  <input 
                    type="number" 
                    placeholder="25" 
                    value={formStock}
                    onChange={e => setFormStock(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm focus:ring-2 focus:ring-indigo-500 text-zinc-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Supplier Name
                  </label>
                  <input 
                    type="text" 
                    placeholder="e.g. Direct MedTech Supply" 
                    value={formSupplier}
                    onChange={e => setFormSupplier(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm focus:ring-2 focus:ring-indigo-500 text-zinc-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Warranty Terms
                  </label>
                  <input 
                    type="text" 
                    placeholder="e.g. 1 Year Replacement" 
                    value={formWarranty}
                    onChange={e => setFormWarranty(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm focus:ring-2 focus:ring-indigo-500 text-zinc-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => { setShowAddModal(false); setEditingId(null); }}
                  className="px-4 py-2 rounded-lg text-sm text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 font-medium"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg text-sm font-semibold shadow-md transition-colors"
                >
                  {editingId ? 'Update Product Details' : 'Save to Company Products'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
