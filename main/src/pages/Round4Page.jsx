import React, { useState, useEffect } from "react";
import {
  subscribeToRoundStatus,
  onAuthChange,
  getUserProfile,
  getUserTeam,
  getRoundLinks,
  subscribeToContent,
} from "../services/firebase";
import { getTeamHackerrankLink } from "../utils/redirect";
import InfoBox from '../components/InfoBox'; // ✅ IMPORT the InfoBox component

import activeBg from "../assets/Round_a.png";
import inactiveBg from "../assets/Misc_3.png";

export default function Round4Page() {
  const [isRoundActive, setIsRoundActive] = useState(false);
  const [teamName, setTeamName] = useState("");
  const [hackerrankLinks, setHackerrankLinks] = useState([]);
  const [pageContent, setPageContent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [redirectError, setRedirectError] = useState("");

  useEffect(() => {
    const initializePage = async () => {
      setIsLoading(true);
      try {
        const links = await getRoundLinks("round4");
        if (links) setHackerrankLinks(links);
      } catch (error) {
        console.error("Error fetching round links:", error);
      }
    };

    initializePage();

    const unsubRoundStatus = subscribeToRoundStatus("round4", (result) => {
      if (result.success) {
        setIsRoundActive(result.isActive);
      }
    });

    const unsubContent = subscribeToContent("round4", (result) => {
      if (result.success) setPageContent(result.data);
    });

    const unsubAuth = onAuthChange(async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const profile = await getUserProfile(firebaseUser.uid);
          if (profile.success && profile.userData.teamId) {
            const team = await getUserTeam(profile.userData.teamId);
            if (team && team.teamName) setTeamName(team.teamName);
          }
        } catch (error) {
          console.error("Error fetching user/team data:", error);
        }
      } else {
        setTeamName("");
      }
      setIsLoading(false);
    });

    return () => {
      unsubRoundStatus();
      unsubContent();
      unsubAuth();
    };
  }, []);

  const handleRedirect = () => {
    setRedirectError(""); // Clear previous errors
    
    if (!teamName) {
      const errorMsg = "Team name not found. Please make sure you're logged in and part of a team.";
      setRedirectError(errorMsg);
      alert(errorMsg);
      return;
    }
    
    if (!hackerrankLinks || hackerrankLinks.length === 0) {
      const errorMsg = "Challenge links not available. Please try again later.";
      setRedirectError(errorMsg);
      alert(errorMsg);
      return;
    }
    
    try {
      const link = getTeamHackerrankLink(teamName, hackerrankLinks);
      
      if (link) {
        window.open(link, '_blank', 'noopener,noreferrer');
      } else {
        const errorMsg = "Could not generate challenge link for your team. Please contact support.";
        setRedirectError(errorMsg);
        alert(errorMsg);
      }
    } catch (error) {
      console.error("Redirect error:", error);
      const errorMsg = "An error occurred while generating the challenge link.";
      setRedirectError(errorMsg);
      alert(errorMsg);
    }
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-transparent z-50">
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
          {/* Error 404 Display */}
          <div className="text-white text-center ml-16" style={{ marginTop: '-10vh' }}>
            <div style={{ fontFamily: 'HarryP, serif', background: 'linear-gradient(145deg, #FFD700 0%, #B8860B 50%, #8B7355 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontSize: '8rem', textShadow: '2px 2px 4px rgba(0,0,0,0.8)', filter: 'drop-shadow(0 0 15px rgba(212, 175, 55, 0.6))', marginTop: '-2rem' }}>
              ERROR-
              <span style={{ fontFamily: 'HarryP, serif', background: 'linear-gradient(145deg, #FF6B6B 0%, #8B0000 50%, #4A0000 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontSize: '8rem', textShadow: '2px 2px 4px rgba(0,0,0,0.8)', filter: 'drop-shadow(0 0 15px rgba(255, 0, 0, 0.6))', lineHeight: '0.9' }}>
                404
              </span>
            </div>
            <div style={{ fontFamily: 'HarryP, serif', background: 'linear-gradient(145deg, #FFD700 0%, #B8860B 50%, #8B7355 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontSize: '4rem', textShadow: '2px 2px 4px rgba(0,0,0,0.8)', filter: 'drop-shadow(0 0 15px rgba(212, 175, 55, 0.6))', marginTop: '-2rem' }}>
              Round Not Available
            </div>
          </div>
        </div>
      );
    }

  const harryPotterTextStyle = {
    fontFamily: "HarryP, serif",
    background: "linear-gradient(145deg, #FFD700 0%, #B8860B 50%, #8B7355 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    textShadow: "2px 2px 4px rgba(0,0,0,0.8)",
    textAlign: 'center'
  };

  return (
    <div
      className="fixed inset-0 bg-cover bg-center bg-no-repeat z-0 overflow-y-auto"
      style={{ backgroundImage: `url(${activeBg})` }}
    >
      <div className="min-h-screen flex flex-col">
        {/* Error Message Display */}
        {redirectError && (
          <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-red-600 bg-opacity-90 text-white p-4 rounded-lg z-50 max-w-md">
            <p className="text-center font-bold">{redirectError}</p>
          </div>
        )}
        
        {/* ✅ Centered Header */}
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
          {/* ✅ InfoBox for Goal */}
          <InfoBox 
            title={pageContent?.goal?.title}
            paragraphs={pageContent?.goal?.paragraphs}
          />

          <div className="opacity-0"></div>
          <div className="opacity-0"></div>

          {/* ✅ InfoBox for Challenges */}
          <InfoBox 
            title={pageContent?.challenges?.title}
            paragraphs={pageContent?.challenges?.paragraphs}
          />
        </div>

        <div className="flex flex-col justify-center items-center py-8 space-y-4">
          <button
            onClick={handleRedirect}
            disabled={!teamName || isLoading || !hackerrankLinks || hackerrankLinks.length === 0}
            className="px-16 py-8 rounded-2xl transition-all duration-300 transform hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
            style={harryPotterTextStyle}
          >
            <h2 className="text-7xl font-bold">Begin Challenge</h2>
          </button>
          
          {(!teamName || !hackerrankLinks || hackerrankLinks.length === 0) && (
            <div className="text-white text-center max-w-2xl bg-black bg-opacity-50 p-4 rounded-lg">
              <p className="text-lg">
                {!teamName ? "Please make sure you're logged in and part of a team." : 
                 !hackerrankLinks || hackerrankLinks.length === 0 ? "Challenge links are being prepared. Please try again later." : 
                 "Ready to begin the challenge!"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
