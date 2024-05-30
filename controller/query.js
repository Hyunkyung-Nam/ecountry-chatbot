const dialogflow = require("dialogflow");
const config = require("../config/keys");

const sessionId = config.dialogFlowSessionID;
const projectId = config.googleProjectID;
const languageCode = config.dialogFlowSessionLanguageCode;

const sessionClient = new dialogflow.SessionsClient();
const sessionPath = sessionClient.sessionPath(projectId, sessionId);

exports.textQuery = async (req, res) => {
    console.log(req.body);
    const request = {
        session: sessionPath,
        queryInput: {
            text: {
                text: req.body.text,
                languageCode,
            },
        },
    };

    const response = await sessionClient.detectIntent(request);
    console.log(response);
    const result = response[0].queryResult;
    console.log(`  Query: ${result.queryText}`);
    console.log(`  Response: ${result.fulfillmentText}`);
    res.send(result.fulfillmentText);
};
