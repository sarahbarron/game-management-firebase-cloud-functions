// Import the Firebase SDK for Google Cloud Functions.
const functions = require("firebase-functions");
// Import and initialize the Firebase Admin SDK.
const admin = require("firebase-admin");

// Initialize App
try {
  admin.initializeApp();
} catch (e) {
  functions.logger.warn(`Exception initializing the APP: ${e}`);
}
// Initialize database
const db = admin.firestore();
const rtdb = admin.database();


// Get Todays Games
const getTodaysGames = async function() {
  try {
    const localDate = new Date();
    functions.logger.log("Date"+localDate);

    const query = db.collection("Game");

    const querySnapshot = await query.get();
    if (querySnapshot.empty) {
      return null;
    } else {
      const docs = querySnapshot.docs;
      for (const doc of docs) {
        functions.logger.log(`Document found at path: ${doc.ref.path}`);
      }
      return docs;
    }
  } catch (e) {
    functions.logger.error(`Exception: getTodaysGames: ${e}`);
  }
};

// Return a game document
const getGameDocument = async function(gameId) {
  try {
    functions.logger.log(`Get Game Document Ref Path: ${gameId}`);
    const query = db.collection("Game").doc(gameId);
    const querySnapshot = await query.get();
    if (querySnapshot.empty) {
      functions.logger.warn(`No Game matching ${gameId}`);
      return null;
    } else {
      functions.logger.info(`Game: ${querySnapshot.id}`);
      return querySnapshot;
    }
  } catch (e) {
    functions.logger.error(`Exception: getGameDocument: ${e}`);
  }
};


// Return a member document
const getMemberDocument = async function(memberId) {
  try {
    functions.logger.log(`Get Member Document: ${memberId}`);
    const query = db.collection("Member").doc(memberId);
    const querySnapshot = await query.get();
    if (querySnapshot.empty) {
      functions.logger.log(`No Member with id: ${memberId}`);
      return null;
    } else {
      functions.logger.info(`Return Member:
      ${memberId}, ${JSON.stringify(querySnapshot)}`);
      return querySnapshot;
    }
  } catch (e) {
    functions.logger.log(`Exception getMemberDocument ${e}`);
  }
};

const getCompetitionDocument = async function(compId) {
  try {
    functions.logger.log(`Get Competition Document: ${compId}`);
    const query = db.collection("Competition").doc(compId);
    const querySnapshot = await query.get();
    if (querySnapshot.empty) {
      functions.logger.warn(`No Competition with ref: ${compId}`);
      return null;
    } else {
      functions.logger.info(`Return Competition: 
        ${compId}, ${JSON.stringify(querySnapshot)}`);
      return querySnapshot;
    }
  } catch (e) {
    functions.logger.log(`Exception: getCompetitionDocument: ${e}`);
  }
};

const getTeamDocument = async function(teamId) {
  try {
    functions.logger.log(`Get Team Document: ${teamId}`);
    const query = db.collection("Team").doc(teamId);
    const querySnapshot = await query.get();
    if (querySnapshot.empty) {
      functions.logger.warn(`No Team with ref: ${teamId}`);
      return null;
    } else {
      functions.logger.info(`Return Team: 
        ${teamId}, ${JSON.stringify(querySnapshot)}`);
      return querySnapshot;
    }
  } catch (e) {
    functions.logger.log(`Exception: getTeamDocument: ${e}`);
  }
};

const getClubDocument = async function(clubId) {
  try {
    if (clubId!=null && clubId!=undefined) {
      functions.logger.log(`Get Club Document: ${clubId}`);
      const query = db.collection("Club").doc(clubId);
      const querySnapshot = await query.get();
      if (querySnapshot.empty) {
        functions.logger.warn(`No Club with ref: ${clubId}`);
        return null;
      } else {
        functions.logger.info(`Return Club: 
        ${clubId}, ${JSON.stringify(querySnapshot)}`);
        return querySnapshot;
      }
    }
  } catch (e) {
    functions.logger.log(`Exception: getClubDocument: ${e}`);
  }
};

