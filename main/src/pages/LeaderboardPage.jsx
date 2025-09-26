import React, { useState, useEffect } from 'react';
import { Zap, ZapOff } from 'lucide-react';
import {
 subscribeToAppToggles,
 subscribeToTopTeams,
 getTopTeams
} from '../services/firebase.js';
import { Counter, CountUp, DecryptedText } from '../components/reactbits';


export default function LeaderboardPage() {
 const [topTeams, setTopTeams] = useState([]);
 const [isLive, setIsLive] = useState(true);
 const [showCountdown, setShowCountdown] = useState(false);
 const [countdownNumber, setCountdownNumber] = useState(10);
 const [showLeaderboard, setShowLeaderboard] = useState(true);
 const [isLoading, setIsLoading] = useState(true);


 // States to control animations
 const [revealedPositions, setRevealedPositions] = useState([]);
 const [showNames, setShowNames] = useState([]);
 const [showPoints, setShowPoints] = useState([]);
 const [hasRevealed, setHasRevealed] = useState(false);


 useEffect(() => {
   const unsubscribeToggles = subscribeToAppToggles((result) => {
     if (result.success && result.toggles.hasOwnProperty('leaderboardLive')) {
       const newLiveState = result.toggles.leaderboardLive;


       // If switching from false to true, trigger countdown
       if (!isLive && newLiveState) {
         setShowLeaderboard(false);
         setShowCountdown(true);
         setCountdownNumber(10);


         // Reset all states before the reveal
         setRevealedPositions([]);
         setShowNames([]);
         setShowPoints([]);
         setHasRevealed(false);


         let count = 10;
         const countdownInterval = setInterval(() => {
           count--;
           setCountdownNumber(count);


           // Stop the countdown when it reaches 0
           if (count <= 0) {
             clearInterval(countdownInterval);
             setTimeout(() => {
               setShowCountdown(false);
               setShowLeaderboard(true);
               startStaggeredReveal();
             }, 1000);
           }
         }, 1000);
       }


       setIsLive(newLiveState);
     }
   });


   return () => unsubscribeToggles();
 }, [isLive]);


 useEffect(() => {
   let unsubscribeTeams = () => {};


   // Always fetch data initially, regardless of live status
   const fetchInitialData = async () => {
     setIsLoading(true);
     const result = await getTopTeams();
     if (result.success) {
       setTopTeams(result.teams);
      
       if (!isLive) {
         // When paused, show everything immediately without animation
         setHasRevealed(true);
         setRevealedPositions([0, 1, 2]);
         setShowNames([0, 1, 2]);
         setShowPoints([0, 1, 2]);
       }
     }
     setIsLoading(false);
   };


   fetchInitialData();


   if (isLive && showLeaderboard) {
     // Only subscribe to real-time updates when live
     unsubscribeTeams = subscribeToTopTeams((result) => {
       if (result.success) {
         setTopTeams(result.teams);
       }
     });
   }


   // Always return the cleanup function
   return () => {
     if (unsubscribeTeams) {
       unsubscribeTeams();
     }
   };
 }, [isLive, showLeaderboard]);


 const startStaggeredReveal = () => {
   // Simple reveal - just show all at once after countdown
   setRevealedPositions([0, 1, 2]);
   setShowNames([0, 1, 2]);
   setShowPoints([0, 1, 2]);
   setHasRevealed(true); // Make everything static immediately
 };


 const harryPotterTextStyle = {
   fontFamily: 'HarryP, serif',
   background: 'linear-gradient(145deg, #FFD700 0%, #B8860B 50%, #8B7355 100%)',
   WebkitBackgroundClip: 'text',
   WebkitTextFillColor: 'transparent',
   backgroundClip: 'text',
   textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
   filter: 'drop-shadow(0 0 15px rgba(212, 175, 55, 0.6))'
 };


 // New style for white text with HarryP font
 const whiteHarryPotterTextStyle = {
   fontFamily: 'HarryP, serif',
   color: 'white',
   textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
   filter: 'drop-shadow(0 0 15px rgba(212, 175, 55, 0.6))'
 };


 const CountdownMessage = () => (
   <div className="bg-transparent rounded-lg p-8 max-w-4xl mx-auto">
     <div className="text-center py-12">
       <h2
         className="text-7xl font-bold mb-6"
         style={harryPotterTextStyle}
       >
         The leaderboard will be live in
       </h2>
       <div className="mb-4 text-3xl" style={harryPotterTextStyle}>
         <Counter
           value={countdownNumber}
           places={countdownNumber < 10 ? [1] : [10, 1]}
           fontSize={80}
           padding={5}
           gap={10}
           textColor="transparent"
           fontWeight={900}
         />
       </div>
       <p className="text-gray-600 text-3xl" style={harryPotterTextStyle}>seconds</p>
     </div>
   </div>
 );


 if (isLoading) {
   return (
     <div className="flex items-center justify-center min-h-screen">
       <div
         className="text-4xl"
         style={harryPotterTextStyle}
       >
         Loading...
       </div>
     </div>
   );
 }


 return (
   <>
     {showCountdown && <CountdownMessage />}


     {showLeaderboard && (
       <div className="bg-transparent rounded-lg p-8 max-w-4xl mx-auto">
         <div className="flex justify-center items-center mb-6">
           <h2
             className="text-center"
             style={{
               ...harryPotterTextStyle,
               fontSize: '4rem',
             }}
           >
             Team Leaderboard
           </h2>
           <div
             className={`ml-4 flex items-center px-3 py-1 rounded-full text-sm font-medium ${
               isLive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
             }`}
              style={{
               ...harryPotterTextStyle,
               fontSize: '2rem',
             }}
           >
             {isLive ? (
               <Zap size={14} className="mr-1" />
             ) : (
               <ZapOff size={14} className="mr-1" />
             )}
             {isLive ? 'Live' : 'Paused'}
           </div>
         </div>


         <div className="space-y-3">
           {topTeams.map((teamItem, index) => {
             const isRevealed = hasRevealed || revealedPositions.includes(index);
             const showName = hasRevealed || showNames.includes(index);
             const showPoint = hasRevealed || showPoints.includes(index);


             // Define medal colors and effects
             let medalColor = '';
             let borderEffect = '';
             if (index === 0) {
               medalColor = 'text-yellow-500';
               borderEffect = 'relative overflow-hidden border-2 border-yellow-500';
             } else if (index === 1) {
               medalColor = 'text-gray-400';
               borderEffect = 'relative overflow-hidden border-2 border-gray-400';
             } else if (index === 2) {
               medalColor = 'text-amber-800';
               borderEffect = 'relative overflow-hidden border-2 border-amber-800';
             }


             return (
               <div
                 key={teamItem.id}
                 className={`flex items-center justify-between p-4 rounded-lg transition-all duration-500 ${borderEffect} ${
                   isRevealed
                     ? 'bg-transparent opacity-100 transform translate-y-0'
                     : 'opacity-0 transform translate-y-4'
                 }`}
               >
                 {/* Animated border effect for top 3 teams */}
                 {(index === 0 || index === 1 || index === 2) && (
                   <div className={`absolute inset-0 overflow-hidden rounded-lg ${
                     index === 0 ? 'bg-gradient-to-r from-transparent via-yellow-300/30 to-transparent' :
                     index === 1 ? 'bg-gradient-to-r from-transparent via-gray-300/30 to-transparent' :
                     'bg-gradient-to-r from-transparent via-amber-700/30 to-transparent'
                   } animate-shimmer`}
                   style={{
                     animation: 'shimmer 3s infinite linear',
                     backgroundSize: '200% 100%',
                   }} />
                 )}
                
                 <div className="flex items-center z-10">
                   <span
                     className={`text-3xl mr-4 font-bold ${medalColor}`}
                     style={harryPotterTextStyle}
                   >
                     {index + 1}
                   </span>
                   <div>
                     {showName ? (
                       hasRevealed ? (
                         <div
                           className="font-semibold text-6xl"
                           style={harryPotterTextStyle}
                         >
                           {teamItem.teamName}
                         </div>
                       ) : (
                         <DecryptedText
                           text={teamItem.teamName}
                           animateOn="view"
                           speed={150}
                           className="font-semibold text-lg"
                           style={harryPotterTextStyle}
                         />
                       )
                     ) : (
                       <div
                         className="font-semibold text-lg text-transparent"
                         style={harryPotterTextStyle}
                       >
                         {teamItem.teamName}
                       </div>
                     )}
                    
                   </div>
                 </div>
                 <div className="text-right z-10">
                   {showPoint ? (
                     hasRevealed ? (
                       <div
                         className="font-bold text-3xl"
                         style={whiteHarryPotterTextStyle}
                       >
                         {teamItem.points || 0}
                       </div>
                     ) : (
                       <CountUp
                         from={0}
                         to={teamItem.points || 0}
                         duration={2}
                         direction="up"
                         className="font-bold text-xl"
                         style={whiteHarryPotterTextStyle}
                       />
                     )
                   ) : (
                     <div
                       className="font-bold text-xl text-transparent"
                       style={whiteHarryPotterTextStyle}
                     >
                       {teamItem.points || 0}
                     </div>
                   )}
                 </div>
               </div>
             );
           })}
           {topTeams.length === 0 && (
             <div className="text-center py-8">
               <p
                 className="text-gray-500"
                 style={harryPotterTextStyle}
               >
                 The leaderboard is empty.
               </p>
             </div>
           )}
         </div>
       </div>
     )}


     <style jsx>{`
       @keyframes shimmer {
         0% {
           background-position: -200% 0;
         }
         100% {
           background-position: 200% 0;
         }
       }
     `}</style>
   </>
 );
}
