
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-white shadow-md w-full p-4 flex items-center z-10">
      <div className="relative">
        <img
          src="https://picsum.photos/seed/laura-ai/40/40"
          alt="Laura's Avatar"
          className="w-10 h-10 rounded-full object-cover"
        />
        <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-green-400 ring-2 ring-white"></span>
      </div>
      <div className="ml-4">
        <h1 className="text-lg font-bold text-gray-800">Laura AI</h1>
        <p className="text-xs text-green-500 font-semibold">Online</p>
      </div>
    </header>
  );
};

export default Header;
