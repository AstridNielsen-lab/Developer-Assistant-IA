import React, { useState } from 'react';
import { UserCircle } from 'lucide-react';

interface UserSetupProps {
  onComplete: (name: string) => void;
}

export default function UserSetup({ onComplete }: UserSetupProps) {
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onComplete(name.trim());
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex flex-col items-center mb-6">
          <UserCircle className="w-16 h-16 text-blue-500 mb-4" />
          <h2 className="text-2xl font-bold text-gray-800">Bem-vindo(a)!</h2>
          <p className="text-gray-600 text-center mt-2">
            Para uma experiência mais personalizada, por favor me diga seu nome
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Como posso te chamar?
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Digite seu nome"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Começar
          </button>
        </form>
      </div>
    </div>
  );
}