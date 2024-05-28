const express = require("express");
const controller = require("../controller/dataProcessing");
const router = express.Router();

router.get("/", controller.getNews);

module.exports = router;