const getCountyDocument = async function(countyId) {
  try {
    if (countyId !=null && countyId!=undefined) {
      functions.logger.log(`Get County Document: ${countyId}`);
      const query = db.collection("County").doc(countyId);
      const querySnapshot = await query.get();
      if (querySnapshot.empty) {
        functions.logger.warn(`No County with ref: ${countyId}`);
        return null;
      } else {
        functions.logger.info(`Return County: 
        ${countyId}, ${JSON.stringify(querySnapshot)}`);
        return querySnapshot;
      }
    }
  } catch (e) {
    functions.logger.log(`Exception: getCountyDocument: ${e}`);
  }
};

const getGradeDocument = async function(gradeId) {
  try {
    if (gradeId !=null && gradeId !=undefined) {
      functions.logger.log(`Get Grade: ${gradeId}`);
      const query = db.collection("Grade").doc(gradeId);
      const querySnapshot = await query.get();
      if (querySnapshot.empty) {
        functions.logger.warn(`No Grade with ref: ${gradeId}`);
        return null;
      } else {
        functions.logger.info(`Return Grade: 
        ${gradeId}, ${JSON.stringify(querySnapshot)}`);
        return querySnapshot;
      }
    }
  } catch (e) {
    functions.logger.log(`Exception: getCompetitionGrade: ${e}`);
  }
};

const createGameInRealtimeDB = async function(gameId, club, county, sportType) {
  try {
    if (club==undefined) {
      club = null;
    }
    if (county == undefined) {
      county = null;
    }
    if (gameId!=null && gameId!=undefined) {
      return await rtdb.ref(`games/${gameId}`).set({
        isAClubGame: club,
        isACountyGame: county,
        teamAGoals: 0,
        teamBGoals: 0,
        teamAPoints: 0,
        teamBPoints: 0,
        sportType: sportType,
      });
    }
    return null;
  } catch (e) {
    functions.logger.log(`Exception: createGameInRealtimeDB ${e}`);
  }
};
const createCompetitionInRealtimeDB = async function(gameId, compId,
    compName, isNational, compCounty) {
  try {
    if ( compId== undefined) {
      compId=null;
    }
    if ( compName== undefined) {
      compName =null;
    }
    if ( isNational== undefined) {
      isNational =null;
    }
    if ( compCounty== undefined) {
      compCounty=null;
    }

    if (gameId!=null && gameId!=undefined) {
      return await rtdb.ref(`games/${gameId}/competition`).set({
        competitionId: compId,
        competitionName: compName,
        isNational: isNational,
        competitionCounty: compCounty,
      });
    }

    return null;
  } catch (e) {
    functions.logger.log(`Exception: createGameInRealTimeDB: ${e}`);
  }
};

const createTeamInRealtimeDB = async function(teamAOrB, gameId, teamId,
    name, crest, colors, clubId, countyId) {
  try {
    if (gameId!=null && gameId!=undefined) {
      if (teamId==undefined) {
        teamId = null;
      }
      if (name==undefined) {
        teamId = null;
      }
      if (crest ==undefined) {
        crest = null;
      }
      if (colors==undefined) {
        colors=null;
      }
      if (clubId==undefined) {
        clubId = null;
      }
      if (countyId==undefined) {
        countyId = null;
      }
      return await rtdb.ref(`games/${gameId}/${teamAOrB}`).set({
        teamId: teamId,
        teamName: name,
        crest: crest,
        colors: colors,
        clubId: clubId,
        countyId: countyId,
      });
    }
  } catch (e) {
    functions.logger.log(`Exception: createTeamInRealtimeDB: ${e}`);
  }
};

const createGradeInRealtimeDB = async function(gameId,
    name, level) {
  try {
    if (name == undefined) {
      name = null;
    }
    if (level == undefined) {
      level = null;
    }
    if (gameId !=null && gameId !=undefined) {
      return await rtdb.ref(`games/${gameId}/grade`).set({
        gradeName: name,
        gradeLevel: level,
      });
    }
    return null;
  } catch (e) {
    functions.logger.log(`Exception: createGradeInRealTimeDB: ${e}`);
  }
};

const createGameTimesInRealtimeDB = async function(
    gameId, timestamp, startTime) {
  try {
    if (startTime==undefined) {
      startTime = null;
    }
    if (timestamp == undefined) {
      timestamp = null;
    }
    if (gameId!=null && gameId!=undefined) {
      return await rtdb.ref(`games/${gameId}/times`).set({
        timestamp: timestamp,
        startTime: startTime,
        inProgress: false,
        firstHalf: false,
        secondHalf: false,
        halfTime: false,
        fullTime: false,
      });
    }
  } catch (e) {
    functions.logger.log(`Exception createGameTimesInRealtimeDB: ${e}`);
  }
};

