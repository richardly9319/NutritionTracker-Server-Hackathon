const express = require('express');
const app = express();
const port = 8080;
const fs = require('fs');
const cors = require('cors');
const axios = require('axios');

let mealsDiary = require('./data/mealsDiary.json');
const { Console } = require('console');

app.use(express.json());
app.use(express.urlencoded());
// app.use(express.multipart());

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send("Nutrition Tracker");
})

const parseIngredientsData = async (ingredient) => {

        const params={"query": ingredient, "dataType": "Foundation,SR%20Legacy",
            "pageSize": 1, 
            "sortBy": "dataType.keyword", 
            "sortOrder": "asc", 
            "api_key": "E7kdkQyilTaMxHGab9YFKDxNAqqbQcYymop0A76f"};

        const myUrlWithParams = new URL("https://api.nal.usda.gov/fdc/v1/foods/search");
        for (const [key, value] of Object.entries(params)) {
            myUrlWithParams.searchParams.append(key, params[key]);
        }

        // API call to server 
        console.log(myUrlWithParams);
        return await axios.get(myUrlWithParams).then(
                (response) => {
                    console.log('response', response);
                    console.log(response.data);
                    return response.data.foods[0].foodNutrients;
                }   
        ).catch();
        // parse data from response
        // return data
};

const getIngredientsData = (ingredients) => {
    const nutriData = [];
    console.log("With ingredients: " + ingredients);
  for(let i = 0; i<ingredients.length; i++) {
      console.log(ingredients[i]['ingredient']);
      try {
        parseIngredientsData(ingredients[i]['ingredient']).then((res) => {
            console.log(res);
            nutriData.push(res);
        }
        );
      }
      catch(event) {
        console.log("We got", event);
      }
  }
   return Promise.all(nutriData).then((values)=> {console.log(values)});
//   return ;
};


app.post('/', (req, res) => {
    console.log(mealsDiary);
    console.log("req Body", req.body);
    fs.readFile('./data/mealsDiary.json', 'utf8', function(err, data) {
        if (err) {
            console.log(err);
        } else {
            const body = req.body;
            console.log("our Ingredients" + body['ingredients']);

            data = getIngredientsData(body['ingredients']);


            console.log(data);

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