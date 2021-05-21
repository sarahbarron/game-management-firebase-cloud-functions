// Import the Firebase SDK for Google Cloud Functions.
const functions = require("firebase-functions");

const {
  getCompetitionDocument,
  getGradeDocument,
  getCountyDocument,
  getTeamDocument,
  getClubDocument,
  createGameInRealtimeDB,
  createGradeInRealtimeDB,
  createCompetitionInRealtimeDB,
  createTeamInRealtimeDB,
  getTodaysGames,
  getGameDocument,
  createGameTimesInRealtimeDB,
} = require("./databaseHelpers");


// Create realtime database references for todays games
const createTodaysGames =async function() {
  // Return Todays Games
  try {
    // Return todays games
    const games = await getTodaysGames();
    functions.logger.info(`games docs returned: ${games.length}`);
    if (games.length>0) {
      // Create an entry for each game in the realtime db
      for (const doc of games) {
        functions.logger.log(`Document found at path: ${doc.ref.path}`);

        // Return the document for the game
        const game = await getGameDocument(doc.id);

        if (game != null || game !=undefined) {
          functions.logger.log(`Game Returned: 
          ${game.id}, ${JSON.stringify(game)}`);

          // Create the games competition
          await createCompetition(game);

          // Create the teams
          await createTeam("teamA", game);
          await createTeam("teamB", game);

          // Create times
          await createTimes(game);
        } else {
          functions.logger.log(`Game ${doc.ref.path}: Does not exist`);
        }
      }
    } else {
      functions.logger.log("There are no games today");
    }
    return null;
  } catch (e) {
    functions.logger.warn(`Exception: createTodaysGames: ${e}`);
  }
};

// Create a competition and details for a game in realtime DB
const createCompetition = async function(game) {
  // competition
  let gameId=null;
  let compName = null;
  let sportType = null;
  let isNational = null;
  let gradeName = null;
  let gradeLevel = null;
  let compInCounty = null;
  let isAClubGame = false;
  let isACountyGame = false;
  try {
    if (game!=null && game!=undefined) {
      gameId=game.id;
      const compId = game.get("competition").id;
      functions.logger.log(`compDocRef: ${compId}`);

      const compDetails = await getCompetitionDetails(compId);
      functions.logger.log(compDetails);
      if (compDetails!=null || compDetails!=undefined) {
        compName = compDetails[0];
        sportType = compDetails[1];
        isNational = compDetails[2];
        gradeName = compDetails[3];
        gradeLevel = compDetails[4];
        compInCounty = compDetails[5];
        /* Boolean values to distinguish
    between a club or county game
    */
        if (compInCounty == null) {
          isACountyGame = true;
        } else {
          isAClubGame = true;
        }
      }

      // Write to the Realtime DB
      await createGameInRealtimeDB(gameId, isAClubGame,
          isACountyGame, sportType);
      await createCompetitionInRealtimeDB(gameId, compId,
          compName, isNational, compInCounty);
      await createGradeInRealtimeDB(gameId,
          gradeName, gradeLevel);
    }
    return null;
  } catch (e) {
    functions.logger.warn("Exception: createCompetition"+e);
  }
};

