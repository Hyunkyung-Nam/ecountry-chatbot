const express = require("express");
const router = express.Router();
const controller = require("../controller/eventHooks");

router.post("/", controller.eventHook);
router.get("/reset", controller.resetDB);

module.exports = router;
