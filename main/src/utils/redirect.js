export function getTeamHackerrankLink(teamName, links) {
  // The links array is now passed in as an argument
  if (!links || links.length === 0) {
    console.error("Links array is empty or not provided.");
    return null; 
  }

  if (!teamName) {
    return links[0]; // Return the first link by default
  }

  // Hashing algorithm remains the same
  let hash = 0;
  for (let i = 0; i < teamName.length; i++) {
    const char = teamName.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0; 
  }

  const linkIndex = Math.abs(hash % links.length);
  return links[linkIndex];
}
