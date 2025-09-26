import React, { useState } from 'react';
import { resetPassword } from '../services/firebase';
import InputField from '../components/InputField';
import MessageDisplay from '../components/MessageDisplay';
import bg from "../assets/welcomebackground.png"; // Corrected the import path

const ForgotPasswordPage = ({ navigateTo }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [message, showMessage] = useState('');
  const [email, setEmail] = useState('');
  const [emailSent, setEmailSent] = useState(false);

  const handleResetPassword = async () => {
    if (!email) {
      showMessage('Please enter your email address.');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showMessage('Please enter a valid email address.');
      return;
    }

    setIsLoading(true);
    showMessage('');

    const result = await resetPassword(email);

    if (result.success) {
      setEmailSent(true);
      showMessage('Password reset email sent! Check your inbox and spam folder.');
    } else {
      showMessage(result.message);
    }
    setIsLoading(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleResetPassword();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-900 via-teal-900 to-emerald-900 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 shadow-2xl w-full max-w-md">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">Reset Password</h2>
          <p className="text-white/80">Enter your email to receive reset instructions</p>
        </div>
        
        <div className="space-y-6">
          {!emailSent ? (
            <>
              <InputField 
                type="email" 
                placeholder="Enter your email address" 
                value={email} 
                onChange={setEmail}
                onKeyPress={handleKeyPress}
                icon="mail" 
              />
              <MessageDisplay message={message} />
              <button 
                onClick={handleResetPassword} 
                disabled={isLoading} 
                className="w-full bg-gradient-to-r from-teal-500 to-cyan-600 text-white py-3 rounded-xl font-semibold text-lg hover:from-teal-600 hover:to-cyan-700 transform hover:scale-105 transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isLoading ? 'Sending...' : 'Send Reset Email'}
              </button>
            </>
          ) : (
            <>
              <div className="text-center p-6">
                <div className="w-16 h-16 mx-auto mb-4 bg-green-500/20 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Email Sent!</h3>
                <p className="text-white/80 text-sm mb-4" style={{ 
    fontFamily: 'HarryP, serif',
    background: 'linear-gradient(145deg, #FFD700 0%, #B8860B 50%, #8B7355 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    fontSize: '2rem',
    textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
    filter: 'drop-shadow(0 0 15px rgba(212, 175, 55, 0.6))'
  }}>
                  We've sent a password reset link to <strong>{email}</strong>
                </p>
                <p className="text-white/60 text-xs" style={{ 
    fontFamily: 'HarryP, serif',
    background: 'linear-gradient(145deg, #FFD700 0%, #B8860B 50%, #8B7355 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    fontSize: '2rem',
    textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
    filter: 'drop-shadow(0 0 15px rgba(212, 175, 55, 0.6))'
  }}>
                  Don't see the email? Check your spam folder or wait a few minutes.
                </p>
              </div>
              <MessageDisplay message={message} />
              <button 
                onClick={() => {
                  setEmailSent(false);
                  setEmail('');
                  showMessage('');
                }} 
                className="w-full bg-white/10 text-white py-3 rounded-xl font-semibold text-lg hover:bg-white/20 transition-all duration-200 border border-white/20"
              >
                Send Another Email
              </button>
            </>
          )}
          
          <button 
            type="button" 
            onClick={() => navigateTo('login')} 
            className="w-full text-white/80 hover:text-white py-2 text-center transition-colors"
          >
            Back to Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;