// Get the competition details needed for the realtime DB
const getCompetitionDetails = async function(compId) {
  // Competition Document
  try {
    const competitionDocument = await getCompetitionDocument(compId);

    if (competitionDocument!=null && competitionDocument!=undefined) {
      functions.logger.log(`Competition Returned: 
        ${competitionDocument.id}, ${JSON.stringify(competitionDocument)}`);

      let sportType = null;
      let competitionName = null;
      let gradeDocRef = null;
      let gradeDocument = null;
      let gradeName = null;
      let gradeLevel = null;
      let isNational = null;
      let competitionCounty = null;

      // Competition name

      const compDocName= await competitionDocument.get("name");
      functions.logger.log(`Competition DocName: ${compDocName}`);
      if (compDocName !=null && compDocName !=undefined) {
        competitionName = compDocName;
      }

      // Competition Sport Type
      const compDocSport = await competitionDocument.get("sportType");

      if (compDocSport!=null && compDocSport!=undefined) {
        functions.logger.log(`Competition DocSport: ${compDocSport.id}`);
        sportType = compDocSport.id;
      }
      functions.logger.log(`Sport Type ${sportType}`);

      // Competition Grade
      const compDocGrade = await competitionDocument.get("grade");

      if (compDocGrade != null && compDocGrade != undefined) {
        functions.logger.log(`Competition Grade ${compDocGrade.id}`);
        gradeDocRef = compDocGrade;
        gradeDocument = await getGradeDocument(gradeDocRef.id);
        if (gradeDocument!=null && gradeDocument!=undefined) {
          functions.logger.log(`Competition Grade Document: 
          ${gradeDocument.id} : ${JSON.stringify(gradeDocument)}`);
        }
      }


      if (gradeDocument !=null && gradeDocument!=undefined) {
        // Grade Name
        const compGradeName = await gradeDocument.get("name");
        if (compGradeName && compGradeName!=undefined) {
          gradeName = compGradeName;
          functions.logger.log(`Grade Name: ${gradeName}`);
        }

        // Grade Level
        const compGradeLevel = await await gradeDocument.get("level");
        if (compGradeLevel != null && compGradeLevel != undefined) {
          gradeLevel = compGradeLevel;
          functions.logger.log(`Grade Level ${gradeLevel}`);
        }
      }

      // Competition isNational
      const compNational = competitionDocument.get("isNational");
      if (compNational != null && compNational != undefined) {
        isNational = compNational;
        functions.logger.log(`isNational ${isNational}`);
      }

      const compCounty = competitionDocument.get("county");
      // Competition County
      if (compCounty!=null && compCounty!=undefined) {
        const competitionCountyDoc = await getCountyDocument(compCounty.id);
        if (competitionCountyDoc!=null && competitionCountyDoc!=undefined) {
          competitionCounty = competitionCountyDoc.id;
          functions.logger.log(`Competition County: ${competitionCounty}`);
        }
      }

      functions.logger.log(`Competition Details\n
            Name: ${competitionName}\n
            Sport: ${sportType}\n
            isNational: ${isNational}\n
            gradeName: ${gradeName}\n
            Grade Level: ${gradeLevel}\n
            Within County: ${competitionCounty}`);

      return [
        competitionName,
        sportType,
        isNational,
        gradeName,
        gradeLevel,
        competitionCounty];
    } else {
      functions.logger.warn(`There is no competition with id: ${compId}`);
    }
    return null;
  } catch (e) {
    functions.logger.log(`Exception GetCompDetails: ${e}`);
    return null;
  }
};


// Create team and details needed in the realtime db
const createTeam = async function(teamAOrB, game) {
  try {
    if (game!=null && game!=undefined) {
      let teamName = null;
      let teamClubDocumentRef = null;
      let teamCountyDocumentRef = null;
      let teamCrestUrl = null;
      let teamColors = null;
      let teamClubId = null;
      let teamCountyId = null;

      const teamId = game.get(`${teamAOrB}`).id;
      functions.logger.log(`team: ${teamAOrB}: 
      teamDocRef: ${teamId}`);
      const teamDetails = await getTeamDetails(teamId);
      if (teamDetails != null && teamDetails !=undefined) {
        teamName = teamDetails[0];
        teamClubDocumentRef = teamDetails[1];
        teamCountyDocumentRef = teamDetails[2];
      }
      functions.logger.log(`${teamAOrB} Details: ${teamName}, 
      ${teamClubDocumentRef}, ${teamCountyDocumentRef}`);

      if (teamClubDocumentRef != null &&
        teamClubDocumentRef!=undefined) {
        teamClubId = teamClubDocumentRef.id;
        const clubDetails = await getClubDetails(teamClubId);
        if (clubDetails!=null && clubDetails != undefined) {
          teamCrestUrl = clubDetails[0];
          teamColors = clubDetails[1];
        }
      } else if (teamCountyDocumentRef !=null &&
        teamCountyDocumentRef!=undefined) {
        teamCountyId = teamCountyDocumentRef.id;
        const countyDetails = await getCountyDetails(teamCountyId);
        if (countyDetails!=null && countyDetails!=undefined) {
          teamCrestUrl = countyDetails[0];
          teamColors = countyDetails[1];
        }
      }

      functions.logger.log(`Club: ${teamClubId}: County: ${teamCountyId}
      Colors: ${teamColors}, Crest: ${teamCrestUrl}`);
      await createTeamInRealtimeDB(teamAOrB, game.id, teamId,
          teamName, teamCrestUrl, teamColors, teamClubId,
          teamCountyId);
    } else {
      functions.logger.warn(`Can't create ${teamAOrB}`);
    }
    return null;
  } catch (e) {
    functions.logger.log("Exception createTeam:"+e);
  }
};

