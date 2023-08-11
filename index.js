const express = require('express');
const app = express();
const port = 8080;
const fs = require('fs');
const cors = require('cors');
const axios = require('axios');

let mealsDiary = require('./data/mealsDiary.json');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded());
// app.use(express.multipart());

app.get('/', (req, res) => {
    res.send("Nutrition Tracker");
})

function grabNutrientFilter(item) {
        return {"name": item['nutrientName'], "unit": item['unitName'], "value": item['value']};
}


const getIngredientsData = async (ingredients) => {
    let nutriData = [];
    let urls = [];
    for (let i = 0; i < ingredients.length; i++) {
        const params = {
            "query": ingredients[i]['ingredient'], "dataType": "Foundation,SR%20Legacy",
            "pageSize": 1,
            "sortBy": "dataType.keyword",
            "sortOrder": "asc",
            "api_key": "E7kdkQyilTaMxHGab9YFKDxNAqqbQcYymop0A76f"
        };

        const myUrlWithParams = new URL("https://api.nal.usda.gov/fdc/v1/foods/search");
        for (const [key, value] of Object.entries(params)) {
            myUrlWithParams.searchParams.append(key, params[key]);
        }
        urls.push(myUrlWithParams);
    }

    const requests = urls.map((url) => axios.get(url));

    await axios.all(requests).then((responses) => {
        responses.forEach((resp) => {
            let msg = {
                ingredient: resp.data.foods[0].description,
                info: resp.data.foods[0].foodNutrients.map((item) => grabNutrientFilter(item))
            };
            nutriData.push(msg);
        });
    });
    return nutriData;
}

app.post('/', (req, res) => {
    // console.log(mealsDiary);
    console.log("req Body", req.body);
    const body = req.body;
    const ingredients = body['ingredients'];
    getIngredientsData(ingredients).then((result) => {
        res.json(result)
    });
})

app.listen(port, () => {
    console.log(`Listening port on ${port}`);
  });