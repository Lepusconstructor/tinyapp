const PORT = 8080;
const express = require("express");
const app = express();
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const bodyParser = require('body-parser');
//convert req body from a Buffer to readable string, then add data to the  req obj under the key body

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.use(morgan("dev"));

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

//HELPER FUNCTION
const fetchUserById = (db, userId) => {
  for (let user in db) {
    if (db[user].id == userId) {
      return db[user];
    }
  }
  return null;
}
//HELPER FUNCTION
const fetchUserByEmail = (db, email) => {
  for (let user in db) {
    if (db[user].email === email) {
      return db[user];
    }
  }
  return null;
}
//HELPER FUNCTION
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
//HELPER FUNCTION
const urlsForUser = (urlDatabase, id) => {
  let userUrls = {};
  for (let key in urlDatabase) {
    if (urlDatabase[key]["userID"] === id) {
      userUrls[key] = urlDatabase[key];
    }
  }
  return userUrls;
}

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
  res.send("Hello!");
});

//INDEX
app.get("/urls", (req, res) => {
  let userID = req.cookies["user_id"];
  let templateVars = { 
    urls: urlsForUser(urlDatabase,userID), //show the user the links that are tied to the userID
    user: users[userID],
   };
  res.render("urls_index", templateVars);//header has access to index, so what we want in header has to be passed here
});
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString(6); 
  urlDatabase[shortURL] = {longURL: req.body.longURL, userID: req.cookies["user_id"]}; 
  res.redirect(`/urls/${shortURL}`);
});

//CREATE NEW URL
app.get("/urls/new", (req, res) => {
  const user_Id = req.cookies["user_id"];
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
  const user = users[req.cookies["user_id"]] ? users[req.cookies["user_id"]] : null;
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
    user: users[req.cookies["user_id"]] 
  }; 
  if (user) {
    res.render("urls_show", templateVars);
  } else {
    res.redirect("login");
  }
});
//EDIT 
app.post("/urls/:shortURL", (req,res) => {
  const user = users[req.cookies["user_id"]] ? users[req.cookies["user_id"]] : null;
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
  const user = users[req.cookies["user_id"]] ? users[req.cookies["user_id"]] : null;
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
    user: users[req.cookies["user_id"]]
   };
  res.render("login", templateVars);
})
//LOGIN
app.post("/login", (req, res) => {
  const email = req.body.email;
  const pass = req.body.password;
  const user = fetchUserByEmail(users, email);
  if (user && user.password === pass) {
    res.cookie("user_id", user.id);
    res.redirect("/urls");
  } else {
    return res.sendStatus('403');
  }
})

//LOGOUT
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});

//REGISTER
app.get("/register", (req, res) => {
  const templateVars = { 
    user: users[req.cookies["user_id"]]
   };
    res.render("register", templateVars);
});
//REGISTER
app.post("/register", (req, res) => {
  let id = generateRandomString(12);
  const {email, password} = req.body;
  const fetchedUser = fetchUserByEmail(users, email);//shall return the userobj or null
  if(req.body.email === "" || req.body.password === "") {
     return res.sendStatus('400');
   } else if (!fetchedUser) {
     const newUser = {
     id,
     email,
     password
     }
      users[id] = newUser;
      res.cookie("user_id", id);
      res.redirect("/urls");
    } else {
      return res.sendStatus('400');
    } 
   }
)

