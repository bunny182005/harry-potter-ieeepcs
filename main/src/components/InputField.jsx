// src/components/InputField.jsx
import React from 'react';

const InputField = ({ type, placeholder, value, onChange, onKeyPress, icon, fontFamily }) => {
  return (
    <div className="relative">
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyPress={onKeyPress}
        className="w-full bg-white/10 border-2 border-gray-400/30 rounded-xl py-4 px-12 text-white placeholder-gray-300 focus:border-white focus:outline-none transition-all duration-300"
        style={{
          fontFamily: fontFamily || 'inherit',
          fontSize: '1.2rem'
        }}
      />
      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
        {icon === 'user' && (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        )}
        {icon === 'mail' && (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        )}
      </div>
    </div>
  );
};

export default InputField;