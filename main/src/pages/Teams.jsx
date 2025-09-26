import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Users, Trophy, Crown, Copy, Check, Settings, Plus, UserPlus, LogOut } from 'lucide-react';
import {
  subscribeToTeam,
  createTeam as createTeamService,
  joinTeam as joinTeamService,
  leaveTeam as leaveTeamService,
  updateTeamSettings,
} from '../services/firebase.js';
import { getUserProfile } from '../services/firebase.js';

// Import profile images
import pfp from '../assets/pfp.png';
import pfp1 from '../assets/pfp1.png';
import pfp2 from '../assets/pfp2.png';
import pfp3 from '../assets/pfp3.png';
import pfp4 from '../assets/pfp4.png';
import pfp5 from '../assets/pfp5.png';


// --- Style Hooks for Memoization ---
const useTeamStyles = () => {
  return useMemo(() => ({
    gradientText: (fontSize) => ({
      fontFamily: 'HarryP, serif',
      background: 'linear-gradient(145deg, #FFD700 0%, #B8860B 50%, #8B7355 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
      fontSize: `${fontSize}rem`,
      textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
      filter: 'drop-shadow(0 0 15px rgba(212, 175, 55, 0.6))'
    }),
    baseText: (fontSize) => ({
      fontFamily: 'HarryP, serif',
      fontSize: `${fontSize}rem`,
      color: 'white'
    }),
    inputStyle: {
      fontFamily: 'HarryP, serif',
      fontSize: '1.2rem',
      color: 'white'
    }
  }), []);
};
const whiteHarryPotterTextStyle = {
    fontFamily: 'HarryP, serif',
    color: 'white',
    textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
    filter: 'drop-shadow(0 0 15px rgba(212, 175, 55, 0.7))'
  };

// --- Reusable Form Input Component ---
const FormInput = React.memo(({ label, ...props }) => {
  const styles = useTeamStyles();
  
  return (
    <div>
      <label className="block text-sm font-medium text-gray-100 mb-2" style={styles.gradientText(1.5)}>
        {label}
      </label>
      <input
        {...props}
        className="w-full px-3 py-2 border border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent bg-gray-800 bg-opacity-40 text-white"
        style={styles.inputStyle}
      />
    </div>
  );
});

FormInput.displayName = 'FormInput';

