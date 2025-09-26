import React, { useState, useEffect } from "react";
import {
  subscribeToRoundStatus,
  subscribeToQuestionVisibility,
  getTeamIdForCurrentUser,
  subscribeToContent,
  getTeamPoints,
  checkURLAnswer,
  getTeamHouse,
  getMovieUrlPuzzle
} from "../services/firebase";
import InfoBox from '../components/InfoBox';

import activeBg from "../assets/Sorting_Hat_Round.png";
import inactiveBg from "../assets/Misc_3.png";

const SecretPortalComponent = ({ 
  teamMovie, 
  secretPortalData, 
  userGuess, 
  setUserGuess, 
  handleURLSubmit, 
  message, 
  harryPotterTextStyle 
}) => (
  // This component's internal code remains the same
  <div className="w-full max-w-5xl backdrop-blur-2xl text-white bg-black bg-opacity-30 rounded-2xl p-8 shadow-2xl border border-yellow-600">
      <div className="text-center mb-8">
          <h2 className="text-7xl font-bold mb-6" style={harryPotterTextStyle}>
              🔍 Secret Portal
          </h2>
          {teamMovie && (
            <div className="mb-4">
              <p className="text-xl text-gray-300 mb-1">Your Team's Movie:</p>
              <p className="text-2xl text-yellow-400 font-bold">{teamMovie}</p>
            </div>
          )}
          <p className="text-lg text-gray-300">
              Decode the encrypted URL to unlock your team's specific portal
          </p>
      </div>
      
      <div className="space-y-8">
          <div className="bg-black/40 p-6 rounded-xl border border-yellow-500/30">
              <p className="text-xl text-gray-300 mb-3 font-semibold">Encrypted Portal URL:</p>
              <div className="bg-black/60 p-4 rounded-lg border border-yellow-400/50">
                  <p className="text-yellow-300 font-mono text-lg break-all text-center">
                      {secretPortalData?.encryptedUrl || "Loading encrypted URL for your movie..."}
                  </p>
              </div>
          </div>

          <div className="space-y-6">
              <div className="relative">
                  <input
                      type="text"
                      value={userGuess}
                      onChange={(e) => setUserGuess(e.target.value)}
                      placeholder="Enter the decrypted URL to open your team's portal..."
                      className="w-full p-5 rounded-xl bg-black/60 text-white placeholder-gray-400 border-2 border-yellow-600/50 focus:border-yellow-400 focus:outline-none text-lg transition-all duration-300"
                  />
              </div>
              <button
                  onClick={handleURLSubmit}
                  className="w-full bg-gradient-to-r from-green-700 to-emerald-600 hover:from-green-600 hover:to-emerald-500 p-5 rounded-xl transition-all duration-300 font-bold text-2xl border border-green-400/30 transform hover:scale-105"
                  style={harryPotterTextStyle}
              >
                  ⚡ Open Portal ⚡
              </button>
              {message && (
                  <div className={`text-center font-bold text-xl p-4 rounded-lg ${
                      message.includes('Correct') 
                          ? 'text-green-400 bg-green-900/20 border border-green-400/30' 
                          : 'text-red-400 bg-red-900/20 border border-red-400/30'
                  }`}>
                      {message}
                  </div>
              )}
          </div>
      </div>
  </div>
);

