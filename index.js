const express = require('express');
const app = express();
const port = 8080;
const fs = require('fs');
const cors = require('cors');
const axios = require('axios');

let mealsDiary = require('./data/mealsDiary.json');

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send("Nutrition Tracker");
})

app.post('/', (req, res) => {
    console.log(mealsDiary);
    console.log("req Body", req.body);
    fs.readFile('./data/mealsDiary.json', 'utf8', function(err, data) {
        if (err) {
            console.log(err);
        } else {

            axios.get('https://api.nal.usda.gov/fdc/v1/foods/search?query=cheddar%20cheese&dataType=Foundation,SR%20Legacy&pageSize=1&sortBy=dataType.keyword&sortOrder=asc&api_key=E7kdkQyilTaMxHGab9YFKDxNAqqbQcYymop0A76f').then(
                response => {
                    console.log(response.data);
                }
                
            )


            // SEND RESPONSE with mealTotalCalories, mealTotalCarbs, mealTotalFats, mealTotalProtein
            obj = JSON.parse(data);
            obj.push(req.body);
            // console.log(obj);
            res.send(obj);

            fs.writeFile('mealsDiary.json', JSON.stringify(obj), (error) => {
                if (error) throw error;
            });

        }
    })
    
})

app.listen(port, () => {
    console.log(`Listening port on ${port}`);
  });