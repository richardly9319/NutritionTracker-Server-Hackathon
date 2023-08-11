const express = require('express');
const app = express();
const port = 8080;
const fs = require('fs');
const cors = require('cors');
const axios = require('axios');
const bodyParser = require('body-parser');

let mealsDiary = require('./data/mealsDiary.json');
const { Console } = require('console');

app.use(express.json());
app.use(bodyParser.json());
// app.use(express.urlencoded());
// app.use(express.multipart());
app.use(cors());

app.get('/', (req, res) => {
    res.send("Nutrition Tracker");
})


const makeUrl = (ingredient) => {
    myUrl = `https://api.nal.usda.gov/fdc/v1/foods/search?query=${ingredient.replace(' ', '%20')}%20Rice&dataType=Foundation,SR%20Legacy&pageSize=1&sortBy=dataType.keyword&sortOrder=asc&api_key=E7kdkQyilTaMxHGab9YFKDxNAqqbQcYymop0A76f`

    return myUrl;

}


const parseIngredientsData = async (ingredient) => {


    for (const [key, value] of Object.entries(params)) {
        myUrlWithParams.searchParams.append(key, params[key]);
    }

    // API call to server 
    console.log('myUrlWithParams', myUrlWithParams);
    return await axios.get(myUrlWithParams).then(
        (response) => {
            return response.data.foods[0].foodNutrients;
        }
    ).catch();
    // parse data from response
    // return data
};

const getIngredientsData = (ingredients) => {
    const nutriData = [];
    console.log("With ingredients: " + ingredients);
    for (let i = 0; i < ingredients.length; i++) {
        console.log(ingredients[i]['ingredient']);
        try {
            parseIngredientsData(ingredients[i]['ingredient']).then((res) => {
                console.log(res);
                nutriData.push(res);
            }
            );
        }
        catch (event) {
            console.log("We got", event);
        }
    }
    return Promise.all(nutriData).then((values) => { console.log(values) });
    //   return ;
};


app.post('/', (req, dataRes) => {

    let totalCarbs = 0;
    let totalFats = 0;
    let totalProtein = 0;


    const ingredients = req.body.Ingredients;
    const length = ingredients.length;
    let i = 0;

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

            i++;
            if (i === (length - 1)) {
                dataRes.send({
                    protein: totalProtein,
                    fats: totalFats,
                    carbs: totalCarbs
                })
            }

        }).catch(err => console.log(err))
    })

})



app.listen(port, () => {
    console.log(`Listening port on ${port}`);
});