// return the team details needed for realtime db
const getTeamDetails = async function(teamId) {
  try {
    // Team A Document
    const teamDocument = await getTeamDocument(teamId);
    if (teamDocument != null && teamDocument != undefined) {
      functions.logger.log(`Team Returned: 
         ${teamDocument.id}, ${JSON.stringify(teamDocument)}`);


      // Team A Name
      const teamName = teamDocument.get("name");
      functions.logger.log(`Team A Name: ${teamName}`);

      // Team A Club
      const teamClubDocRef = teamDocument.get("club");
      functions.logger.log(`Team Club ${teamClubDocRef}`);
      // Team A County
      const teamCountyDocRef = teamDocument.get("county");
      functions.logger.log(`team A County Id ${teamCountyDocRef}`);
      return [teamName, teamClubDocRef, teamCountyDocRef];
    } else {
      functions.logger.warn(`Can't get team : ${teamId}`);
    }
    return null;
  } catch (e) {
    functions.logger.log(`Exception: getTeamDetails ${e}`);
    return null;
  }
};

// return the teams club details need for realtime DB
const getClubDetails = async function(documentId) {
  try {
    const clubDocument = await getClubDocument(documentId);
    if (clubDocument !=null && clubDocument !=undefined) {
      const crestUrl = clubDocument.get("crest");
      const colors = clubDocument.get("colors");

      return [crestUrl, colors];
    } else {
      functions.logger.warn(`Cant get club: ${documentId}`);
    }
    return null;
  } catch (e) {
    functions.logger.log(`Exception: GetClubDetails: ${e}`);
    return null;
  }
};

// Return the teams county details needed for realtimeDB
const getCountyDetails = async function(documentId) {
  try {
    const countyDocument = await getCountyDocument(documentId);
    if (countyDocument != null && countyDocument!=undefined) {
      const crestUrl = countyDocument.get("crest");
      const colors = countyDocument.get("colors");
      return [crestUrl, colors];
    } else {
      functions.logger.warn(`Cant get county: ${documentId}`);
    }
    return null;
  } catch (e) {
    functions.logger.log("Exception: getCountyDetails ${e}");
  }
};

/* Create start time only and timestamp for a
game in the realtime DB
*/
const createTimes = async function(game) {
  try {
    if (game!=null && game !=undefined) {
      const timestamp = game.get("dateTime");
      if (timestamp!=null && timestamp!=undefined) {
        const hour = game.get("dateTime").toDate().getHours();
        let mins = game.get("dateTime").toDate().getMinutes();
        if (mins<10) {
          mins = `${mins}0`;
        }
        const startTime = `${hour}:${mins}`;
        functions.logger.log(`Game Time: ${startTime}`);

        await createGameTimesInRealtimeDB(game.id, timestamp, startTime);
      } else {
        functions.logger.log(`No timestamp for game: ${game.id}`);
      }
    } else {
      functions.logger.log("Game does not exist");
    }
    return null;
  } catch (e) {
    functions.logger.log("Exception: createTimes: "+e);
  }
};

module.exports={getCompetitionDetails, getTeamDetails,
  getClubDetails, getCountyDetails, createCompetition,
  createTeam, createTodaysGames, createTimes};
