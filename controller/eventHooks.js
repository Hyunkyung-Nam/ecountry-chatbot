const db = require("../index.js");
const model = require("../models/chatbot.js");

exports.eventHook = (req, res) => {
    const { responseId, queryResult, originalDetectIntentRequest, session } = req.body;
    const { queryText, parameters, outputContexts, intent } = queryResult;

    console.log(intent.name);

    console.log("parameters" + JSON.stringify(parameters));

    const intentName = intent.displayName;
    console.log("intentName : ", intentName);

    if (intentName == "add-job") {
        const { jobs } = parameters;
        console.log(jobs);
        if (model.findJob(jobs) === undefined) {
            //jobs에 해당하는 값이 디비에 없으면 추가
            model.insertJobs(jobs);
            res.json({ fulfillmentText: `${jobs}등록 완료` });
        }
        res.json({ fulfillmentText: `${jobs} 이미 존재!` });
    } else if (intentName == "add-tax") {
        let { taxes } = parameters;
        if (model.findTaxes(taxes) === undefined) {
            //jobs에 해당하는 값이 디비에 없으면 추가
            model.insertTaxes(taxes);
            res.json({ fulfillmentText: `${taxes} 등록 완료` });
        }
        res.json({ fulfillmentText: `${taxes} 이미 존재!` });
    } else if (intentName == "add-penalty") {
        let { penalties: penalty } = parameters;
        if (model.findPenalty(penalty) === undefined) {
            //jobs에 해당하는 값이 디비에 없으면 추가
            model.insertPenalties(penalty);
            res.json({ fulfillmentText: `${penalty} 등록 완료` });
        }
        res.json({ fulfillmentText: `${penalty} 이미 존재!` });
    } else if (intentName == "find-list") {
        let list;
        switch (parameters.list) {
            case "직업":
                list = model.getAllJobs();
                break;
            case "세금":
                list = model.getAllTaxes();
                break;
            case "과태료":
                list = model.getAllPenalty();
                break;
            case "추천도서":
                console.log("추천도서");
                break;
            case "지구촌소식":
                console.log("지구촌소식");
                break;
            default:
                console.log("아무것도안들어옴");
                break;
        }

        res.json({ fulfillmentText: JSON.stringify({ list }) });
    } else {
        console.log(` No intent matched.`);
    }
};
