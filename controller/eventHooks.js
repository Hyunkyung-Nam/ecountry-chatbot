const db = require("../index.js");
const model = require("../models/chatbot.js");
const axios = require("axios");
const cheerio = require("cheerio");

exports.eventHook = async (req, res) => {
    const { responseId, queryResult, originalDetectIntentRequest, session } = req.body;
    const { queryText, parameters, outputContexts, intent } = queryResult;

    console.log(intent.name);

    try {
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
                case "세법":
                    list = model.getAllTaxes();
                    break;
                case "과태료":
                    list = model.getAllPenalty();
                    break;
                case "추천도서":
                    console.log("추천도서");
                    break;
                case "지구촌 소식":
                    list = await getNews();
                    console.log("list : " + list);
                    break;
                default:
                    console.log("아무것도안들어옴");
                    break;
            }

            res.json({ fulfillmentText: JSON.stringify({ list }) });
        } else {
            console.log(` No intent matched.`);
        }
    } catch (e) {
        console.log("오류 : " + e);
    }
};

const getNews = async () => {
    try {
        const resData = await axios.get("https://kids.donga.com/?ptype=article&psub=online");

        let ulList = [];
        const $ = cheerio.load(resData.data);
        const $bodyList = $(".article li");

        $bodyList.each(function (i, elem) {
            if (i === 5) {
                return;
            }
            ulList[i] = {
                url: $(this).find(".at_cont a").attr("href"),
                image_url: $(this).find("a img").attr("src"),
                date: $(this).find(".article > :nth-child(3)").text(),
            };
        });

        const datas = ulList.filter((n) => n.url);
        const newsList = [];

        for (let data of datas) {
            if (newsList.length == 5) {
                break;
            }
            const resData = await axios.get(data.url);
            const $ = cheerio.load(resData.data);
            const $bodyList = $(".at_cont");

            $bodyList.each(function (i, elem) {
                let news = {
                    title: $(this).find(".title").text(),
                    url: data.url,
                    imageUrl: data.image_url,
                    date: data.date,
                    writer: $(this).find("ul .writer").text().replaceAll("\n", "").replaceAll("\t", ""),
                    description: $(this).find("span").text(),
                };
                newsList.push(news);
            });
        }

        return { newsList };
    } catch (e) {
        console.log("어린이 동아 가져오기 오류 : " + e);
        return {};
    }
};
