import React from 'react';
import { Search, ShoppingCart, Heart } from 'lucide-react';

export default function Topbar() {
  return (
    <header className="topbar">
      <a href="/" className="icon-btn plain">
        <img src="/logo.svg" alt="Logo" style={{ height: '24px' }} />
      </a>
      <div className="flex-1" />
      <button className="icon-btn plain">
        <Search size={20} />
      </button>
      <button className="icon-btn plain">
        <Heart size={20} />
      </button>
      <button className="icon-btn plain">
        <ShoppingCart size={20} />
        <span className="cart-badge">0</span>
      </button>
    </header>
  );
}
