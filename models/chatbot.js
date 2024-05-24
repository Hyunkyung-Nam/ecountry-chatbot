const Database = require("better-sqlite3");
const db = new Database("./models/chatbot.db", { verbose: console.log });

exports.getAllJobs = () => {
    const allJobs = db.prepare("SELECT * FROM jobs");
    const result = allJobs.all();
    return result;
};
exports.insertJobs = (job) => {
    const insert = db.prepare("INSERT INTO jobs (job) VALUES (@job)");

    insert.run({ job });
};

exports.findJob = (job) => {
    const findJob = db.prepare("SELECT * FROM jobs WHERE job = ?");
    const oneJob = findJob.get(job);
    return oneJob;
};