export default function Round3Page() {
  const [isRoundActive, setIsRoundActive] = useState(false);
  const [areQuestionsVisible, setAreQuestionsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [pageContent, setPageContent] = useState(null);
  
  const [secretPortalData, setSecretPortalData] = useState(null);
  const [teamMovie, setTeamMovie] = useState(null);
  const [userGuess, setUserGuess] = useState("");
  const [teamPoints, setTeamPoints] = useState(0);
  const [message, setMessage] = useState("");

  // All this logic remains the same
  useEffect(() => {
    const initializeRound = async () => {
      const teamId = await getTeamIdForCurrentUser();
      if (teamId) {
        const movie = await getTeamHouse(teamId);
        setTeamMovie(movie);
        if (movie) {
          const portalData = await getMovieUrlPuzzle(movie);
          setSecretPortalData(portalData);
        }
        const pointsResult = await getTeamPoints(teamId);
        if (pointsResult.success) {
          setTeamPoints(pointsResult.points);
        }
      }
    };

    setIsLoading(true);

    const unsubMainToggle = subscribeToRoundStatus("round3", (result) => {
      setIsRoundActive(result.isActive);
      if (result.isActive) {
        initializeRound();
      }
    });

    const unsubQuestionToggle = subscribeToQuestionVisibility((result) => {
      setAreQuestionsVisible(result.isVisible);
    });

    const unsubContent = subscribeToContent("round3", (result) => {
      if (result.success) {
        setPageContent(result.data);
      }
      setIsLoading(false);
    });

    return () => {
      unsubMainToggle();
      unsubQuestionToggle();
      unsubContent();
    };
  }, []);

  const handleURLSubmit = async () => {
    if (!userGuess.trim() || !secretPortalData) return;
    const result = checkURLAnswer(userGuess, secretPortalData.decryptedUrl);
    if (result.correct) {
      setMessage("🎉 Correct! The portal opens...");
      window.open(secretPortalData.decryptedUrl, '_blank');
    } else {
      setMessage("❌ Incorrect! The portal remains sealed...");
    }
    setTimeout(() => setMessage(""), 3000);
  };

  const harryPotterTextStyle = {
    fontFamily: 'HarryP, serif',
    background: 'linear-gradient(145deg, #FFD700 0%, #B8860B 50%, #8B7355 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
    textAlign: 'center'
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white z-50">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-yellow-300"></div>
      </div>
    );
  }

  if (!isRoundActive) {
    return (
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat z-0 flex items-center justify-start pl-16"
        style={{ backgroundImage: `url(${inactiveBg})` }}
      >
        <div className="text-white text-center ml-16" style={{ marginTop: '-10vh' }}>
            <div style={{...harryPotterTextStyle, fontSize: '8rem', textAlign: 'left' }}>
                ERROR-
                <span style={{...harryPotterTextStyle, background: 'linear-gradient(145deg, #FF6B6B 0%, #8B0000 50%, #4A0000 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', lineHeight: '0.9' }}>
                  404
                </span>
            </div>
            <div style={{ ...harryPotterTextStyle, fontSize: '4rem', marginTop: '-2rem', textAlign: 'left' }}>
                Round Not Available
            </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="fixed inset-0 bg-cover bg-center bg-no-repeat z-0 overflow-y-auto"
      style={{ backgroundImage: `url(${activeBg})` }}
    >
      {/* FIX: This main container now matches the structure of Round4Page.js */}
      <div className="min-h-screen flex flex-col">
        
        {/* Header section, matches Round4Page */}
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
        
        {/* Grid section, now full-width with padding, matches Round4Page */}
        <div className="grid grid-cols-2 grid-rows-2 w-full p-8 gap-8 pb-16">
            <InfoBox 
              title={pageContent?.goal?.title}
              paragraphs={pageContent?.goal?.paragraphs}
            />
            <div className="opacity-0"></div>
            <div className="opacity-0"></div>
            <InfoBox 
              title={pageContent?.challenges?.title}
              paragraphs={pageContent?.challenges?.paragraphs}
            />
        </div>

        {/* Portal section, centered, matches the structure of Round4Page's button section */}
        <div className="flex flex-col justify-center items-center py-8">
          {areQuestionsVisible ? (
            <SecretPortalComponent
              teamMovie={teamMovie}
              secretPortalData={secretPortalData}
              userGuess={userGuess}
              setUserGuess={setUserGuess}
              handleURLSubmit={handleURLSubmit}
              message={message}
              harryPotterTextStyle={harryPotterTextStyle}
            />
          ) : (
            <div className="w-full max-w-5xl text-center">
              <h2 className="text-6xl" style={harryPotterTextStyle}>
                ⏳ Wait for the Challenge to Begin...
              </h2>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}