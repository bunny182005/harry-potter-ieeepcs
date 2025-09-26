import React from 'react';
import InputField from './InputField'; // Make sure the path is correct

// This is now a "dumb" component. It only displays what it's told.
const CaptchaField = ({ captchaText, onRefresh, value, onChange }) => {
  return (
    <div className="flex items-center space-x-4">
      <div className="flex-grow">
        <InputField
          type="text"
          placeholder="Enter CAPTCHA"
          value={value}
          onChange={onChange}
          icon="lock"
        />
      </div>
      <div 
        className="bg-white/20 text-white font-bold text-center px-4 py-2 rounded-xl text-lg tracking-widest cursor-pointer select-none"
        onClick={onRefresh} // When clicked, it tells the parent to refresh.
        style={{ fontFamily: 'monospace' }}
      >
        {captchaText} {/* It displays the text given by the parent. */}
      </div>
    </div>
  );
};

export default CaptchaField;