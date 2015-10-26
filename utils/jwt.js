var jwt = require('express-jwt');

module.exports = jwt({
  secret: secretCallback
});

function secretCallback() {
}

function isRevoked() {
}
