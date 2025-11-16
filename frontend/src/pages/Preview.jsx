import React from 'react';
import { Link } from 'react-router-dom';

export default function Preview() {
  return (
    <div className="space-y-12">
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary/10 to-accent/10 dark:from-primary/20 dark:to-accent/20 rounded-2xl p-12 text-center">
        <h1 className="text-5xl font-bold mb-4 text-gray-900 dark:text-white">One person's waste is another's resource.</h1>
        <p className="text-xl text-gray-700 dark:text-gray-300 mb-8 max-w-2xl mx-auto">EcoLoop connects communities to give, trade, and upcycle items locally. Reduce waste, earn eco-points, and build a sustainable future together.</p>
        <div className="flex gap-4 justify-center">
          <Link to="/login" className="btn-primary">Login</Link>
          <Link to="/register" className="btn-secondary">Create Account</Link>
        </div>
      </section>
      {/* Features */}
      <section className="grid md:grid-cols-3 gap-6">
        <div className="card">
          <div className="text-4xl mb-3">📦</div>
          <h2 className="font-bold text-lg mb-2">Post Items</h2>
          <p className="text-gray-600">List items to give away, trade, or sell. Upload photos, set location, and reach your community.</p>
        </div>
        <div className="card">
          <div className="text-4xl mb-3">🗺️</div>
          <h2 className="font-bold text-lg mb-2">Discover Nearby</h2>
          <p className="text-gray-600">Browse a map of items around you. Filter by category, condition, and price type to find what you need.</p>
        </div>
        <div className="card">
          <div className="text-4xl mb-3">⭐</div>
          <h2 className="font-bold text-lg mb-2">Earn Eco-Points</h2>
          <p className="text-gray-600">Build your score by donating and reusing. Climb the leaderboard and inspire others to join the movement.</p>
        </div>
      </section>

      {/* Impact */}
      <section className="bg-gray-900 dark:bg-black text-white rounded-2xl p-12 text-center">
        <h2 className="text-3xl font-bold mb-6">Why EcoLoop?</h2>
        <div className="grid md:grid-cols-4 gap-6">
          <div>
            <div className="text-4xl font-bold text-accent mb-2">1B+</div>
            <p className="text-gray-300">Items thrown away yearly</p>
          </div>
          <div>
            <div className="text-4xl font-bold text-accent mb-2">50%</div>
            <p className="text-gray-300">Waste that could be reused</p>
          </div>
          <div>
            <div className="text-4xl font-bold text-accent mb-2">SDG 12</div>
            <p className="text-gray-300">Responsible Consumption</p>
          </div>
          <div>
            <div className="text-4xl font-bold text-accent mb-2">∞</div>
            <p className="text-gray-300">Community potential</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="text-center py-8">
        <h2 className="text-2xl font-bold mb-4 dark:text-white">Ready to make an impact?</h2>
        <Link to="/register" className="btn-primary">Get Started Today</Link>
      </section>
    </div>
  );
}
