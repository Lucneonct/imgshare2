const helpers = {};

helpers.randomNumber = () => {
    const possible = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let randomNumber = '';
    for(let i = 0; i < 10; i++) {
        var character = possible.charAt(Math.floor(Math.random() * possible.length));
        randomNumber += character
    }
    return randomNumber;
}

module.exports = helpers;