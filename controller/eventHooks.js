const db = require("../index.js");
const model = require("../models/chatbot.js");
const axios = require("axios");
const cheerio = require("cheerio");

exports.resetDB = async (req, res) => {
    model.reset();
    res.json({
        result: "삭제완료",
        model: { jobs: model.getAllJobs(), taxes: model.getAllTaxes(), penalties: model.getAllPenalty() },
    });
};

exports.eventHook = async (req, res) => {
    const { responseId, queryResult, originalDetectIntentRequest, session } = req.body;
    const { queryText, parameters, outputContexts, intent } = queryResult;

    console.log(intent.name);
    console.log(outputContexts);

    try {
        console.log("parameters" + JSON.stringify(parameters));

        const intentName = intent.displayName;
        console.log("intentName : ", intentName);

        if (intentName == "add-job") {
            let { jobs } = parameters;
            jobs = jobs.replaceAll("등록 ", "");
            console.log(jobs);
            if (model.findJob(jobs) === undefined) {
                //jobs에 해당하는 값이 디비에 없으면 추가
                model.insertJobs(jobs);
                res.json({ fulfillmentText: `${jobs}등록 완료` });
            }
            res.json({ fulfillmentText: `${jobs} 이미 존재!` });
        } else if (intentName == "add-tax") {
            let { taxes } = parameters;
            taxes = taxes.replaceAll("등록 ", "");
            if (model.findTaxes(taxes) === undefined) {
                //jobs에 해당하는 값이 디비에 없으면 추가
                model.insertTaxes(taxes);
                res.json({ fulfillmentText: `${taxes} 등록 완료` });
            }
            res.json({ fulfillmentText: `${taxes} 이미 존재!` });
        } else if (intentName == "add-penalty") {
            let { penalties: penalty } = parameters;
            penalty = penalty.replaceAll("등록 ", "");
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
        } else if (intentName == "find-generation") {
            const { generation } = parameters;
            let inputGeneration = "";
            for (let index in generation) {
                inputGeneration += generation[index];
            }
            // const currentTime = new Date().getTime();

            // bookList = await findBooks("generation", inputGeneration);
            // while (currentTime + 4500 >= new Date().getTime()) {
            // if (Object.keys(bookList).length != 0) {
            //     console.log("111111111111");
            res.json({
                fulfillmentText: JSON.stringify({
                    list: {
                        bookList: await findBooks("generation", inputGeneration),
                    },
                }),
            });
            //         break;
            // }
            // }
        } else if (intentName == "find-keyword") {
            const { keyword } = parameters;
            let inputKeyword = "";
            for (let index in keyword) {
                inputKeyword += keyword[index].replaceAll(" ", "");
            }
            inputKeyword = inputKeyword.replaceAll("키워드", "").replaceAll(" ", "");

            res.json({
                fulfillmentText: JSON.stringify({
                    list: {
                        bookList: await findBooks("keyword", inputKeyword),
                    },
                }),
            });
        } else if (intentName == "find-writer") {
            const { writer } = parameters;
            let inputWriter = "";
            for (let index in writer) {
                inputWriter += writer[index];
            }
            res.json({
                fulfillmentText: JSON.stringify({
                    list: {
                        bookList: await findBooks("writer", inputWriter),
                    },
                }),
            });
        } else if (intentName == "find-hot-books") {
            res.json({
                fulfillmentText: JSON.stringify({
                    list: {
                        bookList: await findHotBooks(),
                    },
                }),
            });
        } else {
            console.log(` No intent matched.`);
        }
    } catch (e) {
        console.log("오류 : " + e);
    }
};
const getDateString = (chageDate) => {
    const year = chageDate.getFullYear();
    const month = ("0" + (chageDate.getMonth() + 1)).slice(-2);
    const date = ("0" + chageDate.getDate()).slice(-2);
    return year + "-" + month + "-" + date;
};
const findBooks = async (key, value) => {
    try {
        let url = "";
        switch (key) {
            case "writer":
                url = `http://data4library.kr/api/srchBooks?authKey=${process.env.LIBRARY_API_KEY}&author=${value}&pageNo=1&pageSize=5&format=json`;
                break;
            case "generation":
                const now = new Date();
                const oneMonthBefore = new Date(now.setMonth(now.getMonth() - 1));
                const startDate = getDateString(oneMonthBefore);

                if (value == "초등학생" || value == "중학생" || value == "고등학생" || value == "유아") {
                    const fromAge = value == "초등학생" ? 8 : value == "중학생" ? 14 : value == "유아" ? 5 : 17;
                    const toAge = value == "초등학생" ? 13 : value == "중학생" ? 16 : value == "유아" ? 7 : 19;
                    console.log(`시작 : ${fromAge} 끝 : ${toAge}}`);
                    url = `http://data4library.kr/api/loanItemSrch?authKey=${process.env.LIBRARY_API_KEY}&startDt=${startDate}&from_age=${fromAge}&to_age=${toAge}&pageNo=1&pageSize=5&format=json`;
                } else {
                    const age = value.replace("대 이상", "").replace("대", "");
                    url = `http://data4library.kr/api/loanItemSrch?authKey=${process.env.LIBRARY_API_KEY}&startDt=${startDate}&age=${age}&pageNo=1&pageSize=5&format=json`;
                }
                break;
            case "keyword":
                url = `http://data4library.kr/api/srchBooks?authKey=${process.env.LIBRARY_API_KEY}&keyword=${value}&pageNo=1&pageSize=5&format=json`;
                break;
        }
        console.log(url);
        const resData = await axios.get(url);
        const { docs } = resData.data.response;

        const bookList = [];
        for (let data of docs) {
            const { doc } = data;
            const { isbn13 } = doc;
            const resData = await axios.get(
                `http://data4library.kr/api/srchDtlList?authKey=${process.env.LIBRARY_API_KEY}&isbn13=${isbn13}&format=json`
            );
            const { detail } = resData.data.response;
            console.log(detail[0].book);
            const book = {
                title: doc.bookname,
                url: doc.bookDtlUrl,
                imageUrl: doc.bookImageURL,
                date: detail[0].book.publication_year,
                writer: doc.authors,
                description: detail[0].book.description,
            };
            bookList.push(book);
        }
        return bookList;
    } catch (e) {
        console.log(`${value} 가져오기 오류 : ` + e);
        return {};
    }
};

//인기 도서
const findHotBooks = async () => {
    try {
        const resData = await axios.get(
            `http://data4library.kr/api/loanItemSrch?authKey=${process.env.LIBRARY_API_KEY}&pageNo=1&pageSize=5&format=json`
        );
        const { docs } = resData.data.response;
        const bookList = [];

        if (docs.length !== 0) {
            for (let docList of docs) {
                const { doc } = docList;
                const { isbn13 } = doc;
                console.log("isbn13" + isbn13);
                const resData = await axios.get(
                    `http://data4library.kr/api/srchDtlList?authKey=${process.env.LIBRARY_API_KEY}&isbn13=${isbn13}&format=json`
                );
                const { detail } = resData.data.response;
                console.log(detail[0].book);
                const book = {
                    title: doc.bookname,
                    url: doc.bookDtlUrl,
                    imageUrl: doc.bookImageURL,
                    date: detail[0].book.publication_year,
                    writer: doc.authors,
                    description: detail[0].book.description,
                };
                bookList.push(book);
            }
        }
        return bookList;
    } catch (e) {
        console.log("인기도서 가져오기 오류 : " + e);
        return {};
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
