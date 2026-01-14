
import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-[#F5F5DC]">
      <header className="bg-[#2D5A27] text-[#F5F5DC] py-6 shadow-md sticky top-0 z-50">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <i className="fas fa-scissors text-2xl"></i>
            <h1 className="text-3xl font-bold tracking-tight">Hair.io</h1>
          </div>
          <p className="hidden md:block italic opacity-80">AI Hairstyle Studio</p>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 py-8 max-w-6xl">
        {children}
      </main>

      <footer className="bg-[#2D5A27] text-[#F5F5DC] py-8 border-t border-green-800 mt-12">
        <div className="container mx-auto px-4 text-center">
          <p className="mb-2 font-semibold">© 2024 Hair.io Studio</p>
          <div className="flex justify-center gap-6 text-sm opacity-70">
            <a href="#" className="hover:underline">Privacy</a>
            <a href="#" className="hover:underline">Terms</a>
            <a href="#" className="hover:underline">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
