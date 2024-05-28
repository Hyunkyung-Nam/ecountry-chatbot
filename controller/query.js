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
    // console.log("Intent detected\n");
    console.log(response);
    const result = response[0].queryResult;
    console.log(`  Query: ${result.queryText}`);
    console.log(`  Response: ${result.fulfillmentText}`);
    res.send(result.fulfillmentText);
};
exports.eventQuery = async (req, res) => {
    // dialogflow api 로 부터 받은거 client로 보내기

    // The text query request.
    const request = {
        session: sessionPath,
        queryInput: {
            event: {
                name: req.body.event,
                languageCode,
            },
        },
    };

    // Send request and log result
    const responses = await sessionClient.detectIntent(request);
    console.log("Detected intent");
    const result = responses[0].queryResult;
    console.log(`  Query: ${result.queryText}`);
    console.log(`  Response: ${result.fulfillmentText}`);
    res.send(result);
    //   if (result.intent) {
    //     console.log(`  Intent: ${result.intent.displayName}`);
    //   } else {
    //     console.log(`  No intent matched.`);
    //   }
};
