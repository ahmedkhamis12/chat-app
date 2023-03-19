const moment = require('moment')
const generateMessage = (username,text) => {
    return {
        username,
        text,
        createdAt: moment(text.createdAt).format('h:mm a')
    };
}

module.exports = {
    generateMessage
}