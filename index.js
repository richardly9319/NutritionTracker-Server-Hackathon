const express = require('express');
const app = express();
require('dotenv').config();
const port = process.env.PORT || 5050;
const fs = require('fs');
const cors = require('cors');
const axios = require('axios');
const bodyParser = require('body-parser');

let mealsDiary = require('./data/mealsDiary.json');

app.use(express.json());
app.use(bodyParser.json());
app.use(cors());

app.get('/', (req, res) => {
    res.send("Nutrition Tracker");
})


const makeUrl = (ingredient) => {
    myUrl = `https://api.nal.usda.gov/fdc/v1/foods/search?query=${ingredient.replace(' ', '%20')}&dataType=Foundation,SR%20Legacy&pageSize=1&sortBy=dataType.keyword&sortOrder=asc&api_key=E7kdkQyilTaMxHGab9YFKDxNAqqbQcYymop0A76f`

    return myUrl;

}

app.post('/', (req, dataRes) => {

    let totalCarbs = 0;
    let totalFats = 0;
    let totalProtein = 0;

    console.log(req.body.Ingredients);


    const ingredients = req.body.Ingredients;
    const length = ingredients.length;
    let i = 0;
    console.log(length);
    ingredients.forEach(ingredient => {
        const url = makeUrl(ingredient.ingredient);

        axios.get(url).then(res => {
            const nutrientData = res.data.foods[0].foodNutrients;
            let nutrientProtein = nutrientData.find((nutrient) => {
                return nutrient.nutrientName == 'Protein';
            })
            let nutrientFats = nutrientData.find((nutrient) => {
                return nutrient.nutrientName == 'Total lipid (fat)';
            })
            let nutrientCarbs = nutrientData.find((nutrient) => {
                return nutrient.nutrientName == 'Carbohydrate, by difference';
            })
            let Carbs = ingredient.numGrams / 100 * nutrientCarbs.value;
            let Fats = ingredient.numGrams / 100 * nutrientFats.value;
            let Protein = ingredient.numGrams / 100 * nutrientProtein.value;
            totalCarbs += Carbs;
            totalFats += Fats;
            totalProtein += Protein;

            console.log(Protein);
            i++;
            if (i === (length)) {
                console.log('end of array');
                dataRes.send({
                    protein: totalProtein,
                    fat: totalFats,
                    carbs: totalCarbs
                })
            }

        }).catch(err => {
            console.log(err)
            res.status(403);
        })
    })

})



app.listen(port, () => {
    console.log(`Listening port on ${port}`);
});