import {   
  createUserWithEmailAndPassword,   
  signInWithEmailAndPassword as firebaseSignInWithEmail,  
  onAuthStateChanged,  
  signOut,
  sendPasswordResetEmail 
} from "firebase/auth";

// Import Firestore functions directly from firebase/firestore
import {   
  doc, setDoc, getDoc, collection,   
  query, where, getDocs, updateDoc, arrayUnion, 
  onSnapshot, arrayRemove, deleteField,
  orderBy, limit,serverTimestamp
} from "firebase/firestore"; 

// Import your initialized Firebase instances
import { auth, db } from "../firebaseConfig"; 

// --- Auth Functions ---
export const onAuthChange = (callback) => {
  if (!auth) {
    console.error("Firebase auth not initialized");
    return () => {}; // Return empty unsubscribe function
  }
  return onAuthStateChanged(auth, callback);
};

export const signOutUser = () => {
  if (!auth) {
    throw new Error("Firebase auth not initialized");
  }
  return signOut(auth);
};

export const signInWithEmailAndPassword = async (email, password) => {  
  try {
    if (!auth) {
      throw new Error("Firebase auth not initialized");
    }
    
    const userCredential = await firebaseSignInWithEmail(auth, email, password);    
    return { success: true, user: userCredential.user };  
  } catch (error) {    
    console.error("Sign in error:", error);
    let errorMessage;
    switch (error.code) {
      case 'auth/user-not-found':
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        errorMessage = 'Invalid email or password.';
        break;
      case 'auth/invalid-email':
        errorMessage = 'Please enter a valid email address.';
        break;
      case 'auth/too-many-requests':
        errorMessage = 'Too many failed attempts. Please try again later.';
        break;
      case 'auth/user-disabled':
        errorMessage = 'This account has been disabled.';
        break;
      default:
        errorMessage = error.message || 'Login failed. Please try again.';
    }
    return { success: false, message: errorMessage };  
  }
};

export const signInWithUsername = async (username, password) => {  
  try {
    if (!auth || !db) {
      throw new Error("Firebase not properly initialized");
    }
    
    const q = query(collection(db, "users"), where("username", "==", username));    
    const querySnapshot = await getDocs(q);    
    if (querySnapshot.empty) return { success: false, message: 'Invalid username or password.' };         
    
    const email = querySnapshot.docs[0].data().email;    
    const userCredential = await firebaseSignInWithEmail(auth, email, password);    
    return { success: true, user: userCredential.user };  
  } catch (error) {    
    console.error("Username sign in error:", error);
    return { success: false, message: 'Invalid username or password.' };  
  }
};

export const resetPassword = async (email) => {
  try {
    if (!auth) {
      throw new Error("Firebase auth not initialized");
    }
    
    await sendPasswordResetEmail(auth, email);
    return { success: true };
  } catch (error) {
    console.error("Password reset error:", error);
    let errorMessage;
    switch (error.code) {
      case 'auth/user-not-found':
        errorMessage = 'No account found with this email address.';
        break;
      case 'auth/invalid-email':
        errorMessage = 'Please enter a valid email address.';
        break;
      case 'auth/too-many-requests':
        errorMessage = 'Too many reset attempts. Please try again later.';
        break;
      default:
        errorMessage = error.message || 'Failed to send reset email. Please try again.';
    }
    return { success: false, message: errorMessage };
  }
};

export const getUserProfile = async (uid) => {
  try {
    if (!db) {
      throw new Error("Firebase Firestore not initialized");
    }
    
    const userDoc = await getDoc(doc(db, "users", uid));
    if (userDoc.exists()) {
      return { success: true, userData: userDoc.data() };
    } else {
      return { success: false, message: 'User profile not found.' };
    }
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return { success: false, message: error.message || 'Failed to load user profile.' };
  }
};

