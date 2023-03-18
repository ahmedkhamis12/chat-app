const moment = require('moment')
const generateMessage = (text) => {
    return {
        text,
        createdAt: moment(text.createdAt).format('h:mm a'),
    };
}

module.exports = {
    generateMessage
}