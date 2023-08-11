const express = require('express');
const app = express();
const port = 8080;
const fs = require('fs');
const cors = require('cors');

let mealsFile = require('./data/meals.json');

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send("Nutrition Tracker");
})

app.post('/', (req, res) => {
    console.log(mealsFile);
    console.log("req Body", req.body);
    fs.readFile('./data/meals.json', 'utf8', function(err, data) {
        if (err) {
            console.log(err);
        } else {
            
            obj = JSON.parse(data);
            obj.push(req.body);
            console.log(obj);
            res.send(obj);
        }
    })
    
})

app.listen(port, () => {
    console.log(`Listening port on ${port}`);
  });