export const subscribeToUserProfile = (uid, callback) => {
  if (!db) {
    console.error("Firebase Firestore not initialized");
    callback({ success: false, message: 'Database not initialized.' });
    return () => {};
  }
  const userRef = doc(db, "users", uid);
  return onSnapshot(userRef, (doc) => {
    if (doc.exists()) {
      callback({ success: true, userData: doc.data() });
    } else {
      callback({ success: false, message: 'User profile not found.' });
    }
  }, (error) => {
    console.error("Error listening to user profile:", error);
    callback({ success: false, message: error.message || 'Failed to listen to user profile.' });
  });
};

export const subscribeToTeam = (teamId, callback) => {
  if (!teamId) return () => {}; 
  if (!db) {
    console.error("Firebase Firestore not initialized");
    callback({ success: false, message: 'Database not initialized.' });
    return () => {};
  }
  const teamRef = doc(db, "teams", teamId);
  return onSnapshot(teamRef, async (teamDoc) => {
    if (teamDoc.exists()) {
      const teamData = teamDoc.data();
      const detailedMembers = await Promise.all(
        teamData.members.map(async (member) => {
          try {
            const userDoc = await getDoc(doc(db, "users", member.uid));
            if (userDoc.exists()) {
              const userData = userDoc.data();
              return {
                uid: member.uid,
                username: userData.username || member.username,
                points: userData.points || 0,
                avatar: userData.avatar !== undefined ? userData.avatar : member.avatar || 0,
                email: userData.email
              };
            }
            return member;
          } catch (error) {
            console.error("Error fetching member details:", error);
            return member;
          }
        })
      );
      callback({
        success: true,
        teamData: { ...teamData, id: teamDoc.id, members: detailedMembers }
      });
    } else {
      callback({ success: false, message: 'Team not found.' });
    }
  }, (error) => {
    console.error("Error listening to team:", error);
    callback({ success: false, message: error.message || 'Failed to listen to team updates.' });
  });
};

export const subscribeToAllTeams = (callback) => {
  if (!db) {
    console.error("Firebase Firestore not initialized");
    callback({ success: false, message: 'Database not initialized.' });
    return () => {};
  }

  const teamsRef = collection(db, "teams");

  return onSnapshot(teamsRef, async (snapshot) => {
    const teams = [];
    for (const teamDoc of snapshot.docs) {
      const teamData = teamDoc.data();
      const detailedMembers = await Promise.all(
        teamData.members.map(async (member) => {
          try {
            const userRef = doc(db, "users", member.uid);
            const userDoc = await getDoc(userRef);

            if (userDoc.exists()) {
              const userData = userDoc.data();
              return {
                uid: member.uid,
                username: userData.username || member.username,
                points: userData.points || 0,
                avatar: userData.avatar !== undefined ? userData.avatar : (member.avatar || 0),
                email: userData.email
              };
            }
            return member;
          } catch (error) {
            console.error("Error fetching member details:", error);
            return member;
          }
        })
      );
      teams.push({ id: teamDoc.id, ...teamData, members: detailedMembers });
    }
    callback({ success: true, teams });
  }, (error) => {
    console.error("Error listening to teams:", error);
    callback({ success: false, message: error.message || 'Failed to listen to teams.' });
  });
};


export const updateUserPoints = async (uid, pointsToAdd) => {
  try {
    if (!db) throw new Error("Firebase Firestore not initialized");
    const userRef = doc(db, "users", uid);
    const userDoc = await getDoc(userRef);
    if (!userDoc.exists()) return { success: false, message: 'User not found.' };
    
    const currentPoints = userDoc.data().points || 0;
    const newPoints = Math.max(0, currentPoints + pointsToAdd);
    
    await updateDoc(userRef, { points: newPoints, lastUpdated: new Date().toISOString() });
    return { success: true, newPoints: newPoints };
  } catch (error) {
    console.error("Error updating user points:", error);
    return { success: false, message: error.message || 'Failed to update points.' };
  }
};