const updateLatestScoreInRealtimeDB = async function(
    gameId, teamName,
    scoreType, playerName, time ) {
  try {
    if (teamName==undefined) {
      teamName=null;
    }
    if (playerName==undefined) {
      playerName="unknown";
    }
    if (scoreType==undefined) {
      scoreType = null;
    }
    if (time==undefined) {
      time=null;
    }

    if (gameId!=null && gameId!=undefined) {
      return await rtdb.ref(`games/${gameId}`).update({
        latestTeamName: teamName,
        latestPlayer: playerName,
        latestTime: time,
        latestScoreType: scoreType,
      });
    }
  } catch (e) {
    functions.logger.log(`Exception updateLatestScoreInRealtimeDB: ${e}`);
  }
};


const updateTeamAGoalsTotalScoreInRealtimeDB =
async function(gameId, totalScore) {
  try {
    if (gameId!=null && gameId!=undefined &&
      totalScore!=null && totalScore!=undefined &&
      totalScore>0) {
      functions.logger.log("Team A Goals incremented by 1");
      return await rtdb.ref(`games/${gameId}`).update({
        teamAGoals: totalScore,
      });
    } else {
      functions.logger.log(`Unable to update TeamAGoals ${gameId}: 
      ${totalScore}`);
    }
  } catch (e) {
    functions.logger.log("Exception updateTeamAGoalsTotalScoreInRTDB"+e);
  }
};
const updateTeamAPointsTotalScoreInRealtimeDB =
async function(gameId, totalScore) {
  try {
    if (gameId!=null && gameId!=undefined &&
      totalScore!=null && totalScore!=undefined &&
      totalScore>0) {
      functions.logger.log("Team A Points incremented by 1");
      return await rtdb.ref(`games/${gameId}`).update({
        teamAPoints: totalScore,
      });
    } else {
      functions.logger.log(`Unable to update TeamAGoals ${gameId}:
      ${totalScore}`);
    }
  } catch (e) {
    functions.logger.log("Exception updateTeamAGoalsTotalScoreInRTDB"+e);
  }
};
const updateTeamBGoalsTotalScoreInRealtimeDB =
async function(gameId, totalScore) {
  try {
    if (gameId!=null && gameId!=undefined &&
      totalScore!=null && totalScore!=undefined &&
      totalScore>0) {
      functions.logger.log("Team B Goals incremented by 1");
      return await rtdb.ref(`games/${gameId}`).update({
        teamBGoals: totalScore,
      });
    } else {
      functions.logger.log(`Unable to update TeamAGoals ${gameId}
      ${totalScore}`);
    }
  } catch (e) {
    functions.logger.log("Exception updateTeamAGoalsTotalScoreInRTDB"+e);
  }
};
const updateTeamBPointsTotalScoreInRealtimeDB =
async function(gameId, totalScore) {
  try {
    if (gameId!=null && gameId!=undefined &&
      totalScore!=null && totalScore!=undefined &&
      totalScore>0) {
      functions.logger.log("Team B Points incremented by 1");
      return await rtdb.ref(`games/${gameId}`).update({
        teamBPoints: totalScore,
      });
    } else {
      functions.logger.log(`Unable to update TeamAGoals ${gameId}
      ${totalScore}`);
    }
  } catch (e) {
    functions.logger.log("Exception updateTeamAGoalsTotalScoreInRTDB"+e);
  }
};
module.exports={getTodaysGames, getGameDocument, getTeamDocument,
  getClubDocument, getCountyDocument, getCompetitionDocument,
  getGradeDocument, createCompetitionInRealtimeDB,
  createGradeInRealtimeDB, createGameInRealtimeDB,
  createTeamInRealtimeDB, createGameTimesInRealtimeDB,
  getMemberDocument, updateLatestScoreInRealtimeDB,
  updateTeamAGoalsTotalScoreInRealtimeDB,
  updateTeamBGoalsTotalScoreInRealtimeDB,
  updateTeamAPointsTotalScoreInRealtimeDB,
  updateTeamBPointsTotalScoreInRealtimeDB};
