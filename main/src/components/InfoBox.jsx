import React from 'react';

const InfoBox = ({ title, paragraphs }) => {
  
  const goldenTitleStyle = {
    fontFamily: 'HarryP, serif',
    background: 'linear-gradient(145deg, #FFD700, #B8860B)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
  };

  // This function finds text wrapped in **...** and makes it golden.
  const renderTextWithHighlights = (text) => {
    // Split the text by the markers, but keep the markers in the array
    const parts = text.split(/(\*\*.*?\*\*)/g);
    
    return parts.map((part, index) => {
      // If the part is a marker, style it as golden text
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <span key={index} className="text-yellow-400 font-semibold">
            {part.substring(2, part.length - 2)}
          </span>
        );
      }
      // Otherwise, it's just regular text
      return part;
    });
  };

  return (
    <div className="backdrop-blur-xl bg-black bg-opacity-30 rounded-2xl p-6 shadow-lg border border-yellow-600 overflow-y-auto h-96">
      
      <div className="text-center mb-4">
        <h2 className="text-6xl font-bold" style={goldenTitleStyle}>
          {title}
        </h2>
      </div>
      
      <div className="text-left space-y-4">
        {(paragraphs || []).map((p, index) => (
          <p key={index} className="text-white text-lg leading-relaxed">
            {renderTextWithHighlights(p)}
          </p>
        ))}
      </div>
    </div>
  );
};

export default InfoBox;