const  { assert } = require('chai');

const { fetchUserByEmail } = require('../helpers.js');


const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

describe('fetchUserByEmail', () => {
  it('should return a user with valid email', function() {
    const user = fetchUserByEmail(testUsers, "user@example.com")
    const expectedOutput = "userRandomID";
    assert.equal(user.id, expectedOutput);
  });
  it('should return undefined if the email is not in database', function() {
    const user = fetchUserByEmail(testUsers, "hello@example.com")
    const expectedOutput = null;
    assert.equal(user, expectedOutput);
  });
});
