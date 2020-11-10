const PORT = 8080;
const express = require("express");
const app = express();
const bodyParser = require('body-parser');//convert req body from a Buffer to readable string, then add data to the  req obj under the key body

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));

function generateRandomString(length) { //from stackoverflow
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
      //string.charAt(index) will output the element at said index
       result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/", (req, res) => {
  res.send("Hello!");
});
//adding additional endpoints
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
})
//pass URL data to template urls_index.js using res.render
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});
//a GET route to render the urls_new.ejs template (given below) in the browser, to present the form to the user
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString(6); //generate a unique 6 digits string for shortURL
  urlDatabase[shortURL] = req.body.longURL; //assign the shortURL to longURL to save the pair to urlDB
  res.redirect("/urls/" + shortURL);
});
//after the browser receives a redirection res, it GET req to the url in the res.
//The order of route definitions matters! The GET /urls/new route needs to be defined before the GET /urls/:id route. Routes defined earlier will take precedence, so if we place this route after the /urls/:id definition, any calls to /urls/new will be handled by app.get("/urls/:id", ...) because Express will think that new is a route parameter. A good rule of thumb to follow is that routes should be ordered from most specific to least specific.
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});



//response can contain HTML code, in browser we only see Hello World, in terminal with cURL we see the entrie HTTP response string in html context
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
