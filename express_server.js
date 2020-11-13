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
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "user2RandomID" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" }
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

const urlsForUser = (urlDatabase, id) => {
  let userUrls = {};
  for (let key in urlDatabase) {
    if (urlDatabase[key]["userID"] === id) {
      userUrls[key] = urlDatabase[key];
    }
  }
  return userUrls;
}
//show the user the links that are tied to the userID
app.get("/urls", (req, res) => {
  let userID = req.cookies["user_id"];
  let templateVars = { 
    urls: urlsForUser(urlDatabase,userID),
    user: users[userID],
   };
  res.render("urls_index", templateVars);
  //header has access to index
});
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString(6); //generate a unique 6 digits string for shortURL
  urlDatabase[shortURL] = {longURL: req.body.longURL, userID: req.cookies["user_id"]}; //assign the shortURL to longURL to save the pair to urlDB
  //res.redirect("/urls/:" + shortURL);
  res.redirect(`/urls/${shortURL}`);
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
  let templateVars = {
    user: fetchedUser,
  };
  res.render("urls_new", templateVars);
}
});



app.get("/urls/:shortURL", (req, res) => {
  
  let shortURL = req.params.shortURL;//.substring(1)
  console.log(shortURL);
  const templateVars = {
    shortURL: shortURL,
    longURL: urlDatabase[shortURL].longURL,
    user: users[req.cookies["user_id"]] 
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
  delete urlDatabase[shortURL];
  res.redirect("/urls");
});


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
