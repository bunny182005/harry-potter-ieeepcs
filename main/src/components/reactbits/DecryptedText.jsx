import React, { useState, useEffect } from 'react';

const DecryptedText = ({ 
  text = "", 
  speed = 50, 
  maxIterations = 20, 
  characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*", 
  className = "",
  parentClassName = "",
  encryptedClassName = "",
  animateOn = "view",
  revealDirection = "start"
}) => {
  const [displayText, setDisplayText] = useState('');
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    if (!text) return;

    if (animateOn === "view" && !hasAnimated) {
      startAnimation();
      setHasAnimated(true);
    } else if (animateOn === "hover") {
      setDisplayText(text.split('').map(() => 
        characters[Math.floor(Math.random() * characters.length)]
      ).join(''));
    }
  }, [text, animateOn]);

  const startAnimation = () => {
    if (!text) return;
    
    setIsDecrypting(true);
    let iteration = 0;
    const maxIter = maxIterations || text.length * 2;

    const interval = setInterval(() => {
      setDisplayText(() => {
        return text.split('').map((char, index) => {
          if (char === ' ') return ' ';
          
          // Reveal logic based on direction
          let shouldReveal = false;
          if (revealDirection === "center") {
            const center = Math.floor(text.length / 2);
            const distance = Math.abs(index - center);
            shouldReveal = distance <= iteration / 2;
          } else {
            shouldReveal = index < iteration / 2;
          }
          
          if (shouldReveal) {
            return char;
          }
          
          return characters[Math.floor(Math.random() * characters.length)];
        }).join('');
      });

      iteration++;

      if (iteration >= maxIter) {
        setDisplayText(text);
        setIsDecrypting(false);
        clearInterval(interval);
      }
    }, speed);

    return () => clearInterval(interval);
  };

  const handleMouseEnter = () => {
    if (animateOn === "hover") {
      startAnimation();
    }
  };

  return (
    <span 
      className={`${parentClassName} ${className}`}
      onMouseEnter={handleMouseEnter}
    >
      <span className={isDecrypting ? encryptedClassName : ""}>
        {displayText || text}
      </span>
    </span>
  );
};

export default DecryptedText;