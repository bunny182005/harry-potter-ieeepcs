import React, { useState } from 'react';
import welcomeBackgroundImage from '../assets/welcomebackground.png'; 
import { signInWithEmailAndPassword } from '../services/firebase';
import InputField from '../components/InputField';
import PasswordField from '../components/PasswordField';
import MessageDisplay from '../components/MessageDisplay';
import ElectricBorder from '../components/reactbits/ElectricBorder';

const LoginPage = ({ navigateTo }) => {
  const backgroundStyle = {
    backgroundImage: `url(${welcomeBackgroundImage})`,
  };

  const [isLoading, setIsLoading] = useState(false);
  const [message, showMessage] = useState('');
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: '',
  });

  const handleLogin = async () => {
    if (!loginForm.email || !loginForm.password) {
        showMessage('Both your magical identifier and secret phrase are required, young wizard.');
        return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(loginForm.email)) {
      showMessage('Please provide a proper owl post address format.');
      return;
    }

    setIsLoading(true);
    showMessage('');

    const result = await signInWithEmailAndPassword(loginForm.email, loginForm.password);

    if (result.success) {
      showMessage('The magical portal opens! Welcome back, wizard...');
    } else {
      showMessage('The enchantment failed. Please check your credentials and try again.');
    }
    setIsLoading(false);
  };
  
  const updateForm = (field, value) => {
    setLoginForm(prev => ({ ...prev, [field]: value }));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  return (
    <div className="min-h-screen flex items-center bg-cover bg-center justify-center p-4"
    style={backgroundStyle}>
      <ElectricBorder
        className="w-full max-w-md"
        color="#A86523"
        speed={1.2}
        chaos={0.8}
        thickness={12}
        style={{ borderRadius: '1.5rem' }}
      >
        <div className="bg-black/20 backdrop-blur-xl rounded-3xl p-8 shadow-2xl w-full h-full border border-yellow-500/30">
          <div className="text-center mb-8">
            <h2
              className="drop-shadow-lg my-4 text-3xl font-bold text-white mb-2"
              style={{ 
                fontFamily: 'HarryP, serif',
                background: 'linear-gradient(145deg, #FFD700 0%, #B8860B 50%, #8B7355 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                fontSize: '4rem',
                textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
                filter: 'drop-shadow(0 0 15px rgba(212, 175, 55, 0.6))'
              }}
            >
              Login Your Account
            </h2>
            
            
          </div>
          <div className="space-y-6" >
            <InputField 
              type="email" 
              placeholder="Email Address" 
              value={loginForm.email} 
              onChange={(value) => updateForm('email', value)} 
              onKeyPress={handleKeyPress}
              icon="mail" 
              fontFamily="HarryP, serif"
            />
            <PasswordField 
              placeholder="Password" 
              value={loginForm.password} 
              onChange={(value) => updateForm('password', value)} 
              onKeyPress={handleKeyPress}
              fontFamily="HarryP, serif"
            />
            <MessageDisplay message={message} />
            <ElectricBorder
              color="#FFFFFF"
              speed={0.5}
              chaos={0.3}
              thickness={1}
              style={{ borderRadius: '0.75rem' }}
              className="w-full"
            >
              <button 
                onClick={handleLogin} 
                disabled={isLoading} 
                className="w-full  py-3 rounded-xl font-semibold text-lg transform hover:scale-105 transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none backdrop-blur-sm"
                style={{ 
                  fontFamily: 'HarryP, serif',
                  fontSize: '1.5rem',
                  color: 'white',
                  textShadow: '1px 1px 2px rgba(0,0,0,0.8)'
                }}
              >
                {isLoading ? 'Logging in...' : 'Login'}
              </button>
            </ElectricBorder>
            
            <button 
              type="button" 
              onClick={() => navigateTo('forgot-password')} 
              className="w-full text-white/90 hover:text-white py-2 text-center transition-colors text-sm underline"
              style={{ 
                fontFamily: 'HarryP, serif',
                background: 'linear-gradient(145deg, #FFD700 0%, #B8860B 50%, #8B7355 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                fontSize: '1.3rem',
                textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
                filter: 'drop-shadow(0 0 10px rgba(212, 175, 55, 0.5))'
              }}
            >
              Forgot Your Password?
            </button>
            
            <button 
              type="button" 
              onClick={() => navigateTo('home')} 
              className="w-full text-center text-white px-4 hover:text-white py-2 transition-colors"
              style={{ 
                fontFamily: 'HarryP, serif',
                background: 'linear-gradient(145deg, #FFD700 0%, #B8860B 50%, #8B7355 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                fontSize: '1.6rem',
                textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
                filter: 'drop-shadow(0 0 10px rgba(212, 175, 55, 0.5))'
              }}
            >
              Return to the Main Menu
            </button>
          </div>
        </div>
      </ElectricBorder>
    </div>
  );
};

export default LoginPage;