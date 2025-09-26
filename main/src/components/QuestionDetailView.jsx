import React from 'react';

export default function QuestionDetailView({ question, onClose }) {
  if (!question) return null;

  return (
    <div 
      className="fixed inset-0 backdrop-blur-lg bg-black/60 flex items-start justify-center z-50 p-4"
      style={{ paddingTop: '10vh' }}
      onClick={onClose} // Close modal on background click
    >
      <div 
        className="border-2 border-yellow-700 bg-gray-900/80 rounded-2xl shadow-2xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the modal
      >
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b-2 border-yellow-800 flex-shrink-0">
          <h2 
            className="text-3xl font-bold drop-shadow-lg"
            style={{ 
              fontFamily: 'HarryP, serif',
              background: 'linear-gradient(145deg, #FFD700 0%, #B8860B 50%, #8B7355 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              fontSize: '4rem',
              textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
              filter: 'drop-shadow(0 0 15px rgba(212, 175, 55, 0.6))'
            }}
          >
            {question.title}
          </h2>
          <button 
            onClick={onClose} 
            className="text-yellow-300 text-4xl hover:text-red-400 transition-colors font-bold drop-shadow-lg"
            aria-label="Close question"
            style={{ 
              fontFamily: 'HarryP, serif',
              background: 'linear-gradient(145deg, #FFD700 0%, #B8860B 50%, #8B7355 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              fontSize: '4rem',
              textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
              filter: 'drop-shadow(0 0 15px rgba(212, 175, 55, 0.6))'
            }}
          >
            ✕
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {/* Problem Statement Section */}
          <div className="bg-black/20 p-6 rounded-xl border-2 border-yellow-900 shadow-inner">
            <h3 
              className="text-2xl font-bold mb-4 drop-shadow-md"
              style={{ 
                fontFamily: 'HarryP, serif',
                background: 'linear-gradient(145deg, #FFD700 0%, #B8860B 50%, #8B7355 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                fontSize: '2rem',
                textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
                filter: 'drop-shadow(0 0 15px rgba(212, 175, 55, 0.6))'
              }}
            >
              Problem Statement
            </h3>
            <div className="bg-black/30 p-4 rounded-lg border border-yellow-800">
              <p 
                className="leading-relaxed text-lg"
                style={{ 
                  fontFamily: 'serif', // Using a more readable font for the problem statement
                  color: 'white',
                  whiteSpace: 'pre-wrap',
                  fontSize: '1.1rem',
                }}
              >
                {question.problemStatement}
              </p>
            </div>
          </div>

          {/* Test Cases Section */}
          <div className="bg-black/20 p-6 rounded-xl border-2 border-yellow-900 shadow-inner">
            <h3 
              className="text-2xl font-bold mb-6 drop-shadow-md"
              style={{ 
                fontFamily: 'HarryP, serif',
                background: 'linear-gradient(145deg, #FFD700 0%, #B8860B 50%, #8B7355 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                fontSize: '2rem',
                textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
                filter: 'drop-shadow(0 0 15px rgba(212, 175, 55, 0.6))'
              }}
            >
              Sample Test Cases
            </h3>
            <div className="space-y-6">
              {question.testCases && Array.isArray(question.testCases) && question.testCases.length > 0 ? (
                question.testCases.map((testCase, index) => (
                  <div 
                    key={index} 
                    className="bg-black/40 p-5 rounded-xl border border-yellow-800 shadow-lg"
                  >
                    <p 
                      className="font-bold text-xl mb-4"
                      style={{ 
                        fontFamily: 'HarryP, serif',
                        color: 'white',
                        fontSize: '1.8rem',
                        textShadow: '1px 1px 2px rgba(0,0,0,0.7)',
                      }}
                    >
                      Test Case {index + 1}
                    </p>
                    
                    <div className="space-y-4">
                      <div>
                        <p 
                          className="text-lg font-semibold mb-2"
                          style={{ 
                            fontFamily: 'HarryP, serif',
                            color: '#ccc', // Lighter grey for better readability
                            fontSize: '1.6rem',
                            textShadow: '1px 1px 2px rgba(0,0,0,0.7)',
                          }}
                        >
                          Input:
                        </p>
                        <pre className="bg-gray-800 p-4 rounded-lg border border-green-600 overflow-x-auto">
                          <code style={{ 
                            fontFamily: 'monospace', 
                            color: '#90EE90', // Light green text for input
                            fontSize: '1rem'
                          }}>
                            {testCase.input}
                          </code>
                        </pre>
                      </div>
                      
                      <div>
                        <p 
                          className="text-lg font-semibold mb-2"
                          style={{ 
                            fontFamily: 'HarryP, serif',
                            color: '#ccc',
                            fontSize: '1.6rem',
                            textShadow: '1px 1px 2px rgba(0,0,0,0.7)',
                          }}
                        >
                          Output:
                        </p>
                        <pre className="bg-gray-800 p-4 rounded-lg border border-blue-600 overflow-x-auto">
                          <code style={{ 
                            fontFamily: 'monospace', 
                            color: '#ADD8E6', // Light blue text for output
                            fontSize: '1rem'
                          }}>
                            {testCase.output}
                          </code>
                        </pre>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-black/30 p-6 rounded-xl border border-yellow-800 text-center">
                  <p 
                    className="text-xl"
                    style={{ 
                      fontFamily: 'serif',
                      color: '#999'
                    }}
                  >
                    No test cases provided for this question.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