// --- Team Management Functions --- 
export const createTeam = async (teamName, leader, maxSize = 5) => {  
  try {
    if (!db) throw new Error("Firebase Firestore not initialized");
    
    const teamQuery = query(collection(db, "teams"), where("teamName", "==", teamName));    
    const querySnapshot = await getDocs(teamQuery);    
    if (!querySnapshot.empty) return { success: false, message: "A team with this name already exists." };     
    
    const userProfile = await getUserProfile(leader.uid);
    if (userProfile.success && userProfile.userData.teamId) {
      return { success: false, message: "You are already in a team. Leave your current team first." };
    }
    
    const teamCode = Math.random().toString(36).substring(2, 8).toUpperCase();    
    const newTeamRef = doc(collection(db, "teams"));         
    
    const leaderMemberObject = { 
      uid: leader.uid, 
      username: leader.username,
      avatar: leader.avatar || 0 
    };

    const newTeamData = {      
      id: newTeamRef.id,      
      teamName: teamName,      
      teamCode: teamCode,      
      leaderId: leader.uid,      
      members: [leaderMemberObject],      
      points: userProfile.success ? userProfile.userData.points || 0 : 0,
      maxSize: maxSize,
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    };    
    await setDoc(newTeamRef, newTeamData);     
    
    const userRef = doc(db, "users", leader.uid);    
    await updateDoc(userRef, { teamId: newTeamRef.id, lastUpdated: new Date().toISOString() });     
    
    // This is the function you likely want to use after creating a team.
    // I am renaming it to be clearer and avoid conflicts.
    await recalculateAndSyncTeamPoints(newTeamRef.id);
    
    return { success: true, team: newTeamData, teamCode: teamCode, message: 'Team created successfully!' };  
  } catch (error) {    
    console.error("Error creating team:", error);    
    return { success: false, message: error.message || "Could not create team. Please try again." };  
  }
}; 

// I have renamed the first `updateTeamPoints` function to be more descriptive of what it does.
// This function recalculates the total points from all members and saves it.
export const recalculateAndSyncTeamPoints = async (teamId) => {
  try {
    if (!db) throw new Error("Firebase Firestore not initialized");
    const teamRef = doc(db, "teams", teamId);
    const teamDoc = await getDoc(teamRef);
    if (!teamDoc.exists()) return { success: false, message: 'Team not found.' };
    
    const teamData = teamDoc.data();
    let totalPoints = 0;
    for (const member of teamData.members) {
      try {
        const userDoc = await getDoc(doc(db, "users", member.uid));
        if (userDoc.exists()) totalPoints += userDoc.data().points || 0;
      } catch (error) {
        console.error("Error fetching member points:", error);
      }
    }
    
    await updateDoc(teamRef, { points: totalPoints, lastUpdated: new Date().toISOString() });
    return { success: true, newPoints: totalPoints };
  } catch (error) {
    console.error("Error recalculating team points:", error);
    return { success: false, message: error.message || 'Failed to recalculate team points.' };
  }
};


export const joinTeam = async (teamCode, user) => {  
  try {
    if (!db) throw new Error("Firebase Firestore not initialized");
    
    const userProfile = await getUserProfile(user.uid);
    if (userProfile.success && userProfile.userData.teamId) {
      return { success: false, message: "You are already in a team. Leave your current team first." };
    }
    
    const teamQuery = query(collection(db, "teams"), where("teamCode", "==", teamCode.toUpperCase()));    
    const querySnapshot = await getDocs(teamQuery);    
    if (querySnapshot.empty) return { success: false, message: "Invalid team code." };     
    
    const teamDoc = querySnapshot.docs[0];
    const teamData = teamDoc.data();
    
    if (teamData.members.some(member => member.uid === user.uid)) {
      return { success: false, message: "You are already a member of this team." };
    }
    if (teamData.members.length >= (teamData.maxSize || 5)) {
      return { success: false, message: "Team is full. Cannot join." };
    }
    
    const newMemberObject = { 
      uid: user.uid, 
      username: user.username,
      avatar: user.avatar || 0 
    };
    
    await updateDoc(teamDoc.ref, { 
      members: arrayUnion(newMemberObject), 
      lastUpdated: new Date().toISOString() 
    });     
    const userRef = doc(db, "users", user.uid);    
    await updateDoc(userRef, { teamId: teamDoc.id, lastUpdated: new Date().toISOString() });
    await recalculateAndSyncTeamPoints(teamDoc.id);
    
    const updatedTeam = await getDoc(teamDoc.ref);    
    return { success: true, team: updatedTeam.data(), message: 'Successfully joined team!' };  
  } catch (error) {    
    console.error("Error joining team:", error);    
    return { success: false, message: error.message || "Could not join team. Please try again." };  
  }
}; 

