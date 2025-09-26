import React from 'react';
import { CheckCircle } from 'lucide-react';

const SuccessPage = ({ navigateTo }) => {
  return (
    // This uses a similar style to your other form pages
    <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 text-center shadow-2xl w-full max-w-md">
      <div className="flex justify-center mb-4">
        <CheckCircle className="text-green-400" size={64} />
      </div>
      <h1 className="text-3xl font-bold text-white mb-2">
        Login Successful!
      </h1>
      <p className="text-white/80 mb-6">
        Welcome back to the event. You're all set.
      </p>
      <button
        onClick={() => navigateTo('home')} // Or navigate to a 'dashboard' page if you have one
        className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-xl transition-colors"
      >
        Continue
      </button>
    </div>
  );
};

export default SuccessPage;