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

module.exports={getTodaysGames, getGameDocument, getTeamDocument,
  getClubDocument, getCountyDocument, getCompetitionDocument,
  getGradeDocument};
