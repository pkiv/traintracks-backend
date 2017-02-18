var express = require('express');
var router = express.Router();

//All of our parties
var parties = [];
/*
Party {
	id: Integer
	Name: String
	host: object (only 1)
	tracks: Queue<track>
	clients: object (list)
	lastUpdated: datetime
	password: Integers
}
*/

function buildParty(rawParty) {
	var party = {};
	//ID must be at least 1, and will be 1 greater than the highest party currently in the array. 
	party.id = parties.length + 2;
	party.name = rawParty.name;
	party.host = rawParty.host;
	party.tracks = rawParty.tracks;
	party.password = rawParty.password
	party.clients = [];
	party.lastUpdated = new Date();

	parties[party.id] = party;
	return party;
}

/* GET a single party by ID. */
router.get('/party/:id', function(req, res, next) {
	var party = parties[req.params.id]
	if (party == null) {
		res.status(404).send('Not found');
	} else {
		res.send(party);
	}
});

/* POST a party by ID and return the newly created object. */
router.post('/party', function(req, res, next) {
	var party = buildParty(req.body);
	if (party == null) {
		res.status(500).send('Party not created');
	} else {
		res.send(party);
	}
});





module.exports = router;
