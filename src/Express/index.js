const { LocalStorage } = require("node-localstorage");
const setting = require('../settings/settings.json');
const express = require('express')
var bodyParser = require('body-parser');
const app = express();
const port = setting.expressPort;

var localStorage = new LocalStorage('./scratch');
localStorage.removeItem('view-option');
localStorage.removeItem('mode');
localStorage.removeItem('table');

// for parsing application/json
app.use(bodyParser.json()); 

// for parsing application/xwww-
app.use(bodyParser.urlencoded({ extended: true })); 

let arrayOptionAllowance = ["GRID", "ABM", "GEOJSON", "AGGREGATED_TRIPS", "ACCESS", "ROTATE", "TEXTUAL", "SHADOWS",]
let arrayModeAllowance = ["ON", "OFF"]
app.get('/get-option', (req, res) => {
    let option = localStorage.getItem('view-option');
    let mode = localStorage.getItem('mode');
    let table = localStorage.getItem('table');
    res.send({option, mode, table});
})

app.post('/set-option', (req, res) => {
    let reqParams = req.body;
    let option = reqParams.option
    let mode = reqParams.mode;
    let table = reqParams.table;
    if (arrayOptionAllowance.includes(option) && arrayModeAllowance.includes(mode)) {
        localStorage.setItem('view-option', option);
        localStorage.setItem('mode', mode);
        localStorage.setItem('table', table);
        console.log(table, option, mode);
        res.send(`${mode} ${option} ${table}`);
    }
    else {
        res.status('422').send(`Params is not valid!`);
    }
})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})