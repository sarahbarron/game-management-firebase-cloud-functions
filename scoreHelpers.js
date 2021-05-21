// Import the Firebase SDK for Google Cloud Functions.
const functions = require("firebase-functions");
const {log} = require("firebase-functions/lib/logger");
const {getGameDocument, getMemberDocument, getTeamDocument,
  updateLatestScoreInRealtimeDB} = require("./databaseHelpers");

const updateScore = async function(score) {
  try {
    if (score!=null && score !==undefined) {
      const gameRef = score.game;
      const goal = score.goal;
      const point = score.point;
      const teamRef = score.team;
      const memberRef = score.member;
      const timestamp = score. timestamp;
      const teamAString = "teamA";
      const teamBString = "teamB";
      const goalString ="Goal";
      const pointString ="Point";
      let game = null;
      let player = null;
      let team = null;
      let teamName = null;
      let time = null;
      let scoreTotal = null;
      let scoreTotalTitle = null;
      let teamString = null;
      let scoreType = null;
      let playerName = null;
      if (gameRef != null && gameRef != undefined) {
        game = await getGameDocument(gameRef.id);
        if (memberRef!=null && memberRef != undefined) {
          player = await getMemberDocument(memberRef.id);
          if (player!=null && player !=undefined) {
            const firstName = player.get("firstName");
            const lastName = player.get("lastName");
            playerName =`${firstName} ${lastName}`;
          }
        }
        if (teamRef!=null && teamRef!=undefined) {
          team = await getTeamDocument(teamRef.id);
          teamName = team.name;
        }

        // check if its teamA or teamB
        if (game.teamA === teamRef) {
          teamString= teamAString;
        } else if (game.teamB === teamRef) {
          teamString = teamBString;
        }

        // get the score type
        if (goal === 1) {
          scoreType=goalString;
        } else if (point ===1) {
          scoreType=pointString;
        }

        if (teamString!=null && scoreType!=null) {
          scoreTotalTitle = `${teamString}${scoreType}s`;
          scoreTotal = game.scoreTotalTitle + 1;
        }
        if (timestamp!=null && timestamp!=undefined) {
          time = await getTimeFromTimestamp(timestamp);
        }

        updateLatestScoreInRealtimeDB(game.id, scoreTotalTitle,
            scoreTotal, teamName, scoreType, playerName, time);
      }
    }
  } catch (e) {
    functions.logger.log(`Exception: updateScore: ${e}`);
  }
};

const getTimeFromTimestamp = async function(timestamp) {
  try {
    if (timestamp!=null && timestamp!=undefined) {
      const hour = timestamp.toDate().getHours();
      let mins = timestamp.toDate().getMinutes();
      if (mins<10) {
        mins = `${mins}0`;
      }
      const time = `${hour}:${mins}`;
      functions.logger.log(time);
      return time;
    }
    functions.logger.log(`getTimeFromTimestamp ${timestamp}`);
    return null;
  } catch (e) {
    log(`Exception: can't get time from timestamp ${timestamp}`);
  }
};


module.exports={updateScore, getTimeFromTimestamp};
