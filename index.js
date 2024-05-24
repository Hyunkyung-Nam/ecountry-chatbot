const express = require("express");
const bodyParser = require("body-parser");

require("dotenv").config();

const app = express();
const PORT = process.env.PORT;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use("/api/dialogflow", require("./routes/query"));
app.use("/api/event", require("./routes/eventHook"));
//app.use("/api/processing", require("./routes/dataProcessing"));

app.listen(PORT, () => {
    console.log(`server running`);
});
