const moment = require('moment');
const helpers = {};

helpers.timeago = timestamp => {
    return moment(timestamp).startOf('minutes').fromNow()
}

module.exports = helpers;