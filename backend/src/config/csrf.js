const { v4: uuidv4 } = require('uuid');

const generateCSRFToken = () => uuidv4();

const verifyCSRFToken = (tokenFromHeader, tokenFromCookie) => {
    return tokenFromHeader === tokenFromCookie;
};

module.exports = {
    generateCSRFToken,
    verifyCSRFToken
};