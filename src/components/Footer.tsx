import React from 'react';
import { Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white py-4 px-6">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center text-sm">
        <div className="flex items-center mb-2 md:mb-0">
          <span>Developed with</span>
          <Heart className="w-4 h-4 text-red-500 mx-1" />
          <span>by Julio Campos Machado</span>
        </div>
        <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
          <a
            href="https://likelook.wixsite.com/solutions"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-blue-400 transition-colors"
          >
            Like Look Solutions
          </a>
          <a
            href="https://wa.me/5511992946628"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-green-400 transition-colors"
          >
            WhatsApp: (11) 99294-6628
          </a>
        </div>
      </div>
    </footer>
  );
}