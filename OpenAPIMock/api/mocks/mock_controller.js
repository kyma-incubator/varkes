'use strict';


module.exports = {

    cardTypes: getCardTypes
}
function getCardTypes(req, res) {
    console.log("entered")
    res.status(200);
    res.type('application/json');
    res.send({ "username": "omar" });
}