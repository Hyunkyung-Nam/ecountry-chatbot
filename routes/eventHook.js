const express = require("express");
const router = express.Router();
const controller = require("../controller/eventHooks");

router.post("/", controller.eventHook);

module.exports = router;