export const getUserTeam = async (teamId) => {  
  if (!teamId) return null;
  try {
    if (!db) throw new Error("Firebase Firestore not initialized");
    const teamRef = doc(db, "teams", teamId);    
    const teamSnap = await getDoc(teamRef);    
    return teamSnap.exists() ? teamSnap.data() : null;  
  } catch (error) {    
    console.error("Error fetching user's team:", error);    
    return null;  
  }
};

export const leaveTeam = async (teamId, userId) => {
  try {
    if (!db) throw new Error("Firebase Firestore not initialized");
    
    const teamRef = doc(db, "teams", teamId);
    const userRef = doc(db, "users", userId);
    
    const teamSnap = await getDoc(teamRef);
    if (!teamSnap.exists()) return { success: false, message: "Team not found." };
    
    const teamData = teamSnap.data();
    const updatedMembers = teamData.members.filter(member => member.uid !== userId);
    
    await updateDoc(teamRef, { members: updatedMembers, lastUpdated: new Date().toISOString() });
    await updateDoc(userRef, { teamId: deleteField(), lastUpdated: new Date().toISOString() });
    await recalculateAndSyncTeamPoints(teamId);
    
    return { success: true, message: "Successfully left the team." };
  } catch (error) {
    console.error("Error leaving team:", error);
    return { success: false, message: "Failed to leave team. Please try again." };
  }
};

export const updateUserProfile = async (userId, dataToUpdate) => {
  try {
    if (!db) throw new Error("Firebase Firestore not initialized");
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, { ...dataToUpdate, lastUpdated: new Date().toISOString() });
    
    const userDoc = await getDoc(userRef);
    if (userDoc.exists()) {
      const userData = userDoc.data();
      if (userData.teamId && (dataToUpdate.username || dataToUpdate.avatar !== undefined)) {
        const teamRef = doc(db, "teams", userData.teamId);
        const teamDoc = await getDoc(teamRef);
        if (teamDoc.exists()) {
          const teamData = teamDoc.data();
          const updatedMembers = teamData.members.map(member => 
            member.uid === userId ? { 
              ...member, 
              username: dataToUpdate.username || member.username,
              avatar: dataToUpdate.avatar !== undefined ? dataToUpdate.avatar : member.avatar
            } : member
          );
          await updateDoc(teamRef, { members: updatedMembers, lastUpdated: new Date().toISOString() });
        }
      }
    }
    
    return { success: true, message: "Profile updated successfully." };
  } catch (error) {
    console.error("Error updating user profile:", error);
    return { success: false, message: "Failed to update profile." };
  }
};

export const updateTeamSettings = async (teamId, updates) => {
  try {
    if (!db) throw new Error("Firebase Firestore not initialized");
    const teamRef = doc(db, "teams", teamId);
    const teamDoc = await getDoc(teamRef);
    if (!teamDoc.exists()) return { success: false, message: 'Team not found.' };
    
    const teamData = teamDoc.data();
    if (updates.maxSize && updates.maxSize < teamData.members.length) {
      return { success: false, message: `Cannot set team size below current member count (${teamData.members.length})` };
    }
    
    await updateDoc(teamRef, { ...updates, lastUpdated: new Date().toISOString() });
    return { success: true, message: 'Team settings updated successfully.' };
  } catch (error) {
    console.error("Error updating team settings:", error);
    return { success: false, message: error.message || 'Failed to update team settings.' };
  }
};

