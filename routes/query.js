const express = require("express");
const controller = require("../controller/query");
const router = express.Router();

router.post("/textQuery", controller.textQuery);

module.exports = router;
