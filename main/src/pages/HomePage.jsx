// src/pages/HomePage.jsx
import React from 'react';
import welcomeBackgroundImage from '../assets/welcomebackground.png';

const HomePage = ({ navigateTo }) => {
  const backgroundStyle = {
    backgroundImage: `url(${welcomeBackgroundImage})`,
  };

  return (
    <div
      className="min-h-screen w-screen flex flex-col items-center justify-center bg-cover bg-center bg-no-repeat"
      style={backgroundStyle}
    >
      <div className="text-center text-white px-4">
        {/* Main Title */}
      <h1
  className="drop-shadow-lg my-4"
  style={{ 
    fontFamily: 'HarryP, serif',
    background: 'linear-gradient(145deg, #FFD700 0%, #B8860B 50%, #8B7355 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    fontSize: '14rem',
    textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
    filter: 'drop-shadow(0 0 15px rgba(212, 175, 55, 0.6))'
  }}
>
  PotterNoVa
</h1>

        
        {/* Buttons Container */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-28 mt-12">
          <button 
            onClick={() => navigateTo('login')} 
            className="bg-transparent border-0 cursor-pointer transition-transform hover:scale-105"
             style={{ 
    fontFamily: 'HarryP, serif',
    background: 'linear-gradient(145deg, #FFD700 0%, #B8860B 50%, #8B7355 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    fontSize: '3.5rem',
    textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
    filter: 'drop-shadow(0 0 15px rgba(212, 175, 55, 0.6))'
  }}
>
            Login
          </button>
          
          <button 
            onClick={() => navigateTo('signup')} 
            className="bg-transparent ml-9 border-0 cursor-pointer transition-transform hover:scale-105"
            style={{ 
    fontFamily: 'HarryP, serif',
    background: 'linear-gradient(145deg, #FFD700 0%, #B8860B 50%, #8B7355 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    fontSize: '3.5rem',
    textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
    filter: 'drop-shadow(0 0 15px rgba(212, 175, 55, 0.6))'
  }}
>
            Create Account
          </button>
        </div>
      </div>
    </div>
  );
};

export default HomePage;