// --- Leaderboard Functions ---
export const subscribeToAppToggles = (callback) => {
  const toggleRef = doc(db, 'togglepath', 'YBxBxSTodbVvfskD4ROs');
  
  return onSnapshot(toggleRef, (doc) => {
    if (doc.exists()) {
      callback({ success: true, toggles: doc.data() });
    } else {
      callback({ success: true, toggles: { leaderboardLive: true } }); // Default
    }
  }, (error) => {
    console.error("Error fetching app toggles:", error);
    callback({ success: false, error });
  });
};

export const subscribeToTopTeams = (callback) => {
  const teamsQuery = query(
    collection(db, "teams"), 
    orderBy("points", "desc"), 
    limit(3)
  );

  return onSnapshot(teamsQuery, (snapshot) => {
    const teams = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback({ success: true, teams });
  }, (error) => {
    console.error("Error subscribing to top teams:", error);
    callback({ success: false, error });
  });
};

export const getTopTeams = async () => {
  try {
    const teamsQuery = query(
      collection(db, "teams"), 
      orderBy("points", "desc"), 
      limit(3)
    );
    const querySnapshot = await getDocs(teamsQuery);
    const teams = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return { success: true, teams };
  } catch (error) {
    console.error("Error getting top teams:", error);
    return { success: false, error };
  }
};

// --- Round Status Function ---
export const subscribeToRoundStatus = (roundKey, callback) => {
  if (!db) {
    console.error("Firebase Firestore not initialized");
    callback({ success: false, message: 'Database not initialized.' });
    return () => {};
  }

  const toggleRef = doc(db, 'togglepath', 'YBxBxSTodbVvfskD4ROs');

  return onSnapshot(toggleRef, (doc) => {
    if (doc.exists()) {
      const data = doc.data();
      const isActive = data[roundKey] === true; 
      callback({ success: true, isActive: isActive });
    } else {
      callback({ success: false, message: 'Toggle document not found.', isActive: false });
    }
  }, (error) => {
    console.error(`Error listening to ${roundKey} status:`, error);
    callback({ success: false, message: error.message, isActive: false });
  });
};

export const subscribeToContent = (docId, callback) => {
  if (!db) {
    console.error("Firebase Firestore not initialized");
    return () => {};
  }
  
  const contentRef = doc(db, 'content', docId);
  
  return onSnapshot(contentRef, (doc) => {
    if (doc.exists()) {
      callback({ success: true, data: doc.data() });
    } else {
      callback({ success: false, message: 'Content not found.' });
    }
  }, (error) => {
    console.error(`Error listening to content [${docId}]:`, error);
    callback({ success: false, error });
  });
};
export const subscribeToAllQuestions = (callback) => {
  if (!db) {
    console.error("Firebase Firestore not initialized");
    return () => {};
  }
  
  const questionsQuery = query(collection(db, "questions"), orderBy("order", "asc"));
  
  return onSnapshot(questionsQuery, (snapshot) => {
    const questions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback({ success: true, questions });
  }, (error) => {
    console.error("Error subscribing to questions:", error);
    callback({ success: false, error });
  });
};

export const subscribeToQuestionToggles = (callback) => {
  if (!db) {
    console.error("Firebase Firestore not initialized");
    return () => {};
  }
  
  const togglesRef = doc(db, 'questionToggles', 'status');
  
  return onSnapshot(togglesRef, (doc) => {
    if (doc.exists()) {
      callback({ success: true, toggles: doc.data() });
    } else {
      callback({ success: true, toggles: {} });
    }
  }, (error) => {
    console.error("Error fetching question toggles:", error);
    callback({ success: false, error });
  });
};
export const subscribeToRound3Questions = (callback) => {
  if (!db) {
    console.error("Firebase Firestore not initialized");
    return () => {};
  }
  
  const questionsQuery = query(collection(db, "round3_questions"), orderBy("order", "asc"));
  
  return onSnapshot(questionsQuery, (snapshot) => {
    const questions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback({ success: true, questions });
  }, (error) => {
    console.error("Error subscribing to Round 3 questions:", error);
    callback({ success: false, error });
  });
};


