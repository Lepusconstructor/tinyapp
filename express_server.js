const PORT = 8080;
const express = require("express");
const app = express();
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const bodyParser = require('body-parser');//convert req body from a Buffer to readable string, then add data to the  req obj under the key body

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.use(morgan("dev"));

//HELPER FUNCTION
const fetchUserById = (db, userId) => {
  for (let user in db) {
    if (db[user].id == userId) {
      return db[user];
    }
  }
  return null;
}

const fetchUserByEmail = (db, email) => {
  for (let user in db) {
    if (db[user].email === email) {
      return db[user];
    }
  }
  return null;
}

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

const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" }
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

//pass URL data to template urls_index.js using res.render
app.get("/urls", (req, res) => {
    const templateVars = { 
    urls: urlDatabase,
    user: users[req.cookies["user_id"]]? users[req.cookies["user_id"]].email : undefined
   };
  res.render("urls_index", templateVars);//header has access to index

});

/*
//a GET route to render the urls_new.ejs template (given below) in the browser, to present the form to the user
app.get("/urls/new", (req, res) => {
    const templateVars = { 
    urls: urlDatabase,
    user: users[req.cookies["user_id"]]? users[req.cookies["user_id"]].email : undefined
   };
    res.render("urls_new", templateVars);
});
*/
//if user is not login, should not be able to create new shortURL
app.get("/urls/new", (req, res) => {
  const user_Id = req.cookies["user_id"];
  if (user_Id === null || user_Id === undefined) {
    res.redirect("/login");
  } else {
  const fetchedUser = fetchUserById(users, user_Id);
  const templateVars = {
    user: fetchedUser.email,
  };
  res.render("urls_new", templateVars);
}
});



app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
    user: users[req.cookies["user_id"]].email 
  }; 
  res.render("urls_show", templateVars);
});

app.post("/urls/:shortURL", (req,res)=>{
  let longURL = req.body.updatedLongURL;
  urlDatabase[req.params.shortURL].longURL = longURL;
  res.redirect("/urls");
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL].longURL;
  res.redirect("/urls");
});

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString(6); //generate a unique 6 digits string for shortURL
  urlDatabase[shortURL] = {longURL: req.body.longURL, userID: res.cookie("user_id")}; //assign the shortURL to longURL to save the pair to urlDB
  console.log(shortURL);
  res.redirect("/urls/" + shortURL);
});

//after the browser receives a redirection res, it GET req to the url in the res.
//The GET /urls/new route needs to be defined before the GET /urls/:id route. Routes defined earlier will take precedence, so if we place this route after the /urls/:id definition, any calls to /urls/new will be handled by app.get("/urls/:id", ...) because Express will think that new is a route parameter. A good rule of thumb to follow is that routes should be ordered from most specific to least specific.

app.get("/u/:shortURL", (req, res) => { //anyone can visit shorURL
  const longURL = req.params.shortURL.longURL;
  res.redirect(longURL);
});

//LOGIN
app.get("/login", (req, res) => {
  const templateVars = { 
    user: users[req.cookies["user_id"]]
   };
  res.render("login", templateVars);
})

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
})




//REGISTER
app.get("/register", (req, res) => {
  const templateVars = { 
    user: users[req.cookies["user_id"]]
   };
    res.render("register", templateVars);
});

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

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
