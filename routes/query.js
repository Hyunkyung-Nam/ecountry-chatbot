const express = require("express");
const controller = require("../controller/query");
const router = express.Router();

router.post("/textQuery", controller.textQuery);
router.post("/eventQuery", controller.eventQuery);

module.exports = router;