export const isEmailAllowed = async (email) => {
  if (!email) return false;
  const docId = 'QbD3yJabVhYfFYNG6AKJ';
  const docRef = doc(db, 'allowed_emails', docId);

  try {
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      const allowedEmailsList = data.allowed_emails || [];
      return allowedEmailsList.includes(email.toLowerCase());
    } else {
      console.error("Allowed emails document not found!");
      return false;
    }
  } catch (error) {
    console.error("Error checking if email is allowed:", error);
    return false;
  }
};
export const signUpWithEmailAndPassword = async (email, password, username) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

   await setDoc(doc(db, "users", user.uid), {
      username: username,
      email: email,
      uid: user.uid,
      points: 0,
      avatar: 0,
      createdAt: new Date().toISOString()
    });

    return { success: true, user };
  } catch (error) {
    console.error("Error signing up:", error.message);
    return { success: false, message: error.message };
  }
};
export const getRoundLinks = async (roundId) => {
  try {
    const docRef = doc(db, "round_configs", roundId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists() && docSnap.data().hackerrank_links) {
      return docSnap.data().hackerrank_links;
    } else {
      console.error("No links document found or it is empty.");
      return null;
    }
  } catch (error) {
    console.error("Error fetching round links:", error);
    return null;
  }
};

export const subscribeToRoundConfig = (roundName, callback) => {
  const docRef = doc(db, "round_configs", roundName);
  return onSnapshot(docRef, (doc) => {
    if (doc.exists()) {
      callback({ success: true, data: doc.data() });
    } else {
      callback({ success: false, message: "Round config document not found" });
    }
  });
};

export const getHouseQuestions = async (houseName) => {
  if (!houseName) return { success: false, message: "No house name provided" };
  const docRef = doc(db, "round3_questions", houseName);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { success: true, data: docSnap.data().links };
  } else {
    return { success: false, message: "Questions not found for this house" };
  }
};
export const subscribeToQuestionVisibility = (callback) => {
  const docRef = doc(db, "round_configs", "round3");
  return onSnapshot(docRef, (doc) => {
    if (doc.exists() && doc.data().isVisible === true) {
      callback({ success: true, isVisible: true });
    } else {
      callback({ success: false, isVisible: false });
    }
  });
};
export const getTeamIdForCurrentUser = async () => {
  const user = auth.currentUser;
  if (!user) return null;
  const userDocRef = doc(db, "users", user.uid);
  const userDoc = await getDoc(userDocRef);
  return userDoc.exists() ? userDoc.data().teamId : null;
};
export const getHouseForTeam = async (teamId) => {
  if (!teamId) return null;
  const teamDocRef = doc(db, "teams", teamId);
  const teamDoc = await getDoc(teamDocRef);
  return teamDoc.exists() ? teamDoc.data().house : null;
};

export const fetchQuestionWithTestCases = async (questionId) => {
  if (!questionId) {
    console.error("No question ID provided.");
    return null;
  }
  try {
    const questionDocRef = doc(db, 'questions', questionId);
    const questionDocSnap = await getDoc(questionDocRef);

    if (!questionDocSnap.exists()) {
      console.error(`Question with ID "${questionId}" not found.`);
      return null;
    }
    const questionData = { id: questionDocSnap.id, ...questionDocSnap.data() };
    const testCasesCollectionRef = collection(db, 'questions', questionId, 'testCases');
    const q = query(testCasesCollectionRef, orderBy('__name__'));
    const testCasesQuerySnap = await getDocs(q);

    const testCases = [];
    testCasesQuerySnap.forEach((doc) => {
      testCases.push(doc.data());
    });
    return { ...questionData, testCases: testCases };
  } catch (error) {
    console.error("Error fetching question with test cases:", error);
    return null;
  }
};

