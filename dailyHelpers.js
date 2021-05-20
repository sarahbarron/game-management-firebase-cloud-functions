// Import the Firebase SDK for Google Cloud Functions.
const functions = require("firebase-functions");

const {
  getCompetitionDocument,
  getGradeDocument,
  getCountyDocument,
  getTeamDocument,
  getClubDocument} = require("./databaseHelpers");


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
    }
    return null;
  } catch (e) {
    functions.logger.log(`Exception: getTeamDetails ${e}`);
    return null;
  }
};


const getClubDetails = async function(documentId) {
  try {
    const clubDocument = await getClubDocument(documentId);
    if (clubDocument !=null && clubDocument !=undefined) {
      const crestUrl = clubDocument.get("crest");
      const colors = clubDocument.get("colors");

      return [crestUrl, colors];
    }
    return null;
  } catch (e) {
    functions.logger.log(`Exception: GetClubDetails: ${e}`);
    return null;
  }
};

const getCountyDetails = async function(documentId) {
  try {
    const countyDocument = await getCountyDocument(documentId);
    if (countyDocument != null && countyDocument!=undefined) {
      const crestUrl = countyDocument.get("crest");
      const colors = countyDocument.get("colors");
      return [crestUrl, colors];
    }
  } catch (e) {
    functions.logger.log("Exception: getCountyDetails ${e}");
  }
};


module.exports={getCompetitionDetails, getTeamDetails,
  getClubDetails, getCountyDetails};
