import React, { useState, useEffect } from "react";
import { subscribeToRoundStatus, subscribeToAllQuestions, subscribeToQuestionToggles } from "../services/firebase";
import QuestionDetailView from "../components/QuestionDetailView";

// Import two different background images
import activeBg from "../assets/Muggle_Magic_Round.png"; // Background when round is active
import inactiveBg from "../assets/Misc_3.png"; // Background when round is NOT active

export default function Round5Page() {
  const [isRoundActive, setIsRoundActive] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [questions, setQuestions] = useState([]);
  const [toggles, setToggles] = useState({});
  const [selectedQuestion, setSelectedQuestion] = useState(null);

  useEffect(() => {
    const unsubscribeRound = subscribeToRoundStatus("round5", (result) => {
      if (result.success) {
        setIsRoundActive(result.isActive);
      } else {
        setIsRoundActive(false);
        console.error(result.message);
      }
      setIsLoading(false);
    });

    const unsubscribeQuestions = subscribeToAllQuestions((result) => {
      if (result.success) setQuestions(result.questions);
    });

    const unsubscribeToggles = subscribeToQuestionToggles((result) => {
      if (result.success) setToggles(result.toggles);
    });

    return () => {
      unsubscribeRound();
      unsubscribeQuestions();
      unsubscribeToggles();
    };
  }, []);

  // This effect automatically closes the view if an admin locks the question
  useEffect(() => {
    if (selectedQuestion && toggles[selectedQuestion.id] !== true) {
      alert(`The administrator has locked "${selectedQuestion.title}".`);
      setSelectedQuestion(null);
    }
  }, [toggles, selectedQuestion]);

  // This function is called when a question box is clicked
  const handleQuestionClick = (question, isLinkActive) => {
    if (isLinkActive) {
      setSelectedQuestion(question);
    } else {
      alert("This question is not active yet. Please wait!");
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-transparent text-white z-0">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-300"></div>
      </div>
    );
  }

  // If round is NOT active
  if (!isRoundActive) {
    return (
      <div 
        className="fixed inset-0 bg-cover bg-center bg-no-repeat z-0"
        style={{ backgroundImage: `url(${inactiveBg})` }}
      >
        
      </div>
    );
  }

  // Harry Potter font style
  const harryPotterTextStyle = { 
    fontFamily: 'HarryP, serif',
    background: 'linear-gradient(145deg, #FFD700 0%, #B8860B 50%, #8B7355 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
    filter: 'drop-shadow(0 0 15px rgba(212, 175, 55, 0.6))'
  };

  // Create 100 boxes for the 10x10 grid with questions
  const boxes = Array.from({ length: 100 }, (_, index) => {
    const question = questions[index];
    const isLinkActive = question ? toggles[question.id] === true : false;
    
    return (
      <div
        key={index}
        className={`
          backdrop-blur-md rounded-lg p-2 shadow-lg border-2 min-h-[80px] flex items-center justify-center cursor-pointer
          transition-all duration-300 hover:scale-105
          ${isLinkActive 
            ? "bg-green-500 bg-opacity-30 border-green-500" 
            : "bg-red-500 bg-opacity-30 border-red-500"
          }
        `}
        onClick={() => question && handleQuestionClick(question, isLinkActive)}
      >
        {question ? (
          <div className="text-center">
            <p className="text-white text-xs font-semibold">{question.title}</p>
            <p className={`text-xs ${isLinkActive ? 'text-green-200' : 'text-red-200'}`}>
              {isLinkActive ? 'Active' : 'Locked'}
            </p>
          </div>
        ) : (
          <p className="text-gray-400 text-xs">Question {index + 1}</p>
        )}
      </div>
    );
  });

  // If round IS active
  return (
    <div 
      className="fixed inset-0 bg-cover bg-center bg-no-repeat z-0 overflow-y-auto"
      style={{ backgroundImage: `url(${activeBg})` }}
    >
      {/* Top 25% empty space */}
      <div className="h-1/5 ml-16 flex items-center" style={{ 
        fontFamily: 'HarryP, serif',
        background: 'linear-gradient(145deg, #FFD700 0%, #B8860B 50%, #8B7355 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        fontSize: '10rem',
        textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
        filter: 'drop-shadow(0 0 15px rgba(212, 175, 55, 0.6))'
      }}>
        =05=
      </div>
      
      {/* Grid Layout - Takes 75% of screen height */}
      <div className="grid grid-cols-2 grid-rows-2 h-3/4 w-full p-8 gap-8">
        {/* Box 1 - Goal (visible) */}
        <div className="backdrop-blur-2xl text-white bg-opacity-50 rounded-2xl p-6 shadow-xl overflow-y-auto">
          <div className="text-center mb-4">
            <h2 className="text-6xl font-bold" style={harryPotterTextStyle}>
              Goal
            </h2>
          </div>
          <div className="text-left">
            <p className="text-white text-lg leading-relaxed">
              The primary objective of designing the UIUX for the Hogwarts Legacy website is to craft a captivating, interactive, and intuitive digital experience that transports users into the enchanting cloud of warranty. Every visual and interactive element should evoke the mystical Hogwarts, ensuring that both long time fans and newcomers feel a deep sense of connection to the universe.
            </p>
            <p className="text-gray-300 text-sm mt-4">
              With a single choice, the castle reconfigures itself around you. The heavy wooden doors creak open, revealing the secrets of your Hogwarts house. Each visitor's journey is unique, guided by the traditions, legends, and mysteries of their chosen house.
            </p>
          </div>
        </div>

        {/* Box 2 - Hidden */}
        <div className="backdrop-blur-2xl bg-opacity-30 rounded-2xl p-6 shadow-xl opacity-0">
          {/* This box is hidden with opacity-0 */}
        </div>

        {/* Box 3 - Hidden */}
        <div className="backdrop-blur-2xl bg-black bg-opacity-30 rounded-2xl p-6 shadow-xl opacity-0">
          {/* This box is hidden with opacity-0 */}
        </div>

        {/* Box 4 - Challenges (visible) */}
        <div className="backdrop-blur-2xl text-white bg-opacity-50 rounded-2xl p-6 shadow-xl overflow-y-auto">
          <div className="text-center mb-4">
            <h2 className="text-6xl font-bold" style={harryPotterTextStyle}>
              Challenges
            </h2>
          </div>
          <div className="text-left">
            <p className="text-white text-lg leading-relaxed">
              As the enchanted doors of the virtual museum swirns open, the greatest challenge emerges—how to bring the magic of Hogwarts to life without overwhelming those who are inside. The castle is vast, its history layered with centuries of secrets, and every centred holes a new story waiting to be told.
            </p>
            <p className="text-white text-lg leading-relaxed mt-4">
              Yet, if the experience is too intricate visitors may feel lost in the labyrinth of knowledge, unsure where to turn down. The journey must feel natural, as if the very walls of Hogwarts are subtly pulling them, revealing just enough wonder to spark curiosity without drowning them in an endless sea of bra.
            </p>
            <p className="text-gray-300 text-sm mt-4">
              Each house must be a world of its own—Gryffindor's roaring hearth, Ravenshaw's celestial glow, Hoffnapuff's golden warmth, and Sydnein's emerald shadow—yet together, they must weave a cohesive tapestry of the Hogwarts experience.
            </p>
          </div>
        </div>
      </div>

      {/* 10x10 Grid of question boxes */}
      <div className="w-full mt-28 p-8">
        <h2 className="text-6xl font-bold text-center mb-8" style={harryPotterTextStyle}>
          Questions Grid
        </h2>
        <div className="grid grid-cols-10 gap-2 w-full">
          {boxes}
        </div>
      </div>

      {/* Question Detail View Modal */}
      {selectedQuestion && (
        <QuestionDetailView
          question={selectedQuestion}
          onClose={() => setSelectedQuestion(null)}
        />
      )}
    </div>
  );
}