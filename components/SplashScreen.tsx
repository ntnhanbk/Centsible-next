"use client";

import { PiggyBank } from 'lucide-react';

export function SplashScreen() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-600 text-white h-full w-full absolute inset-0 z-50">
      <div className="flex flex-col items-center animate-out fade-out duration-1000 delay-1000">
        <div className="h-24 w-24 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center mb-6 shadow-2xl animate-bounce">
          <PiggyBank className="h-12 w-12 text-white" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight mb-2">Centsible</h1>
        <p className="text-emerald-50 text-sm font-medium">Your Smart Financial Companion</p>
      </div>

      <div className="absolute bottom-12 flex space-x-2">
        <div className="h-2 w-2 bg-white rounded-full animate-bounce [animation-delay:-0.3s]"></div>
        <div className="h-2 w-2 bg-white rounded-full animate-bounce [animation-delay:-0.15s]"></div>
        <div className="h-2 w-2 bg-white rounded-full animate-bounce"></div>
      </div>
    </div>
  );
}
