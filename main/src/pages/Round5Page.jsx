import React, { useState, useEffect } from "react";
import { 
  subscribeToRoundStatus, 
  subscribeToAllQuestions, 
  subscribeToQuestionToggles,
  subscribeToContent,
  fetchQuestionWithTestCases
} from "../services/firebase";
import QuestionDetailView from "../components/QuestionDetailView";
import InfoBox from '../components/InfoBox'; // ✅ IMPORT the InfoBox component

import activeBg from "../assets/Muggle_Magic_Round.png";
import inactiveBg from "../assets/Misc_3.png";

export default function Round5Page() {
  const [isRoundActive, setIsRoundActive] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [questions, setQuestions] = useState([]);
  const [toggles, setToggles] = useState({});
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [pageContent, setPageContent] = useState(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);

  useEffect(() => {
    const unsubscribeRound = subscribeToRoundStatus("round5", (result) => {
      if (result.success) {
        setIsRoundActive(result.isActive);
      } else {
        setIsRoundActive(false);
      }
      setIsLoading(false); 
    });

    const unsubscribeQuestions = subscribeToAllQuestions((result) => {
      if (result.success) setQuestions(result.questions);
    });

    const unsubscribeToggles = subscribeToQuestionToggles((result) => {
      if (result.success) setToggles(result.toggles);
    });

    const unsubscribeContent = subscribeToContent("round5", (result) => {
      if (result.success) {
        setPageContent(result.data);
      }
    });

    return () => {
      unsubscribeRound();
      unsubscribeQuestions();
      unsubscribeToggles();
      unsubscribeContent();
    };
  }, []);

  useEffect(() => {
    if (selectedQuestion && toggles[selectedQuestion.id] !== true) {
      alert(`The administrator has locked "${selectedQuestion.title}".`);
      setSelectedQuestion(null);
    }
  }, [toggles, selectedQuestion]);
  
  const handleQuestionClick = async (question, isLinkActive) => {
    if (isLinkActive) {
      setIsDetailLoading(true);
      const fullQuestionData = await fetchQuestionWithTestCases(question.id);
      setIsDetailLoading(false);
      
      if (fullQuestionData) {
        setSelectedQuestion(fullQuestionData);
      } else {
        alert("Could not load question details. Please try again.");
      }
    } else {
      alert("This question is not active yet. Please wait!");
    }
  };

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
    fontFamily: 'HarryP, serif',
    background: 'linear-gradient(145deg, #FFD700 0%, #B8860B 50%, #8B7355 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
    filter: 'drop-shadow(0 0 15px rgba(212, 175, 55, 0.6))',
    textAlign: 'center'
  };

  const boxes = Array.from({ length: 100 }, (_, index) => {
    const question = questions[index];
    const isLinkActive = question ? toggles[question.id] === true : false;
    
    return (
      <div
        key={index}
        className={`backdrop-blur-md rounded-lg p-2 shadow-lg border-2 min-h-[80px] flex items-center justify-center text-center cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-yellow-400/50 ${isLinkActive ? "border-green-400 bg-green-900/30" : "border-red-400 bg-red-900/30"}`}
        onClick={() => question && handleQuestionClick(question, isLinkActive)}
      >
        {question ? (
          <div>
            <p className="text-white text-xs font-semibold leading-tight">{question.title}</p>
            <p className={`text-xs mt-1 ${isLinkActive ? 'text-green-300' : 'text-red-300'}`}>
              {isLinkActive ? 'Active' : 'Locked'}
            </p>
          </div>
        ) : (
          <p className="text-gray-500 text-xs">...</p>
        )}
      </div>
    );
  });

   return (
    <div 
      className="fixed inset-0 bg-cover bg-center bg-no-repeat z-0 overflow-y-auto"
      style={{ backgroundImage: `url(${activeBg})` }}
    >
      <div className="min-h-screen flex flex-col">
        {/* ✅ Centered Header */}
        <div className="h-1/5 mt-20 w-full flex flex-col justify-center items-center">
            <h1 style={{ ...harryPotterTextStyle, fontSize: '10rem', lineHeight: '1' }}>
                {pageContent?.title }
            </h1>
            {pageContent?.subtitle && (
                <h2 style={{ ...harryPotterTextStyle, fontSize: '9rem' }}>
                    {pageContent.subtitle}
                </h2>
            )}
        </div>
        
        {/* Goal and Challenges grid */}
        <div className="grid grid-cols-2 grid-rows-2 w-full p-8 gap-8 pb-16">
          {/* ✅ InfoBox for Goal */}
          <InfoBox 
            title={pageContent?.goal?.title || "Goal"}
            paragraphs={pageContent?.goal?.paragraphs}
          />

          <div className="opacity-0"></div>
          <div className="opacity-0"></div>

          {/* ✅ InfoBox for Challenges */}
          <InfoBox 
            title={pageContent?.challenges?.title || "Challenges"}
            paragraphs={pageContent?.challenges?.paragraphs}
          />
        </div>

        {/* 10x10 Grid of question boxes */}
        <div className="w-full mt-5 p-8">
          <h2 className="text-8xl font-bold text-center mb-8" style={harryPotterTextStyle}>
            Questions Grid
          </h2>
          <div className="grid grid-cols-10 gap-2 w-full">
            {boxes}
          </div>
        </div>
      </div>

      {/* Question Detail View Modal */}
      {selectedQuestion && (
        <QuestionDetailView
          question={selectedQuestion}
          onClose={() => setSelectedQuestion(null)}
        />
      )}

      {/* Loading overlay for when fetching question details */}
      {isDetailLoading && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-yellow-400"></div>
        </div>
      )}
    </div>
  );
}
