import React, { useState, useEffect } from "react";
import { subscribeToRoundStatus, subscribeToContent } from "../services/firebase";
import InfoBox from '../components/InfoBox'; // The InfoBox component is imported here

// Import two different background images
import activeBg from "../assets/Muggle_Magic_Round.png"; // Background when round is active
import inactiveBg from "../assets/Misc_3.png"; // Background when round is NOT active

export default function Round2Page() {
  const [isRoundActive, setIsRoundActive] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [pageContent, setPageContent] = useState(null);

  useEffect(() => {
      const unsubRoundStatus = subscribeToRoundStatus("round2", (result) => {
        if (result.success) {
          setIsRoundActive(result.isActive);
        } else {
          console.error(result.message);
          setIsRoundActive(false);
        }
      });
  
      const unsubContent = subscribeToContent("round2", (result) => {
        if (result.success) {
          setPageContent(result.data);
        } else {
          console.error(result.message);
          setPageContent(null);
        }
        setIsLoading(false);
      });
  
      return () => {
        unsubRoundStatus();
        unsubContent();
      };
    }, []);

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-transparent text-white z-50">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-300"></div>
      </div>
    );
  }

  if (!isRoundActive) {
    return (
      <div 
              className="fixed inset-0 bg-cover bg-center bg-no-repeat z-0 flex items-center justify-start pl-16"
              style={{ backgroundImage: `url(${inactiveBg})` }}
            >
              {/* Error 404 Display - Left Side Middle */}
              <div className="text-white text-center ml-16" style={{ marginTop: '-10vh' }}>
                <div style={{ 
                  fontFamily: 'HarryP, serif',
                  background: 'linear-gradient(145deg, #FFD700 0%, #B8860B 50%, #8B7355 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  fontSize: '8rem',
                  textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
                  filter: 'drop-shadow(0 0 15px rgba(212, 175, 55, 0.6))',
                  marginTop: '-2rem'
                }}>
                  ERROR-
               
                <span style={{ 
                  fontFamily: 'HarryP, serif',
                  background: 'linear-gradient(145deg, #FF6B6B 0%, #8B0000 50%, #4A0000 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  fontSize: '8rem',
                  textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
                  filter: 'drop-shadow(0 0 15px rgba(255, 0, 0, 0.6))',
                  lineHeight: '0.9'
                }}>
                  404
                </span>
                  </div>
                <div style={{ 
                  fontFamily: 'HarryP, serif',
                  background: 'linear-gradient(145deg, #FFD700 0%, #B8860B 50%, #8B7355 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  fontSize: '4rem',
                  textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
                  filter: 'drop-shadow(0 0 15px rgba(212, 175, 55, 0.6))',
                  marginTop: '-2rem'
                }}>
                  Round Not Available
                </div>
                
              </div>
            </div>
    );
  }

  const harryPotterTextStyle = { 
    fontFamily: 'HarryP, serif',
    background: 'linear-gradient(145deg, #FFD700 0%, #B8860B 50%, #8B7355 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
    filter: 'drop-shadow(0 0 15px rgba(212, 175, 55, 0.6))',
    textAlign: 'center'
  };

  return (
    <div 
      className="fixed inset-0 bg-cover bg-center bg-no-repeat z-0 overflow-y-auto"
      style={{ backgroundImage: `url(${activeBg})` }}
    >
      <div className="min-h-screen flex flex-col">
        {/* Centered Header */}
        <div className="h-1/5 mt-20 w-full flex flex-col justify-center items-center">
            <h1 style={{ ...harryPotterTextStyle, fontSize: '10rem', lineHeight: '1' }}>
                {pageContent?.title}
            </h1>
            {pageContent?.subtitle && (
                <h2 style={{ ...harryPotterTextStyle, fontSize: '9rem' }}>
                    {pageContent.subtitle}
                </h2>
            )}
        </div>
        
        <div className="grid grid-cols-2 grid-rows-2 w-full p-8 gap-8 pb-16">
          
          {/* InfoBox component for the Goal section */}
          <InfoBox 
            title={pageContent?.goal?.title}
            paragraphs={pageContent?.goal?.paragraphs}
          />

          {/* Invisible spacer divs */}
          <div className="opacity-0"></div>
          <div className="opacity-0"></div>

          {/* InfoBox component for the Challenges section */}
          <InfoBox 
            title={pageContent?.challenges?.title}
            paragraphs={pageContent?.challenges?.paragraphs}
          />
        </div>
      </div>
    </div>
  );
}

