// Import the Firebase SDK for Google Cloud Functions.
const functions = require("firebase-functions");

const {
  getTodaysGames,
  getGameDocument,
} = require("./getFirestoreDocuments");
const {getCompetitionDetails} = require("./dailyHelpers");
const {
  getTeamDetails,
  getClubDetails,
  getCountyDetails,
} = require("./dailyHelpers");


// Initialize database
// const db = admin.firestore();
// const rtdb = admin.database();

// Daily fetch to todays games
exports.scheduledDailyGetGames=functions.pubsub.schedule("00 01 * * *")
    .timeZone("Europe/Dublin")
    .onRun(async (context) => {
      try {
        functions.logger.log("This will be run every day at 1 AM");
        await createTodaysGames();
        return null;
      } catch (e) {
        functions.logger.log(`Exception: ScheduleDailyGetGames: ${e}`);
      }
    });

// Create realtime database references for todays games
const createTodaysGames =async function() {

// competition 
  let compName = null;
  let sportType = null;
  let isNational = null;
  let gradeName = null;
  let gradeLevel = null;
  let compCounty = null;

  // team A
  let teamAName = null;
  let teamAClubDocumentRef = null;
  let teamACountyDocumentRef = null;

  // team A Club/County
  let teamACrestUrl = null;
  let teamAColors = null;
  let teamAclubId = null;
  let teamAcountyId = null;

  // team B
  let teamBName = null;
  let teamBClubDocumentRef = null;
  let teamBCountyDocumentRef = null;

  // team B Club/County
  let teamBCrestUrl = null;
  let teamBColors = null;
  let teamBclubId = null;
  let teamBcountyId = null;

  let isAClubGame = false;
  let isACountyGame = false;

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
          /** ***GAME ***** */
          // Game Id
          const gameId = game.id;
          functions.logger.log(`Game Returned: 
          ${gameId}, ${JSON.stringify(game)}`);

          // Game Document Reference
          const gameDocRef = doc.ref.path;
          functions.logger.log(`GameDocRef: ${gameDocRef}`);

          /** **** COMPETITION ******/

          // Competition Id
          const compId = game.get("competition").id;
          functions.logger.log(`compDocRef: ${compId}`);

          const compDetails = await getCompetitionDetails(compId);
          if (compDetails!=null || compDetails!=undefined) {
            compName = compDetails[0];
            sportType = compDetails[1];
            isNational = compDetails[2];
            gradeName = compDetails[3];
            gradeLevel = compDetails[4];
            compCounty = compDetails[5];
          }

          /* Boolean values to distinguish 
          between a club or county game
          */
          if(compCounty != null){
            isACountyGame = true;
          }else{
            isAClubGame = true;
          }

          functions.logger.log(`Return from Competition Details\n
          Name: ${compName}\n
          Sport: ${sportType}\n
          isNational: ${isNational}\n
          gradeName: ${gradeName}\n
          Grade Level: ${gradeLevel}\n
          Within County: ${compCounty}`);

          /** **** TEAM A ******/
          const teamAId = game.get("teamA").id;
          functions.logger.log(`teamADocRef: ${teamAId}`);
          const teamADetails = await getTeamDetails(teamAId);
          if (teamADetails != null && teamADetails !=undefined) {
            teamAName = teamADetails[0];
            teamAClubDocumentRef = teamADetails[1];
            teamACountyDocumentRef = teamADetails[2];
          }
          functions.logger.log(`Team A Details: ${teamAName}, 
          ${teamAClubDocumentRef}, ${teamAClubDocumentRef}`);


          /** ********   Team A Club/County   ******** */
          if (teamAClubDocumentRef != null &&
            teamAClubDocumentRef!=undefined) {
            teamAclubId = teamAClubDocumentRef.id;
            const clubADetails = await getClubDetails(teamAclubId);
            if (clubADetails!=null && clubADetails != undefined) {
              teamACrestUrl = clubADetails[0];
              teamAColors = clubADetails[1];
            }
          } else if (teamACountyDocumentRef !=null &&
            teamACountyDocumentRef!=undefined) {
            teamAcountyId = teamACountyDocumentRef.id;
            const countyADetails = await getCountyDetails(teamAcountyId);
            if (countyADetails!=null && countyADetails!=undefined) {
              teamACrestUrl = countyADetails[0];
              teamAColors = countyADetails[1];
            }
          }

          functions.logger.log(`Club: ${teamAclubId}: County: ${teamAcountyId}
          Colors: ${teamAColors}, Crest: ${teamACrestUrl}`);

          /** ***TEAM B****** */
          const teamBId = game.get("teamB").id;
          functions.logger.log(`teamBDocRef: ${teamBId}`);
          const teamBDetails = await getTeamDetails(teamBId);
          if (teamBDetails != null && teamBDetails !=undefined) {
            teamBName = teamBDetails[0];
            teamBClubDocumentRef = teamBDetails[1];
            teamBCountyDocumentRef = teamBDetails[2];
          }
          functions.logger.log(`Team B Details: ${teamBName}, 
          ${teamBClubDocumentRef}, ${teamBClubDocumentRef}`);

          /** ******** TEAM B Club County ******/

          if (teamBClubDocumentRef != null &&
            teamBClubDocumentRef!=undefined) {
            teamBclubId = teamBClubDocumentRef.id;
            const clubBDetails = await getClubDetails(teamBclubId);
            if (clubBDetails!=null && clubBDetails != undefined) {
              teamBCrestUrl = clubBDetails[0];
              teamBColors = clubBDetails[1];
            }
          } else if (teamBCountyDocumentRef !=null &&
            teamBCountyDocumentRef!=undefined) {
            teamBcountyId = teamBCountyDocumentRef.id;
            const countyBDetails = await getCountyDetails(teamBcountyId);
            if (countyBDetails!=null && countyBDetails!=undefined) {
              teamBCrestUrl = countyBDetails[0];
              teamBColors = countyBDetails[1];
            }
          }

          functions.logger.log(`Club: ${teamBclubId}: County: ${teamBcountyId}
          Colors: ${teamBColors}, Crest: ${teamBCrestUrl}`);

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
    return null;
  } catch (e) {
    functions.logger.warn(`Exception: createTodaysGames: ${e}`);
  }
};