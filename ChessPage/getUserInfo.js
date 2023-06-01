
const axios = require('axios');

async function getPlayerProfile(username) {
    try {
        const response = await axios.get(`https://api.chess.com/pub/player/${username}`);
        const data = await response.data;
        console.log(`Player Profile Saved`)
        return data;
    } catch (error) {
        if (error.response && error.response.status === 404) {
            throw new Error('Username not found in getPlayerProfile');
        }
        throw error;
    }
}

// Modify your getPlayerStats function
async function getPlayerStats(username) {
    try {
        const response = await axios.get(`https://api.chess.com/pub/player/${username}/stats`);
        const data = await response.data;
        console.log(`Player Stats Saved`)
        return data;
    } catch (error) {
        if (error.response && error.response.status === 404) {
            throw new Error('Username not found in getPlayerStats');
        }
        throw error;
    }
}

async function userInformation(username){
    try {
        const playerProfile = await getPlayerProfile(username)
        const playerStats =  await getPlayerStats(username)
    
    
        const user_profile = {
            name: playerProfile.name,
            url: playerProfile.url,
            avatar: playerProfile.avatar,
            userName: playerProfile.username,
            best_bullet: playerStats.chess_bullet.best.rating,
            best_blitz: playerStats.chess_blitz.best.rating,
            best_rapid: playerStats.chess_rapid.best.rating,
        }
    
        console.log(user_profile)
    
        return user_profile
        
    } catch (error) {
        throw error;  // Re-throw the error after logging
    }
}
module.exports = {userInformation}