// --- Team Settings Modal ---
const TeamSettingsModal = React.memo(({ team, isOpen, onClose, currentUser }) => {
  const [newMaxSize, setNewMaxSize] = useState(team?.maxSize || 5);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', isError: false });
  const styles = useTeamStyles();

  const teamSizeOptions = useMemo(() => [3, 4, 5], []);

  useEffect(() => {
    if (team) {
      setNewMaxSize(team.maxSize || 5);
    }
  }, [team]);

  const handleUpdateTeamSize = useCallback(async () => {
    if (!team) return;
    
    setIsLoading(true);
    try {
      const result = await updateTeamSettings(team.id, { maxSize: newMaxSize });
      if (result.success) {
        setMessage({ text: 'Team size updated successfully!', isError: false });
        setTimeout(() => {
          setMessage({ text: '', isError: false });
          onClose();
        }, 2000);
      } else {
        setMessage({ text: result.message, isError: true });
      }
    } catch (error) {
      setMessage({ text: 'Failed to update team settings', isError: true });
    }
    setIsLoading(false);
  }, [team, newMaxSize, onClose]);

  const handleClose = useCallback(() => onClose(), [onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-gray-900 bg-opacity-80 rounded-lg p-8 max-w-md w-full mx-4 border border-gray-600">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold" style={styles.gradientText(2)}>
            Team Settings
          </h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-white text-xl"
          >
            ×
          </button>
        </div>

        {message.text && (
          <div className={`p-3 rounded-lg mb-4 text-center text-sm ${
            message.isError ? 'bg-red-900 bg-opacity-70 text-red-200' : 'bg-green-900 bg-opacity-70 text-green-200'
          }`} style={styles.baseText(1.2)}>
            {message.text}
          </div>
        )}

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-100 mb-2" style={styles.gradientText(1.5)}>
              Team Name
            </label>
            <input
              type="text"
              value={team?.teamName || ''}
              disabled
              className="w-full px-3 py-2 border border-gray-600 rounded-lg bg-gray-800 bg-opacity-40 text-gray-400"
              style={styles.baseText(1.2)}
            />
            <p className="text-xs text-gray-400 mt-1" style={styles.baseText(1)}>
              Team name cannot be changed
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-100 mb-2" style={styles.gradientText(1.5)}>
              Maximum Team Size
            </label>
            <select
              value={newMaxSize}
              onChange={(e) => setNewMaxSize(parseInt(e.target.value))}
              disabled={isLoading}
              className="w-full px-3 py-2 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent bg-gray-800 bg-opacity-40 text-white"
              style={styles.baseText(1.2)}
            >
              {teamSizeOptions.map(size => (
                <option key={size} value={size} style={styles.baseText(1.2)}>
                  {size} members
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-400 mt-1" style={styles.baseText(1)}>
              Current members: {team?.members?.length || 0}
            </p>
            {newMaxSize < (team?.members?.length || 0) && (
              <p className="text-xs text-red-300 mt-1" style={styles.baseText(1)}>
                Cannot set size below current member count
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-100 mb-2" style={styles.gradientText(1.5)}>
              Join Code
            </label>
            <div className="flex items-center space-x-2">
              <code className="flex-1 bg-gray-800 bg-opacity-40 px-3 py-2 rounded-md font-mono text-lg font-semibold text-white" style={styles.baseText(1.2)}>
                {team?.teamCode}
              </code>
              <button
                onClick={() => navigator.clipboard.writeText(team?.teamCode)}
                className="p-2 text-indigo-400 hover:text-indigo-300 hover:bg-gray-700 rounded-md transition-colors"
                title="Copy join code"
              >
                <Copy size={16} />
              </button>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-4 mt-8">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-sm font-medium text-gray-200 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
            style={styles.baseText(1.2)}
          >
            Cancel
          </button>
          <button
            onClick={handleUpdateTeamSize}
            disabled={isLoading || newMaxSize < (team?.members?.length || 0) || newMaxSize === team?.maxSize}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 disabled:cursor-not-allowed rounded-lg transition-colors"
            style={styles.baseText(1.2)}
          >
            {isLoading ? 'Updating...' : 'Update Settings'}
          </button>
        </div>
      </div>
    </div>
  );
});

TeamSettingsModal.displayName = 'TeamSettingsModal';

// --- Team Member Card Component ---
const TeamMemberCard = React.memo(({ 
  member, 
  isCurrentUser, 
  isLeader, 
  userProfile,
  avatars 
}) => {
  const styles = useTeamStyles();
  
  const getMemberDisplayInfo = useCallback((member) => {
    if (member.uid === isCurrentUser && userProfile) {
      return {
        username: userProfile.username || member.username,
        avatar: userProfile.avatar !== undefined ? userProfile.avatar : (member.avatar || 0)
      };
    }
    return {
      username: member.username,
      avatar: member.avatar || 0
    };
  }, [isCurrentUser, userProfile]);

  const displayInfo = useMemo(() => getMemberDisplayInfo(member), [getMemberDisplayInfo, member]);
  const avatarIndex = displayInfo.avatar || 0;
  const avatar = avatars[avatarIndex] || avatars[0];

  return (
    <div 
      className={`p-6 rounded-xl border-2 transition-all duration-200 ${
        isCurrentUser 
          ? 'border-indigo-400 bg-gradient-to-br from-indigo-900/70 to-indigo-800/70 shadow-md' 
          : isLeader
          ? 'border-yellow-400 bg-gradient-to-br from-yellow-900/70 to-yellow-800/70 shadow-md'
          : 'border-gray-500 bg-gray-800/60 hover:bg-gray-700/60'
      }`}
    >
      <div className="text-center">
        <div className="mb-3 flex justify-center">
          <div className="relative">
            <img 
              src={avatar.src} 
              alt={avatar.alt}
              className="w-16 h-16 rounded-full object-cover shadow-md"
              loading="lazy"
            />
            {isLeader && (
              <Crown size={24} className="absolute -top-2 -right-2 text-yellow-300 bg-gray-800 p-1 rounded-full" />
            )}
          </div>
        </div>
        <div>
          <div className="flex items-center justify-center mb-2">
            <span className="font-semibold text-lg" style={styles.gradientText(1.8)}>
              {displayInfo.username}
            </span>
          </div>
          {isCurrentUser && (
            <span className="inline-block text-xs bg-indigo-600 text-white px-3 py-1 rounded-full mb-2" style={styles.baseText(1)}>
              You
            </span>
          )}
          <div className="space-y-1 text-sm" style={styles.gradientText(1.3)}>
            <div className="font-medium">{isLeader ? 'Team Leader' : 'Member'}</div>
          </div>
        </div>
      </div>
    </div>
  );
});

TeamMemberCard.displayName = 'TeamMemberCard';

// --- Team Display Component ---
const TeamDisplay = React.memo(({ team, currentUser, userProfile }) => {
  const [copied, setCopied] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const styles = useTeamStyles();

  const avatars = useMemo(() => [
    { src: pfp, alt: 'Profile 1' },
    { src: pfp1, alt: 'Profile 2' },
    { src: pfp2, alt: 'Profile 3' },
    { src: pfp3, alt: 'Profile 4' },
    { src: pfp4, alt: 'Profile 5' },
    { src: pfp5, alt: 'Profile 6' }
  ], []);

  const copyJoinCode = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(team.teamCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
      alert('Failed to copy join code.');
    }
  }, [team.teamCode]);

  const openSettings = useCallback(() => setIsSettingsOpen(true), []);
  const closeSettings = useCallback(() => setIsSettingsOpen(false), []);

  const isTeamLeader = useMemo(() => currentUser.uid === team.leaderId, [currentUser.uid, team.leaderId]);
  const currentMembers = useMemo(() => team.members?.length || 0, [team.members]);
  const maxMembers = useMemo(() => team.maxSize || 5, [team.maxSize]);

  const memberCards = useMemo(() => 
    team.members?.map((member) => (
      <TeamMemberCard
        key={member.uid}
        member={member}
        isCurrentUser={member.uid === currentUser.uid}
        isLeader={member.uid === team.leaderId}
        userProfile={userProfile}
        avatars={avatars}
      />
    )) || []
  , [team.members, currentUser.uid, team.leaderId, userProfile, avatars]);

  const emptySlots = useMemo(() => 
    Array.from({ length: Math.max(0, maxMembers - currentMembers) }).map((_, index) => (
      <div key={`empty-${index}`} className="p-6 rounded-xl border-2 border-dashed border-gray-500 bg-gray-800/40 flex flex-col items-center justify-center">
        <div className="text-4xl mb-3 text-gray-500">👤</div>
        <div className="text-sm text-center" style={styles.gradientText(1.3)}>
          <div className="font-medium mb-1">Available Slot</div>
          <div>Share the join code!</div>
        </div>
      </div>
    ))
  , [maxMembers, currentMembers, styles]);

  return (
    <>
      <div className="backdrop-blur-lg rounded-lg shadow-lg p-8 max-w-4xl mx-auto border border-gray-600">
        {/* Team Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Users className="text-indigo-300 mr-3" size={32} />
            <h2 className="text-3xl font-bold" style={styles.gradientText(3)}>
              {team.teamName}
            </h2>
          </div>
          
          <div className="flex items-center justify-center space-x-6 text-sm mb-4">
            <div className="flex items-center" style={styles.gradientText(1.5)}>
              <Users size={16} className="mr-1" />
              <span>{currentMembers}/{maxMembers} members</span>
            </div>
            <div className="flex items-center" style={styles.gradientText(1.5)}>
              <span className="mr-2">Join Code:</span>
              <code className="bg-gray-800 bg-opacity-40 px-3 py-1 rounded-md font-mono text-lg font-semibold" style={styles.gradientText(1.5)}>
                {team.teamCode}
              </code>
              <button
                onClick={copyJoinCode}
                className="ml-2 p-2 text-indigo-300 hover:text-indigo-200 hover:bg-gray-700 rounded-md transition-colors"
                title="Copy join code"
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
              </button>
            </div>
          </div>
          
          <div className="flex items-center justify-center bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-6 py-3 rounded-full shadow-lg">
            <Trophy className="mr-2" size={24} />
            <span className="text-xl font-bold" style={styles.baseText(2)}>
              {team.points || 0} Points
            </span>
          </div>
        </div>

        {/* Team Members Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold flex items-center" style={styles.gradientText(2)}>
              <Users className="mr-2" size={20} />
              Team Members
            </h3>
            <div className="text-sm" style={styles.gradientText(1.5)}>
              {currentMembers < maxMembers ? (
                <span className="text-green-300">● {maxMembers - currentMembers} spots available</span>
              ) : (
                <span className="text-red-300">● Team is full</span>
              )}
            </div>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {memberCards}
            {emptySlots}
          </div>
        </div>
        
        <div className="flex justify-center space-x-4 mt-8 pt-6 border-t border-gray-600">
          {isTeamLeader && (
            <button 
              onClick={openSettings}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors font-medium flex items-center"
              style={styles.baseText(1.2)}
            >
              <Settings size={18} className="mr-2" />
              Team Settings
            </button>
          )}
        </div>
      </div>

      <TeamSettingsModal 
        team={team}
        isOpen={isSettingsOpen}
        onClose={closeSettings}
        currentUser={currentUser}
      />
    </>
  );
});

TeamDisplay.displayName = 'TeamDisplay';

// --- Team Creation/Join Hub ---
const TeamHub = React.memo(({ currentUser, userProfile, onTeamChange }) => {
  const [isCreatingTeam, setIsCreatingTeam] = useState(true);
  const [teamName, setTeamName] = useState('');
  const [teamSize, setTeamSize] = useState(5);
  const [teamCode, setTeamCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', isError: false });
  const styles = useTeamStyles();

  const teamSizeOptions = useMemo(() => [3, 4, 5], []);

  const displayMessage = useCallback((text, isError = false) => {
    setMessage({ text, isError });
    setTimeout(() => setMessage({ text: '', isError: false }), 4000);
  }, []);

  const handleCreateTeam = useCallback(async () => {
    if (!teamName.trim() || teamName.length < 3) {
      displayMessage('Team name must be at least 3 characters long.', true);
      return;
    }
    setIsLoading(true);
    const userForTeam = {
      ...currentUser,
      username: userProfile?.username || currentUser.displayName || currentUser.email?.split('@')[0] || 'Player',
      avatar: userProfile?.avatar || 0
    };
    
    try {
      const result = await createTeamService(teamName.trim(), userForTeam, teamSize);
      if (result.success) {
        displayMessage('Team created successfully!', false);
        setTeamName('');
        setTeamSize(5);
        onTeamChange?.();
      } else {
        displayMessage(result.message, true);
      }
    } catch (error) {
      displayMessage('Failed to create team. Please try again.', true);
    }
    setIsLoading(false);
  }, [teamName, teamSize, currentUser, userProfile, displayMessage, onTeamChange]);

  const handleJoinTeam = useCallback(async () => {
    if (teamCode.trim().length !== 6) {
      displayMessage('Team code must be 6 characters long.', true);
      return;
    }
    setIsLoading(true);
    const userForTeam = {
      ...currentUser,
      username: userProfile?.username || currentUser.displayName || currentUser.email?.split('@')[0] || 'Player',
      avatar: userProfile?.avatar || 0
    };
    
    try {
      const result = await joinTeamService(teamCode.trim().toUpperCase(), userForTeam);
      if (result.success) {
        displayMessage('Successfully joined team!', false);
        setTeamCode('');
        onTeamChange?.();
      } else {
        displayMessage(result.message, true);
      }
    } catch (error) {
      displayMessage('Failed to join team. Please try again.', true);
    }
    setIsLoading(false);
  }, [teamCode, currentUser, userProfile, displayMessage, onTeamChange]);

  const switchToCreate = useCallback(() => {
    setIsCreatingTeam(true);
    setMessage({ text: '', isError: false });
  }, []);

  const switchToJoin = useCallback(() => {
    setIsCreatingTeam(false);
    setMessage({ text: '', isError: false });
  }, []);

  return (
    <div className="bg-transparent rounded-lg shadow-lg p-8 max-w-lg mx-auto border border-gray-600">
      <div className="text-center mb-8">
        <div className="bg-indigo-900 bg-opacity-60 rounded-full p-4 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
          <Users size={40} className="text-indigo-300" />
        </div>
        <h2 className="text-2xl font-bold mb-2" style={styles.gradientText(2.5)}>
          Join the Competition
        </h2>
        <p style={styles.gradientText(1.5)}>
          Create a new team or join an existing one to start competing!
        </p>
      </div>

      <div className="flex border-b border-gray-600 mb-6">
        <button 
          onClick={switchToCreate} 
          className={`flex-1 py-3 font-semibold text-sm transition-colors ${ 
            isCreatingTeam ? 'text-indigo-300 border-b-2 border-indigo-300' : 'text-gray-400 hover:text-gray-300'
          }`} 
          style={styles.gradientText(1.5)}
        >
          Create Team
        </button>
        <button 
          onClick={switchToJoin} 
          className={`flex-1 py-3 font-semibold text-sm transition-colors ${ 
            !isCreatingTeam ? 'text-indigo-300 border-b-2 border-indigo-300' : 'text-gray-400 hover:text-gray-300'
          }`} 
          style={styles.gradientText(1.5)}
        >
          Join Team
        </button>
      </div>

      {message.text && (
        <div className={`p-3 rounded-lg mb-4 text-center text-sm ${
          message.isError ? 'bg-red-900 bg-opacity-70 text-red-200' : 'bg-green-900 bg-opacity-70 text-green-200'
        }`} style={styles.baseText(1.2)}>
          {message.text}
        </div>
      )}

      {isCreatingTeam ? (
        <div className="space-y-6">
          <FormInput 
            label="Team Name" 
            type="text" 
            value={teamName} 
            onChange={e => setTeamName(e.target.value)} 
            placeholder="Enter a unique team name" 
            maxLength={30} 
            disabled={isLoading}
          />
          <div>
            <label className="block text-sm font-medium text-gray-100 mb-2" style={styles.gradientText(1.5)}>
              Team Size
            </label>
            <select 
              value={teamSize} 
              onChange={e => setTeamSize(parseInt(e.target.value))} 
              disabled={isLoading} 
              className="w-full px-3 py-2 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent bg-gray-800 bg-opacity-40 text-white" 
              style={styles.baseText(1.2)}
            >
              {teamSizeOptions.map(size => (
                <option key={size} value={size} style={styles.baseText(1.2)}>
                  {size} members
                </option>
              ))}
            </select>
          </div>
          <button 
            onClick={handleCreateTeam} 
            disabled={isLoading || !teamName.trim()} 
            className="w-full py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 disabled:bg-indigo-800 disabled:cursor-not-allowed font-medium transition-colors flex items-center justify-center" 
            style={styles.baseText(1.2)}
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div> 
                Creating...
              </>
            ) : (
              <>
                <Plus size={20} className="mr-2" /> 
                Create Team
              </>
            )}
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <FormInput 
            label="Enter Join Code" 
            type="text" 
            value={teamCode} 
            onChange={e => setTeamCode(e.target.value.toUpperCase())} 
            placeholder="ABC123" 
            maxLength={6} 
            disabled={isLoading}
          />
          <button 
            onClick={handleJoinTeam} 
            disabled={isLoading || teamCode.length !== 6} 
            className="w-full py-3 bg-green-700 hover:bg-green-600 text-white rounded-lg disabled:bg-green-900 disabled:cursor-not-allowed font-medium transition-colors flex items-center justify-center" 
            style={styles.baseText(1.2)}
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div> 
                Joining...
              </>
            ) : (
              <>
                <UserPlus size={20} className="mr-2" /> 
                Join Team
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
});

TeamHub.displayName = 'TeamHub';

// --- Main Teams Component ---
export default function Teams({ currentUser, userProfile, onUserProfileChange }) {
  const [team, setTeam] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
  if (!currentUser) {
    setIsLoading(true);
    return;
  }

  if (!userProfile) {
    setIsLoading(false);
    setTeam(null);
    return;
  }
  
  const teamId = userProfile.teamId;

    if (!teamId) {
      setTeam(null);
      setIsLoading(false);
      return;
    }

    const unsubscribe = subscribeToTeam(teamId, (result) => {
      if (result.success) {
        setTeam(result.teamData);
      } else {
        console.error(result.message);
        setTeam(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [userProfile, currentUser]);
  // Add this new useEffect right here
useEffect(() => {
  if (currentUser && !userProfile && !isLoading) {
    console.warn('User authenticated but profile not found');
  }
}, [currentUser, userProfile, isLoading]);

  const handleTeamChange = useCallback(() => {
  // Force a refresh of the current user's profile
  setIsLoading(true);
  onUserProfileChange?.();
  
  // Also manually trigger a profile refresh if the callback doesn't work
  if (currentUser?.uid) {
    getUserProfile(currentUser.uid).then(result => {
      if (result.success) {
        // This will trigger the useEffect to re-run with updated profile
        setIsLoading(false);
      }
    });
  }
}, [onUserProfileChange, currentUser]);

  return (
    <div className="flex items-center justify-center p-4 sm:p-8 w-full h-full">
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-300"></div>
        </div>
      ) : team ? (
        <TeamDisplay team={team} currentUser={currentUser} userProfile={userProfile} />
      ) : (
        <TeamHub currentUser={currentUser} userProfile={userProfile} onTeamChange={handleTeamChange} />
      )}
    </div>
  );
}