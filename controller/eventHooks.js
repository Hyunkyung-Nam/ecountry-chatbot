const db = require("../index.js");
const model = require("../models/chatbot.js");

exports.eventHook = (req, res) => {
    const { responseId, queryResult, originalDetectIntentRequest, session } = req.body;
    const { queryText, parameters, outputContexts, intent } = queryResult;

    console.log(intent.name);

    console.log("parameters" + JSON.stringify(parameters));

    const intentName = intent.displayName;
    console.log("intentName : ", intentName);
    if (intentName == "add-jobs") {
        const { jobs } = parameters;
        if (model.findJob(jobs) === undefined) {
            //jobs에 해당하는 값이 디비에 없으면 추가
            model.insertJobs(jobs);
            //해당값 entity 리스트에도 등록
        }
        console.log(model.getAllJobs());
        res.json({ fulfillmentText: `직업 : ${fulfillmentText}` });
    } else if (intentName == "find-jobs") {
        //직업을 찾는 문구면 직업리스트 객체 배열로 보내줌
        const jobList = model.getAllJobs();

        res.json({ fulfillmentText: JSON.stringify({ jobList }) });
    } else {
        console.log(` No intent matched.`);
    }
};
