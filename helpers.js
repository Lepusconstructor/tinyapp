const bcrypt = require('bcrypt');




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
const urlsForUser = (db, id) => {
  let userUrls = {};
  console.log(db,id);
  for (let key in db) {
    if (db[key].userID === id) {
      userUrls[key] = {
        longURL: db[key].longURL,
        userID: id
    }
  }
}

  return userUrls;
}

//HELPER FUNCTION
const emailPasswordCheck = (email, password, db) => {
  let answer = {check: false, user: ""};
  for (let user in db) {
    if (db[user].email === email && bcrypt.compareSync(password, db[user].password)) {
      answer.check = true;
      answer.user = db[user];
    }
  }
  return answer;
}

module.exports = {fetchUserByEmail, generateRandomString, emailPasswordCheck, urlsForUser};