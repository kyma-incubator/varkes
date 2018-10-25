const inquirer = require('inquirer');

module.exports = {

    askGithubCredentials: () => {
        const questions = [
            {
                name: 'app name',
                type: 'input',
                message: 'Enter your Application name:',
                validate: function (value) {
                    if (value.length) {
                        return true;
                    } else {
                        return 'Please enter your Application name.';
                    }
                }
            }
        ];
        return inquirer.prompt(questions);
    },
}