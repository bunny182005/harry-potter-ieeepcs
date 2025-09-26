import React, { useState, useEffect } from 'react';
import {
  Menu, X, User, Edit3, Trophy, Users, LogOut
} from 'lucide-react';
import ElectricBorder from '../components/reactbits/ElectricBorder.jsx';

// Import profile images
import pfp from '../assets/pfp.png';
import pfp1 from '../assets/pfp1.png';
import pfp2 from '../assets/pfp2.png';
import pfp3 from '../assets/pfp3.png';
import pfp4 from '../assets/pfp4.png';
import pfp5 from '../assets/pfp5.png';  

// Import background images
import bg1 from "../assets/welcomeback.png";
import teamBg from "../assets/Create_Team.png";

// Import page components
import Teams from './Teams';
import Round1Page from './Round1Page';
import Round2Page from './Round2Page';
import Round3Page from './Round3Page';
import Round4Page from './Round4Page';
import Round5Page from './Round5Page';
import LeaderboardPage from './LeaderboardPage.jsx';
import {
  subscribeToUserProfile,
  updateUserProfile,
  subscribeToAllTeams,
  subscribeToContent
} from '../services/firebase.js';

// Add HarryP font face
const harryPFontStyle = `
  @font-face {
    font-family: 'HarryP';
    src: url('/fonts/HarryP.ttf') format('truetype');
    font-weight: normal;
    font-style: normal;
    font-display: swap;
  }
  
  .harry-font {
    font-family: 'HarryP', serif;
    background: linear-gradient(145deg, #FFD700 0%, #B8860B 50%, #8B7355 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    text-shadow: 2px 2px 4px rgba(0,0,0,0.8);
    filter: drop-shadow(0 0 15px rgba(212, 175, 55, 0.6));
  }
  
  .harry-font-white {
    font-family: 'HarryP', serif;
    color: white !important;
    text-shadow: 2px 2px 4px rgba(0,0,0,0.8);
  }
`;

// Inject the font style
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = harryPFontStyle;
  document.head.appendChild(styleElement);
}

// --- Reusable Form Input Component ---
const FormInput = ({ label, ...props }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
    <input {...props} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"/>
  </div>
);

