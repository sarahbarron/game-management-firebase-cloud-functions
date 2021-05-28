// Import the Firebase SDK for Google Cloud Functions.
const functions = require("firebase-functions");
const {log} = require("firebase-functions/lib/logger");

const {createTodaysGames} = require("./dailyHelpers");
const {updateScore} = require("./scoreHelpers");
const {deleteTodaysGames} = require("./databaseHelpers");


/* Scheduled Daily fetch - gets today to todays games and creates
and details of todays games in the realtime database*/
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

/* Schedule Daily Delete of realtime database entries */
exports.scheduledDailyDeleteGames=functions.pubsub.schedule("05 00 * * *")
    .timeZone("Europe/Dublin")
    .onRun(async (context) => {
      try {
        functions.logger.log("ScheduleDailyDeleteGames: 12:05 am");
        await deleteTodaysGames();
        return null;
      } catch (e) {
        functions.logger.log(`Exception: ScheduleDailyDeleteGames: ${e}`);
      }
    });
/*
When a score is added to firestore update the realtime
database with any details needed
*/
exports.scoreTrigger=functions.firestore
    .document("Scores/{docId}")
    .onCreate(async (snap, context) =>{
      try {
        functions.logger.log("Update Score Details in Realtime DB");
        await updateScore(snap.data());
        return null;
      } catch (e) {
        log(`Exception: scoreTrigger ${e}`);
      }
    });

