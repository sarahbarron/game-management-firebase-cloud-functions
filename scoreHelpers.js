// Import the Firebase SDK for Google Cloud Functions.
const functions = require("firebase-functions");
const {log} = require("firebase-functions/lib/logger");
const {getGameDocument, getMemberDocument, getTeamDocument,
  updateLatestScoreInRealtimeDB,
  updateTeamAGoalsTotalScoreInRealtimeDB,
  updateTeamBGoalsTotalScoreInRealtimeDB,
  updateTeamAPointsTotalScoreInRealtimeDB,
  updateTeamBPointsTotalScoreInRealtimeDB} = require("./databaseHelpers");

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
      const scoreTotal = null;
      const scoreTotalTitle = null;
      let teamString = null;
      let scoreType = null;
      let playerName = null;


      if (gameRef != null && gameRef != undefined) {
        game = await getGameDocument(gameRef.id);
        functions.logger.log(`Game Returned: ${JSON.stringify(game)}`);
        if (memberRef!=null && memberRef != undefined) {
          player = await getMemberDocument(memberRef.id);
          if (player!=null && player !=undefined) {
            const firstName = player.get("firstName");
            const lastName = player.get("lastName");
            playerName =`${firstName} ${lastName}`;
          }
          functions.logger.log(`Player: ${memberRef}: ${playerName}`);
        }
        if (teamRef!=null && teamRef!=undefined) {
          team = await getTeamDocument(teamRef.id);
          teamName = team.name;
          functions.logger.log(`Team: ${teamRef} :${teamName}`);
        }

        const teamA = game.get("teamA");
        const teamB = game.get("teamB");
        if (teamA!=null && teamA!=undefined) {
          functions.logger.log(`Team Ref: ${teamRef.id}, 
          teamA: ${teamA.id}`);

          // check if its teamA or teamB
          if (teamA.id === teamRef.id) {
            teamString= teamAString;
          }
        }
        if (teamB!=null && teamB!=undefined) {
          functions.logger.log(`Team Ref: ${teamRef.id}, 
          teamB: ${teamB.id}`);

          if (teamB.id === teamRef.id) {
            teamString = teamBString;
          }
        }
        functions.logger.log(`teamString: ${teamString}`);
        // get the score type
        if (goal === 1) {
          scoreType=goalString;
        } else if (point ===1) {
          scoreType=pointString;
        }

        updateTotal(game, teamString, scoreType);

        if (timestamp!=null && timestamp!=undefined) {
          time = await getTimeFromTimestamp(timestamp);
        }
        functions.logger.log(`Score: ${game.id},${scoreTotalTitle},
        ${time}, ${teamName}, ${playerName}, ${scoreType}, 
        ${scoreTotal}`);
        await updateLatestScoreInRealtimeDB(game.id, teamName,
            scoreType, playerName, time);
        return null;
      } else {
        functions.logger.warn(`Score not updated Game: ${gameRef}`);
      }
    } else {
      functions.logger.warn(`Score not updated Score: ${score}`);
    }
    return null;
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

const updateTotal = async function(game, team, score) {
  if (game!=null && game != undefined) {
    if (team==="teamA") {
      if (score==="Goal") {
        return await updateTeamAGoalsTotalScoreInRealtimeDB(game.id);
      } else if (score==="Point") {
        return await updateTeamAPointsTotalScoreInRealtimeDB(game.id);
      }
    } else if (team==="teamB") {
      if (score==="Goal") {
        return await updateTeamBGoalsTotalScoreInRealtimeDB(game.id);
      } else if (score==="Point") {
        return await updateTeamBPointsTotalScoreInRealtimeDB(game.id);
      }
    }
  }
};


module.exports={updateScore, getTimeFromTimestamp};
