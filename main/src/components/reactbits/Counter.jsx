// Counter.jsx - Complete component
import React, { useState, useEffect } from 'react';

const Counter = ({ 
  value = 0, 
  places = [1], 
  fontSize = 24, 
  padding = 2, 
  gap = 5, 
  textColor = "#000000", 
  fontWeight = 400,
  className = ""
}) => {
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    setDisplayValue(value);
  }, [value]);

  // Convert number to array based on places
  const getDigits = (num, places) => {
    const digits = [];
    let remaining = Math.abs(num);
    
    for (let i = places.length - 1; i >= 0; i--) {
      const place = places[i];
      const digit = Math.floor(remaining / place) % 10;
      digits.push(digit);
      remaining -= digit * place;
    }
    
    return digits;
  };

  const digits = getDigits(displayValue, places);

  return (
    <div 
      className={`inline-flex items-center ${className}`}
      style={{ gap: `${gap}px` }}
    >
      {digits.map((digit, index) => (
        <div
          key={index}
          style={{
            fontSize: `${fontSize}px`,
            color: textColor,
            fontWeight: fontWeight,
            padding: `${padding}px`,
            transition: 'all 0.3s ease',
            minWidth: `${fontSize * 0.6}px`,
            textAlign: 'center'
          }}
        >
          {digit}
        </div>
      ))}
    </div>
  );
};

export default Counter;