const { LocalStorage } = require("node-localstorage");
const setting = require('../settings/settings.json');
const express = require('express')
const app = express();
const port = setting.expressPort;

var localStorage = new LocalStorage('./scratch');
localStorage.removeItem('view-option');

let arrayOptionAllowance = ["GRID", "ABM", "GEOJSON", "AGGREGATED_TRIPS", "ACCESS", "ROTATE", "TEXTUAL", "SHADOWS",]
let arrayModeAllowance = ["ON", "OFF"]
app.get('/get-option', (req, res) => {
    let option = localStorage.getItem('view-option');
    let mode = localStorage.getItem('mode');
    res.send({option, mode});
})

app.post('/set-option/:option/:mode', (req, res) => {
    if (arrayOptionAllowance.includes(req.params.option) && arrayModeAllowance.includes(req.params.mode)) {
        let option = req.params.option;
        let mode = req.params.mode;
        localStorage.setItem('view-option', option);
        localStorage.setItem('mode', mode);
        console.log(option, mode);
        res.send(`${mode} ${option}`);
    }
    else {
        res.status('422').send(`Param option is not valid!`);
    }
})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})