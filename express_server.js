const PORT = 8080;
const express = require("express");
const app = express();
const morgan = require('morgan');
const bcrypt = require('bcrypt');
const cookieSession = require('cookie-session');
const saltRounds = 10;
const {fetchUserById} = require('./helpers');
const {fetchUserByEmail} = require('./helpers');
const {generateRandomString} = require('./helpers'); 
const {urlsForUser} = require('./helpers'); 
const {emailPasswordCheck} = require('./helpers');
const bodyParser = require('body-parser');
//convert req body from a Buffer to readable string, then add data to the  req obj under the key body

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(morgan("dev"));
app.use(cookieSession({
  name:'session',
  keys: ['key1','key2']
}))
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


//DB
const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "9@gmail.com", 
    password: "9"
  }
}

//DB
const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "user2RandomID" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" }
};

//HOME 
app.get("/", (req, res) => {
  const user = users[req.session["user_id"]] ? users[req.session["user_id"]] : null;
  if (user) {
    res.redirect("/urls");
  } else {
    res.redirect("/login");
  }
});

//INDEX
app.get("/urls", (req, res) => {
  let userID = req.session["user_id"];
  let templateVars = { 
    urls: urlsForUser(urlDatabase,userID), //show the user the links that are tied to the userID
    user: users[userID],
   };
  res.render("urls_index", templateVars);//header has access to index, so what we want in header has to be passed here
});
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString(6); 
  urlDatabase[shortURL] = {longURL: req.body.longURL, userID: req.session["user_id"]}; 
  res.redirect(`/urls/${shortURL}`);
});

//CREATE NEW URL
app.get("/urls/new", (req, res) => {
  const user_Id = req.session["user_id"];
  if (user_Id === null || user_Id === undefined) {
    res.redirect("/login");//if user is not logged in, should not be able to create new shortURL
  } else {
  const fetchedUser = fetchUserById(users, user_Id);
  let templateVars = {
    user: fetchedUser,
  };
  res.render("urls_new", templateVars);
}
});

//EDIT 
app.get("/urls/:shortURL", (req, res) => {
  const user = users[req.session["user_id"]] ? users[req.session["user_id"]] : null;
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
    user: users[req.session["user_id"]] 
  }; 
  if (user) {
    res.render("urls_show", templateVars);
  } else {
    res.redirect("login");
  }
});

//EDIT 
app.post("/urls/:shortURL", (req,res) => {
  const user = users[req.session["user_id"]] ? users[req.session["user_id"]] : null;
  if (user) {
    let longURL = req.body.updatedLongURL;
    urlDatabase[req.params.shortURL].longURL = longURL;
    res.redirect("/urls");
  } else {
    res.redirect("login");
  }
});

//NOT SURE
app.get("/u/:shortURL", (req, res) => { //anyone can visit shorURL
  const longURL = req.params.shortURL.longURL;
  res.redirect(longURL);
});

//DELETE 
app.post("/urls/:shortURL/delete", (req, res) => {
  const user = users[req.session["user_id"]] ? users[req.session["user_id"]] : null;
  if (user) {
    const shortURL = req.params.shortURL;
    delete urlDatabase[shortURL];
    res.redirect("/urls");
  } else {
    res.redirect("login");
  }
});

//LOGIN
app.get("/login", (req, res) => {
  const templateVars = { 
    user: users[req.session["user_id"]]
   };
  res.render("login", templateVars);
})


//LOGIN
app.post("/login", (req, res) => {
  const {email, password} = req.body;
  const result = emailPasswordCheck(email, password, users);
 
  if (result.check === true) {
    req.session["user_id"] = result.user.id;
    res.redirect("/urls");
  } else {
    return res.status('403').send('<html><h4>Please register first</h4></html>');
  }
  
})

//LOGOUT
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

//REGISTER
app.get("/register", (req, res) => {
  const templateVars = { 
    user: users[req.session["user_id"]]
   };
    res.render("register", templateVars);
});

//REGISTER
app.post("/register", (req, res) => {
  let id = generateRandomString(12);
  const {email, password} = req.body;
  
  if(req.body.email === "") {
    return res.status('400').send('<html><h4>Please enter email</h4></html>');
   } 
  if (req.body.password === "") {
    return res.status('400').send('<html><h4>Please enter password</h4></html>');
  }
  const fetchedUser = fetchUserByEmail(users, email);//shall return the userobj or null
  if (!fetchedUser) {
     const newUser = {
     id,
     email,
     password: bcrypt.hashSync(password, saltRounds)
     }
      users[id] = newUser;
      req.session["user_id"] = id;
      res.redirect("/urls");
    } else {
      res.status('400').send('<html><h4>User exists, please log in</h4></html>');
      res.redirect("login");
    } 
   }
)