// --- Welcome Screen Component ---
const WelcomeContent = ({ userProfile }) => {
  const [welcomeMessage, setWelcomeMessage] = useState("Loading the latest dispatch...");

  useEffect(() => {
    const unsubscribe = subscribeToContent('welcomePage', (result) => {
      if (result.success && result.data.message) {
        setWelcomeMessage(result.data.message);
      } else {
        setWelcomeMessage("The Sorting Hat is thinking... Please wait a moment.");
      }
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="w-full min-h-full flex items-center justify-center text-center p-4 font-serif text-white rounded-lg backdrop-blur-sm">
      <div className="max-w-3xl">
        <h1 className="text-5xl font-bold mb-4 harry-font" style={{ fontSize: '6rem' }}>
          Welcome to PotterNova, {userProfile?.username || 'Wizard'}!
        </h1>
        <p className="text-xl text-gray-300 whitespace-pre-line leading-relaxed harry-font" style={{ fontSize: '3rem' }}>
          {welcomeMessage}
        </p>
      </div>
    </div>
  );
};

// --- Main Navigation Component ---
export default function NavigationUI({ user, onLogout }) {
  const [state, setState] = useState({
    isMenuOpen: false,
    isProfileOpen: false,
    isEditingProfile: false,
    userProfile: null,
    userName: user.displayName || user.email?.split('@')[0] || 'Player',
    selectedAvatar: 0,
    activePage: 'welcome',
    allTeams: [],
    currentBg: bg1,
    welcomeMessage: "Loading the latest dispatch..."
  });

  const avatars = [
    { src: pfp, alt: 'Profile 1' }, { src: pfp1, alt: 'Profile 2' },
    { src: pfp2, alt: 'Profile 3' }, { src: pfp3, alt: 'Profile 4' },
    { src: pfp4, alt: 'Profile 5' }, { src: pfp5, alt: 'Profile 6' },
  ];

  const menuItems = [
    { id: 'welcome', label: 'Welcome', icon: null, isHidden: true },
    { id: 'team', label: 'Team', icon: Users },
    { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
    { id: 'round1', label: 'Round 1', round: 1 },
    { id: 'round2', label: 'Round 2', round: 2 },
    { id: 'round3', label: 'Round 3', round: 3 },
    { id: 'round4', label: 'Round 4', round: 4 },
    { id: 'round5', label: 'Round 5', round: 5 },
  ];

  useEffect(() => {
    if (!user?.uid) return;
    
    const unsubscribeUser = subscribeToUserProfile(user.uid, (result) => {
      if (result.success) {
        const userData = result.userData;
        setState(prev => ({
          ...prev,
          userProfile: userData,
          userName: userData.username || user.email?.split('@')[0] || 'Player',
          selectedAvatar: userData.avatar || 0
        }));
      }
    });

    const unsubscribeAllTeams = subscribeToAllTeams((result) => {
      if (result.success) {
        setState(prev => ({
          ...prev,
          allTeams: result.teams.sort((a, b) => (b.points || 0) - (a.points || 0))
        }));
      }
    });

    return () => {
      unsubscribeUser();
      unsubscribeAllTeams();
    };
  }, [user?.uid]);

  useEffect(() => {
    if (state.activePage === 'team') {
      setState(prev => ({ ...prev, currentBg: teamBg }));
    } else {
      setState(prev => ({ ...prev, currentBg: bg1 }));
    }
  }, [state.activePage]);

  const toggleMenu = () => setState(prev => ({ ...prev, isMenuOpen: !prev.isMenuOpen }));
  const toggleProfile = () => setState(prev => ({ ...prev, isProfileOpen: !prev.isProfileOpen }));
  
  const handleMenuItemSelect = (itemId) => {
    setState(prev => ({ 
      ...prev, 
      activePage: itemId, 
      isMenuOpen: false 
    }));
  };

  const handleLogout = async () => {
    if (onLogout) await onLogout();
  };

  const saveProfile = async () => {
    const result = await updateUserProfile(user.uid, {
      username: state.userName,
      avatar: state.selectedAvatar
    });
    
    if (result.success) {
      setState(prev => ({ ...prev, isEditingProfile: false }));
    } else {
      console.error("Failed to update profile:", result.error);
    }
  };

  const renderMainContent = () => {
    switch(state.activePage) {
      case 'welcome':
        return <WelcomeContent userProfile={state.userProfile} />;
      case 'team':
        return <Teams currentUser={user} userProfile={state.userProfile} />;
      case 'leaderboard':
        return <LeaderboardPage allTeams={state.allTeams} />;
      case 'round1':
      case 'round2': 
      case 'round3':
      case 'round4':
      case 'round5':
        return null;
      default:
        return <WelcomeContent userProfile={state.userProfile} />;
    }
  };

  const renderRoundPage = () => {
    switch(state.activePage) {
      case 'round1': return <Round1Page />;
      case 'round2': return <Round2Page />;
      case 'round3': return <Round3Page />;
      case 'round4': return <Round4Page />;
      case 'round5': return <Round5Page />;
      default: return null;
    }
  };

  const mainContainerClasses = state.activePage === 'team'
    ? "flex-1 overflow-y-auto"
    : "flex-1 p-8 overflow-y-auto";

  const mainContentWrapperClasses = state.activePage === 'team'
    ? ""
    : "backdrop-blur-sm rounded-lg p-6 shadow-lg border border-white/20";

  const isRoundPage = ['round1', 'round2', 'round3', 'round4', 'round5'].includes(state.activePage);

  return (
    <div 
      className="w-full min-h-screen bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: `url(${state.currentBg})`,
      }}
    >
      {isRoundPage && renderRoundPage()}
      
      {/* Sidebar Menu */}
      <aside className={`fixed top-0 left-0 h-full backdrop-blur-md text-white w-64 transform ${state.isMenuOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out z-40 shadow-lg`}>
        <div className="p-4 flex justify-end">
          <button 
            onClick={toggleMenu} 
            className="text-3xl harry-font hover:bg-white/20 p-2 rounded-full transition-colors"
            style={{ fontSize: '6rem' }}
          >
            X
          </button>
        </div>
        <nav className="p-2 flex flex-col h-[calc(100%-80px)]">
          <div className="flex-grow">
            {menuItems.filter(item => !item.isHidden).map(item => (
              <button
                key={item.id}
                onClick={() => handleMenuItemSelect(item.id)}
                className="harry-font flex items-center w-full px-4 py-3 text-left rounded-lg transition-colors text-2xl hover:bg-white/20"
                style={{ fontSize: '1.8rem' }}
              >
                {item.icon ? (<item.icon size={20} className="mr-3" />) : (
                  <div className="w-8 h-8 bg-gray-700/70 rounded-full flex items-center justify-center mr-3">
                    <span className="text-sm font-bold text-white">{item.round}</span>
                  </div>
                )}
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </div>
          <button 
            onClick={handleLogout} 
            className="harry-font flex items-center w-full px-4 py-3 text-left text-red-400 hover:bg-red-900/50 hover:text-red-300 rounded-lg transition-colors"
            style={{ fontSize: '1.8rem' }}
          >
            <LogOut size={20} className="mr-3" />
            <span className="font-medium">Logout</span>
          </button>
        </nav>
      </aside>

      <div className={`flex flex-col h-screen transition-all duration-300 ease-in-out ${state.isMenuOpen ? 'ml-64' : 'ml-0'}`}>
        <nav className="backdrop-blur-md shadow-md border-b border-white/20 sticky top-0 z-30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <button 
                  onClick={toggleMenu} 
                  className="p-2 rounded-md text-white/80 hover:bg-white/20 transition-colors harry-font text-3xl"
                  style={{ fontSize: '6rem' }}
                >
                   =
                </button>
                <button
                  onClick={() => handleMenuItemSelect('welcome')}
                  className="ml-4 text-xl font-bold text-white drop-shadow-lg harry-font"
                  style={{ fontSize: '3rem' }}
                >
                  PotterNova
                </button>
              </div>

              <div className="flex items-center space-x-4">
                <ElectricBorder
                  className="w-full max-w-md"
                  color="#A86523"
                  speed={0.5}
                  chaos={0.3}
                  thickness={2}
                  style={{ borderRadius: '1rem' }}
                >
                  <button onClick={toggleProfile} className="flex items-center space-x-2 backdrop-blur-sm text-white px-4 py-2 rounded-full shadow-md transition-colors">
                    <img src={avatars[state.selectedAvatar]?.src} alt={avatars[state.selectedAvatar]?.alt} className="w-6 h-6 rounded-full object-cover"/>
                    <span className="font-medium harry-font-white">{state.userName}</span>
                    <User size={18} />
                  </button>
                </ElectricBorder>
              </div>
            </div>
          </div>
        </nav>

        {!isRoundPage && (
          <main className={mainContainerClasses}>
            <div className={mainContentWrapperClasses}>
              {renderMainContent()}
            </div>
          </main>
        )}
      </div>

      {/* Profile Modal */}
      {state.isProfileOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-50">
          <div className="relative w-80 backdrop-blur-xl rounded-lg shadow-xl border border-white/20 overflow-hidden bg-black/30">
            {!state.isEditingProfile ? (
              <div>
                <div className="p-6 text-center border-b border-white/30">
                  <div className="mb-4">
                    <img 
                      src={avatars[state.selectedAvatar]?.src} 
                      alt={avatars[state.selectedAvatar]?.alt} 
                      className="w-20 h-20 rounded-full mx-auto object-cover border-4 border-indigo-200"
                    />
                  </div>
                  <h3 className="text-xl text-white mb-1 harry-font">
                    {state.userName}
                  </h3>
                  <p className="text-sm text-gray-300 harry-font">
                    {user.email}
                  </p>
                </div>
                <div className="p-2 space-y-1">
                  <button 
                    onClick={() => setState(prev => ({ ...prev, isEditingProfile: true }))} 
                    className="flex items-center w-full px-3 py-2 text-left text-sm text-white hover:bg-white/20 rounded-md transition-colors harry-font"
                  >
                    <Edit3 size={16} className="mr-2" />Edit Profile
                  </button>
                  <button 
                    onClick={handleLogout} 
                    className="flex items-center w-full px-3 py-2 text-left text-sm text-red-300 hover:bg-red-900/30 rounded-md transition-colors harry-font"
                  >
                    <LogOut size={16} className="mr-2" />Logout
                  </button>
                </div>
                <button 
                  onClick={toggleProfile}
                  className="absolute top-2 right-2 p-1 text-white hover:bg-white/20 rounded-full"
                >
                  <X size={20} />
                </button>
              </div>
            ) : (
              <div className="p-6">
                <h3 className="text-lg font-semibold text-white mb-4 harry-font">
                  Edit Profile
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-white mb-2 harry-font">
                      Username
                    </label>
                    <input 
                      type="text" 
                      value={state.userName} 
                      onChange={(e) => setState(prev => ({ ...prev, userName: e.target.value }))} 
                      maxLength={20}
                      className="w-full px-3 py-2 border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-black/40 backdrop-blur-sm text-white harry-font placeholder-gray-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white mb-2 harry-font">
                      Select Avatar
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {avatars.map((avatar, index) => (
                        <button 
                          key={index} 
                          onClick={() => setState(prev => ({ ...prev, selectedAvatar: index }))} 
                          className={`relative p-2 rounded-lg transition-all ${state.selectedAvatar === index ? 'bg-indigo-500/50 ring-2 ring-indigo-500' : 'bg-white/10 hover:bg-white/20'}`}
                        >
                          <img src={avatar.src} alt={avatar.alt} className="w-16 h-16 rounded-full object-cover mx-auto"/>
                          {state.selectedAvatar === index && (
                            <div className="absolute top-1 right-1 w-4 h-4 bg-indigo-500 rounded-full flex items-center justify-center">
                              <div className="w-2 h-2 bg-white rounded-full"></div>
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="mt-6 flex justify-end space-x-2">
                  <button 
                    onClick={() => setState(prev => ({ ...prev, isEditingProfile: false }))} 
                    className="px-4 py-2 text-sm font-medium text-white bg-white/20 hover:bg-white/30 rounded-lg transition-colors harry-font backdrop-blur-sm"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={saveProfile} 
                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600/60 hover:bg-indigo-700/70 rounded-lg transition-colors harry-font backdrop-blur-sm"
                  >
                    Save Changes
                  </button>
                </div>
                <button 
                  onClick={() => setState(prev => ({ ...prev, isEditingProfile: false }))}
                  className="absolute top-2 right-2 p-1 text-white hover:bg-white/20 rounded-full"
                >
                  <X size={20} />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}