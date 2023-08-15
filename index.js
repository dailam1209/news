const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cros = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

//router
const newApi = require("./routers/NewRouter");

dotenv.config();
app.set('view engine', 'ejs');
app.use(express.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cros({
    origin: "http://localhost:8081/",
    method: "GET, POST, PUT, DELETE",
    Credential: true,
}));

mongoose.connect(
    process.env.MONGOOSE_URL).
    then(() => {
        console.log("DB success connection");
    })
    .catch((err) => {
        console.log(err);
    });

app.get('/', function(req, res) {
    res.render()
});

app.use("/api", newApi);

app.listen( process.env.PORT, () => {
    console.log(` Listenning to port ${process.env.PORT}`);
})