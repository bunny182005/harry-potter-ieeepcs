// src/pages/SignupPage.jsx
import React, { useState } from 'react';
import welcomeBackgroundImage from '../assets/welcomebackground.png';
import { signUpWithEmailAndPassword, isEmailAllowed } from '../services/firebase';
import InputField from '../components/InputField';
import PasswordField from '../components/PasswordField';
import MessageDisplay from '../components/MessageDisplay';
import ElectricBorder from '../components/reactbits/ElectricBorder';

const SignupPage = ({ navigateTo, onSignupSuccess }) => {
  const backgroundStyle = {
    backgroundImage: `url(${welcomeBackgroundImage})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  };

  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
  });

  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const updateForm = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    const { email, username, password, confirmPassword } = formData;

    if (!email || !username || !password || !confirmPassword) {
      setMessage('Please fill in all fields.');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setMessage('Please enter a valid email address.');
      return false;
    }

    if (password.length < 6) {
      setMessage('Password must be at least 6 characters long.');
      return false;
    }

    if (password !== confirmPassword) {
      setMessage('Passwords do not match.');
      return false;
    }

    return true;
  };

  const handleSignup = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    setMessage('');

    const { email, password, username } = formData;
    
    // 1. Check if the email is allowed
    const emailIsOnList = await isEmailAllowed(email);

    if (!emailIsOnList) {
      setMessage('This email address is not authorized for signup.');
      setIsLoading(false);
      return;
    }

    // 2. If allowed, proceed with creating the account
    const result = await signUpWithEmailAndPassword(email, password, username);

    if (result.success) {
      setMessage('Account created successfully! Redirecting to login...');
      if (onSignupSuccess) onSignupSuccess();

      setTimeout(() => {
        navigateTo('login');
      }, 2000);
    } else {
      setMessage(result.message || 'Failed to create account. Please try again.');
    }

    setIsLoading(false);
  };
  
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSignup();
    }
  };

  return (
    <div
      className="w-full min-h-screen flex items-center justify-center p-4"
      style={backgroundStyle}
    >
      <ElectricBorder
        className="w-full max-w-lg"
        color="#A86523"
        speed={1.2}
        chaos={0.8}
        thickness={12}
        style={{ borderRadius: '1.5rem' }}
      >
        <div className="bg-black/40 backdrop-blur-lg rounded-3xl p-8 border border-white/20 shadow-2xl w-full">
          <div className="text-center mb-8">
            <h2
              className="text-4xl font-bold text-white mb-3"
              style={{
                fontFamily: 'HarryP, serif',
                background:
                  'linear-gradient(145deg, #FFD700 0%, #B8860B 50%, #8B7355 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontSize: '4rem',
                textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
                filter: 'drop-shadow(0 0 15px rgba(212, 175, 55, 0.6))',
              }}
            >
              Create Your Account
            </h2>
          </div>

          <div className="space-y-6">
            <InputField
              type="text"
              placeholder="Choose a unique username"
              value={formData.username}
              onChange={(value) => updateForm('username', value)}
              onKeyPress={handleKeyPress}
              icon="user"
              fontFamily="HarryP, serif"
            />

            <InputField
              type="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={(value) => updateForm('email', value)}
              onKeyPress={handleKeyPress}
              icon="mail"
              fontFamily="HarryP, serif"
            />

            <PasswordField
              placeholder="Password (6+ characters)"
              value={formData.password}
              onChange={(value) => updateForm('password', value)}
              onKeyPress={handleKeyPress}
              fontFamily="HarryP, serif"
            />

            <PasswordField
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={(value) => updateForm('confirmPassword', value)}
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
                onClick={handleSignup} 
                disabled={isLoading} 
                className="w-full bg-transparent py-3 rounded-xl font-semibold text-lg transform hover:scale-105 transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                style={{ 
                  fontFamily: 'HarryP, serif',
                  fontSize: '1.5rem',
                  color: 'white'
                }}
              >
                {isLoading ? 'Creating...' : 'Create Account'}
              </button>
            </ElectricBorder>
            

            <div className="mt-6 text-center">
              <p className="text-white/70 text-lg" style={{
                fontFamily: 'HarryP, serif',
                background:
                  'linear-gradient(145deg, #FFD700 0%, #B8860B 50%, #8B7355 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontSize: '1.5rem',
                textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
                filter: 'drop-shadow(0 0 15px rgba(212, 175, 55, 0.6))',
              }}>
                Already have an account?{' '}
                <button
                  onClick={() => navigateTo('login')}
                  className="font-semibold transition-colors duration-200"
                  style={{
                    fontFamily: 'HarryP, serif',
                    background:
                      'linear-gradient(145deg, #FFD700 0%, #B8860B 50%, #8B7355 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    fontSize: '1.5rem',
                    textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
                    filter: 'drop-shadow(0 0 15px rgba(212, 175, 55, 0.6))',
                  }}
                >
                  Sign In
                </button>
              </p>
            </div>
          </div>
        </div>
      </ElectricBorder>
    </div>
  );
};

export default SignupPage;