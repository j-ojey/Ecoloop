import React from 'react';
import { useCart } from '../context/CartContext.jsx';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function Cart() {
  const { cart, removeFromCart, updateQuantity, clearCart, getTotal } = useCart();

  const handleCheckout = () => {
    if (cart.length === 0) {
      toast.error('Your cart is empty');
      return;
    }
    toast.success('Checkout feature coming soon! Contact sellers via messages.');
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-4xl mx-auto animate-fade-in">
        <h1 className="text-4xl font-bold mb-6 gradient-text text-center sm:text-left">🛍️ Shopping Cart</h1>
        <div className="card text-center py-16 glass-effect bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900">
          <div className="text-7xl mb-6 animate-bounce-slow">🛍️</div>
          <h2 className="text-3xl font-bold mb-3 gradient-text">Your cart is empty</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8 text-lg">Browse sustainable items and start your eco-journey!</p>
          <Link to="/discover" className="btn-primary inline-block text-lg">
            🌍 Browse Items
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold gradient-text">🛍️ Shopping Cart ({cart.length})</h1>
        <button onClick={clearCart} className="btn-ghost text-sm hover:text-red-600 dark:hover:text-red-400">
          🗑️ Clear Cart
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cart.map(item => (
            <div key={item._id} className="card hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900">
              <div className="flex gap-4">
                <Link to={`/items/${item._id}`} className="flex-shrink-0 group">
                  <div className="w-24 h-24 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-2xl overflow-hidden shadow-md group-hover:scale-110 transition-transform duration-300">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.title} className="object-cover w-full h-full" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                        No image
                      </div>
                    )}
                  </div>
                </Link>

                <div className="flex-1 min-w-0">
                  <Link to={`/items/${item._id}`}>
                    <h3 className="font-bold text-lg mb-1 dark:text-white line-clamp-1 hover:text-green-600 dark:hover:text-green-400 transition-colors">
                      {item.title}
                    </h3>
                  </Link>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {item.category} • {item.condition}
                  </p>
                  {item.town && (
                    <p className="text-xs text-gray-500 dark:text-gray-500">📍 {item.town}</p>
                  )}
                </div>

                <div className="flex flex-col items-end justify-between">
                  <p className="text-2xl font-extrabold gradient-text">
                    ${item.price || 0}
                  </p>
                  <button
                    onClick={() => removeFromCart(item._id)}
                    className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 text-sm font-semibold hover:scale-110 transition-transform"
                  >
                    🗑️ Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="card sticky top-4 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-green-900/30 dark:via-emerald-900/20 dark:to-teal-900/10 border-2 border-green-200 dark:border-green-700">
            <h2 className="text-2xl font-bold mb-6 gradient-text">📋 Order Summary</h2>
            
            <div className="space-y-3 mb-4 pb-4 border-b-2 border-green-200 dark:border-green-700">
              <div className="flex justify-between text-sm">
                <span className="text-gray-700 dark:text-gray-300 font-medium">Items ({cart.length})</span>
                <span className="font-bold dark:text-white">${getTotal().toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-700 dark:text-gray-300 font-medium">Shipping</span>
                <span className="font-bold text-green-600 dark:text-green-400">✓ Free</span>
              </div>
            </div>

            <div className="flex justify-between mb-6">
              <span className="text-xl font-bold dark:text-white">Total</span>
              <span className="text-3xl font-extrabold gradient-text">
                ${getTotal().toFixed(2)}
              </span>
            </div>

            <button onClick={handleCheckout} className="btn-primary w-full mb-3 text-lg">
              🛍️ Proceed to Checkout
            </button>

            <Link to="/discover" className="btn-ghost w-full text-center block">
              ← Continue Shopping
            </Link>

            <div className="mt-6 p-4 bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/40 dark:to-emerald-900/40 rounded-2xl border-2 border-green-300 dark:border-green-600">
              <p className="text-xs text-green-800 dark:text-green-300 font-medium text-center">
                🌱 By buying secondhand, you're saving the planet! Items in your cart will save approximately <strong className="text-green-900 dark:text-green-200">{cart.length * 15}kg of CO₂</strong> ✨
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
