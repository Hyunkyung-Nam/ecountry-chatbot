const Database = require("better-sqlite3");
const db = new Database("./models/chatbot.db", { verbose: console.log });

exports.reset = () => {
    const removeJobs = db.prepare("DELETE FROM jobs");
    const removeTaxes = db.prepare("DELETE FROM taxes");
    const removePenalties = db.prepare("DELETE FROM penalties");
    removeJobs.run();
    removeTaxes.run();
    removePenalties.run();
};

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
exports.getAllTaxes = () => {
    const allTaxes = db.prepare("SELECT * FROM taxes");
    const result = allTaxes.all();
    return result;
};
exports.insertTaxes = (tax) => {
    const insert = db.prepare("INSERT INTO taxes (tax) VALUES (@tax)");
    insert.run({ tax });
};

exports.findTaxes = (tax) => {
    const findTaxes = db.prepare("SELECT * FROM taxes WHERE tax = ?");
    const oneTaxes = findTaxes.get(tax);
    return oneTaxes;
};
exports.getAllPenalty = () => {
    const allTaxes = db.prepare("SELECT * FROM penalties");
    const result = allTaxes.all();
    return result;
};
exports.insertPenalties = (penalty) => {
    const insert = db.prepare("INSERT INTO penalties (penalty) VALUES (@penalty)");

    insert.run({ penalty });
};

exports.findPenalty = (penalty) => {
    const findTaxes = db.prepare("SELECT * FROM penalties WHERE penalty = ?");
    const oneTaxes = findTaxes.get(penalty);
    return oneTaxes;
};