export async function getTeamPoints(teamId) {
  try {
    if (!db) throw new Error("Firebase Firestore not initialized");
    
    const teamDoc = await getDoc(doc(db, "teams", teamId));
    if (teamDoc.exists()) {
      const data = teamDoc.data();
      return {
        success: true,
        points: data.points || 0
      };
    } else {
      return {
        success: false,
        message: "Team not found",
        points: 0
      };
    }
  } catch (error) {
    console.error("Error getting team points:", error);
    return {
      success: false,
      message: error.message,
      points: 0
    };
  }
}

// ✅ **FIXED: This is the only 'updateTeamPoints' function now.**
// It directly sets the new point value, which is what your Round 3 page needs.
export async function updateTeamPoints(teamId, newPoints) {
  try {
    if (!db) throw new Error("Firebase Firestore not initialized");
    
    await updateDoc(doc(db, "teams", teamId), {
      points: newPoints,
      lastUpdated: serverTimestamp()
    });
    return {
      success: true,
      message: "Points updated successfully"
    };
  } catch (error) {
    console.error("Error updating team points:", error);
    return {
      success: false,
      message: error.message
    };
  }
}

export async function getURLPuzzleData() {
  try {
    if (!db) throw new Error("Firebase Firestore not initialized");
    const puzzleDoc = await getDoc(doc(db, "gameSettings", "urlPuzzle"));
    if (puzzleDoc.exists()) {
      return {
        success: true,
        data: puzzleDoc.data()
      };
    } else {
      console.warn("URL Puzzle data not found in Firestore. Using default data.");
      return {
        success: false,
        message: "Puzzle data not found in DB."
      };
    }
  } catch (error) {
    console.error("Error getting URL puzzle data:", error);
    return {
      success: false,
      message: error.message
    };
  }
}

export function checkURLAnswer(userGuess, correctUrl) {
  try {
    // Clean and normalize both URLs
    const cleanGuess = userGuess.trim().toLowerCase().replace(/\/+$/, '').replace(/^https?:\/\//, '');
    const cleanCorrect = correctUrl.toLowerCase().replace(/\/+$/, '').replace(/^https?:\/\//, '');
    
    return {
      correct: cleanGuess === cleanCorrect,
      userGuess: cleanGuess,
      correctUrl: cleanCorrect
    };
  } catch (error) {
    console.error("Error checking URL answer:", error);
    return { correct: false, error: error.message };
  }
}
// Add these functions after the existing functions:

// Get team's house (movie title) from team document
export const getTeamHouse = async (teamId) => {
  try {
    if (!db) throw new Error("Firebase Firestore not initialized");
    
    const teamDoc = await getDoc(doc(db, 'teams', teamId));
    if (teamDoc.exists()) {
      return teamDoc.data().house; // This should contain the movie title
    }
    return null;
  } catch (error) {
    console.error("Error getting team house:", error);
    return null;
  }
};

// Get movie-specific URL puzzle based on movie title
export const getMovieUrlPuzzle = async (movieTitle) => {
  try {
    if (!db) throw new Error("Firebase Firestore not initialized");
    
    // Query the round3_questions collection for the movie title
    const q = query(
      collection(db, 'round3_questions'), 
      where("title", "==", movieTitle)
    );
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      return querySnapshot.docs[0].data();
    }
    return null;
  } catch (error) {
    console.error("Error getting movie puzzle:", error);
    return null;
  }
};

// Get current user ID
export const getCurrentUserId = () => {
  if (!auth || !auth.currentUser) {
    return null;
  }
  return auth.currentUser.uid;
};

// Subscribe to house-specific URL puzzles
export const subscribeToHouseUrlPuzzle = (houseName, callback) => {
  if (!houseName || !db) {
    console.error("Invalid parameters for house URL puzzle subscription");
    return () => {};
  }
  
  const q = query(collection(db, "round3_questions"), where("title", "==", houseName));
  
  return onSnapshot(q, (snapshot) => {
    if (!snapshot.empty) {
      const puzzleData = snapshot.docs[0].data();
      callback({ success: true, data: puzzleData });
    } else {
      callback({ success: false, message: "No puzzle found for this house" });
    }
  }, (error) => {
    console.error("Error subscribing to house URL puzzle:", error);
    callback({ success: false, error });
  });
};