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
// const rtdb = admin.database();

// Daily fetch to todays games
exports.scheduledDailyGetGames=functions.pubsub.schedule("00 01 * * *")
    .timeZone("Europe/Dublin")
    .onRun((context) => {
      try {
        functions.logger.log("This will be run every day at 1 AM");
        createTodaysGames();
        return null;
      } catch (e) {
        functions.logger.log(`Exception: ScheduleDailyGetGames: ${e}`);
      }
    });

// Create realtime database references for todays games
const createTodaysGames =async function() {
  // Return Todays Games
  try {
    // Return todays games
    const games = await getTodaysGames();
    functions.logger.info(`games docs returned: ${games.length}`);
    if (games.length>0) {
      // Return the document of each game
      for (const doc of games) {
        functions.logger.log(`Document found at path: ${doc.ref.path}`);
        const game = await getGameDocument(doc.ref.path);

        if (game != null || game !=undefined) {
          const gameId = game.id;
          functions.logger.log(`Game Returned: 
          ${game.id}, ${JSON.stringify(game)}`);
          // const gameDocRef;
          // let compName;
          // const compDocRef;
          // let clubGame = false;
          // let countyGame = false;
          // let countyName;

          // let startTime;

          // let teamAName;
          // const teamADocRef;
          // let teamACrestUrl;
          // let teamAColors = [];

          // let teamBName;
          // const teamBDocRef;
          // let teamBCrestUrl;
          // let teamBColors = [];

          // let teamAclub;
          // let teamAcounty;
          // let teamBclub;
          // let teamBcounty;
          // let gameId;

          // Game Document Reference
          const gameDocRef = doc.ref.path;
          functions.logger.log(`GameDocRef: ${gameDocRef}`);

          /** **** COMPETITION ******/

          // Competition Id
          const compId = game.get("competition").id;
          functions.logger.log(`compDocRef: ${compId}`);

          // Competition Document
          const competitionDocument = await getCompetitionDocument(compId);
          if (competitionDocument!=null) {
            functions.logger.log(`Competition Returned: 
          ${competitionDocument.id}, ${JSON.stringify(competitionDocument)}`);
          }

          // Competition name
          const competitionName = competitionDocument.get("name");
          functions.logger.log(`Competition Name: ${competitionName}`);


          /** **** TEAM A ******/

          // Team A Id
          const teamAId = game.get("teamA").id;
          functions.logger.log(`teamADocRef: ${teamAId}`);

          // Team A Document
          const teamADocument = await getTeamDocument(teamAId);
          if (teamADocument != null) {
            functions.logger.log(`Team A Returned: 
          ${teamADocument.id}, ${JSON.stringify(teamADocument)}`);
          }

          // Team A Name
          const teamAName = teamADocument.get("name");
          functions.logger.log(`Team A Name: ${teamAName}`);

          // Team A Club Id
          let teamAClubDocument = null;
          let teamACountyDocument = null;
          let teamAClubId = teamADocument.get("club");
          let teamACountyId= teamADocument.get("county");
          let teamACrestUrl = null;
          let teamAColors = null;
          if (teamAClubId!=null && teamAClubId != undefined) {
            teamAClubId = teamAClubId.id;
            teamAClubDocument = await getClubDocument(teamAClubId);
            functions.logger.log(`Team A Club Document : 
          ${teamAClubDocument.id} : ${JSON.stringify(teamAClubDocument)}`);
            teamACrestUrl = teamAClubDocument.get("crest");
            functions.logger.log(`Club crest: ${teamACrestUrl}`);
            teamAColors = teamAClubDocument.get("colors");
            functions.logger.log(`Club Colors ${teamAColors}`);
          } else if (teamACountyDocument !=null && teamACountyId != undefined) {
            teamACountyId = teamACountyId.id;
            teamACountyDocument = await getCountyDocument(teamACountyDocument);
            functions.logger.log(`Team A County Document: 
            ${teamACountyDocument.id} : 
            ${JSON.stringify(teamACountyDocument)}`);
            teamACrestUrl = teamACountyDocument.get("crest");
            functions.logger.log(`Club crest: ${teamACrestUrl}`);
            teamAColors = teamACountyDocument.get("colors");
            functions.logger.log(`Club Colors ${teamAColors}`);
          }


          /** **** TEAM B ******/

          // Team B Document ID
          const teamBId = game.get("teamB").id;
          functions.logger.log(`teamBDocRef: ${teamBId}`);
          // Team B Document
          const teamBDocument = await getTeamDocument(teamBId);
          if (teamBDocument!=null) {
            functions.logger.log(`Team A Returned: 
          ${teamBDocument.id}, ${JSON.stringify(teamBDocument)}`);
          }
          // Team B Name
          const teamBName = teamBDocument.get("name");
          functions.logger.log(`Team B Name: ${teamBName}`);


          // Team B Club Id
          let teamBClubDocument = null;
          let teamBCountyDocument = null;
          let teamBClubId = teamBDocument.get("club");
          let teamBCountyId = teamBDocument.get("county");
          let teamBCrestUrl = null;
          let teamBColors = null;

          if (teamBClubId!=null && teamBClubId != undefined) {
            teamBClubId = teamBClubId.id;
            teamBClubDocument = await getClubDocument(teamBClubId);
            functions.logger.log(`Team B Club Document : 
          ${teamBClubDocument.id} : ${JSON.stringify(teamBClubDocument)}`);
            teamBCrestUrl = teamBClubDocument.get("crest");
            functions.logger.log(`Club crest: ${teamBCrestUrl}`);
            teamBColors = teamBClubDocument.get("colors");
            functions.logger.log(`Club Colors ${teamBColors}`);
          } else if (teamBCountyDocument !=null && teamBCountyId != undefined) {
            teamBCountyId = teamBCountyId.id;
            teamBCountyDocument = await getCountyDocument(teamBCountyDocument);
            functions.logger.log(`Team B County Document: 
            ${teamBCountyDocument.id} : 
            ${JSON.stringify(teamBCountyDocument)}`);
            teamBCrestUrl = teamBCountyDocument.get("crest");
            functions.logger.log(`Club crest: ${teamBCrestUrl}`);
            teamBColors = teamBCountyDocument.get("colors");
            functions.logger.log(`Club Colors ${teamBColors}`);
          }

          /** **** START TIME ******/
          const hour = game.get("dateTime").toDate().getHours();
          let mins = game.get("dateTime").toDate().getMinutes();
          if (mins<10) {
            mins = `${mins}0`;
          }
          const startTime = `${hour}:${mins}`;
          functions.logger.log(`Game Time: ${startTime}`);
        } else {
          functions.logger.log(`Game ${doc.ref.path}: Does not exist`);
        }
      }
    } else {
      functions.logger.log("There are no games today");
    }
  } catch (e) {
    functions.logger.warn(`Exception: createTodaysGames: ${e}`);
  }
};

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
const getGameDocument = async function(gameDocRefPath) {
  try {
    functions.logger.log(`Get Game Document Ref Path: ${gameDocRefPath}`);
    const query = db.doc(gameDocRefPath);
    const querySnapshot = await query.get();
    if (querySnapshot.empty) {
      functions.logger.warn(`No Game matching ${gameDocRefPath}`);
      return null;
    } else {
      functions.logger.info(`Game: ${querySnapshot.id}`);
      return querySnapshot;
    }
  } catch (e) {
    functions.logger.error(`Exception: getGameDocument: ${e}`);
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
  } catch (e) {
    functions.logger.log(`Exception: getClubDocument: ${e}`);
  }
};

const getCountyDocument = async function(countyId) {
  try {
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
  } catch (e) {
    functions.logger.log(`Exception: getCountyDocument: ${e}`);
  }
};
