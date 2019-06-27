const _readline = require('readline').createInterface(process.stdin, process.stdout);

/**
 * [Async] Requests input from user
 * @param question question to ask
 * @param answerCallback(string) string value entered by user.
 */
function getInput(question, answerCallback) {
    _readline.question(question, answerCallback);
}

/**
 * [Async] Requests input from user, via a question and check input to match a regular expression.
 * @param question question to ask
 * @param regex regular expresion
 * @param answerCallback(bool, string) true/false if regular expression matches, and string being the value
 */
function getInputRegex(question, regex, answerCallback) {
    _readline.question(question, answer => {
        answerCallback((answer.match(regex)), answer)
    });
}

/**
 * [Async] Requests a password followed by a confirmation of that password. If passwords do not match, the user is requested to retry. If yes, the user is prompted again, else the callback is sent with false. If passwords match, callback is sent with true and the password
 * @param question question to ask
 * @param confirmQuestion confirmation question
 * @param callback(bool, string) callback accepting true/false if valid password and string as password processed in every case,
 */
function getPassword(question, confirmQuestion, callback) {
    getInput(question, (answer1) => {
        getInput(confirmQuestion, (answer2) => {
            if (answer1 === answer2) {
                callback(true, answer1);
            } else {
                getInputRegex("Mismatch, retry? [Y/n]", /([Yy]es)|[Yy]/, answer => {
                    if (answer.match(/([Yy]es)|[Yy]/)) {
                        return getPassword(question, confirmQuestion, callback);
                    } else {
                        callback(false, "");
                    }
                });
            }
        })
    })
}

module.exports = {
    getInputRegex,
    getInput,
    getPassword
};