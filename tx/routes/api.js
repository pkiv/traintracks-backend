var express = require('express');
var io = require('../app.js');
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
    party.id = parties.length == 0 ? 1000 : (parties.length + 1);
    party.name = rawParty.name;
    party.host = rawParty.host;
    party.tracks = rawParty.tracks;
    party.password = rawParty.password
    party.clients = [];
    party.lastUpdated = new Date();

    //Exception handling has no place in hackathons
    if (parties[party.id] != null) return null;

    parties[party.id] = party;
    return party;
}

//Lets take a new party, and put it in our array. 
function updateParty(newParty) {
    newParty.lastUpdated = new Date();
    parties[newParty.id] = newParty;
    return newParty;
}

function deleteParty(partyId) {
	parties[partyId] = null;
}

/* 
client {
	id: Integer
	name: String
	picture: url
}
*/

function joinParty(partyId, client) {
    var party = parties[partyId];
    party.clients.push(client);
    party.lastUpdated = new Date();

    parties[party.id] = party;
    return party;
}

function leaveParty(partyId, clientId) {
    var party = parties[partyId];

    for (var i = party.clients.length - 1; i >= 0; i--) {
        if (party.clients[i].id == clientId) {
            party.clients.splice(i, 1);
            break;
        }
    };

    party.lastUpdated = new Date();
    parties[party.id] = party;
    return party;
}

/*
track {
	songid: string
	addedBy: client (object)
}
*/

function removeTrack (partyId, songid) {
	var party = parties[partyId];

    for (var i = party.tracks.length - 1; i >= 0; i--) {
        if (party.tracks[i].songid == songid) {
            party.tracks.splice(i, 1);
            break;
        }
    };

    party.lastUpdated = new Date();
    parties[party.id] = party;
    return party;
}

function addTrack (partyId, track) {
	parties[partyId].tracks.push(track);
	parties[partyId].lastUpdated = new Date();
	return parties[partyId];
}



/* POST a party by ID and return the newly created object. */
router.post('/party', function(req, res, next) {
    var party = buildParty(req.body);
    if (party == null) {
        res.status(500).send('Party not created');
    } else {
        res.send(party);
    }
});

/* GET a single party by ID. */
router.get('/party/:id', function(req, res, next) {
    var party = parties[req.params.id]
    if (party == null) {
        res.status(404).send('Not found');
    } else {
        res.send(party);
    }
});

/*UPDATE a party by ID */
router.post('/party/:id/update', function(req, res, next) {
    var party = updateParty(req.body);
    if (party == null) {
        res.status(500).send('Party not updated');
    } else {
        io.to(req.params.id).emit('party updated', req.body);
        res.send(party);
    }
});

/*Join a party by ID */
router.post('/party/:id/join', function(req, res, next) {
    var party = joinParty(req.params.id, req.body);
    if (party == null) {
        res.status(500).send('Party not updated');
    } else {
        io.to(req.params.id).emit('client joined party', req.body);
        res.send(party);
    }
});

/*Leave a party by ID and client ID */
router.delete('/party/:id/leave/:clientId', function(req, res, next) {
    var party = leaveParty(req.params.id, req.params.clientId);
    if (party == null) {
        res.status(500).send('Party not updated');
    } else {
        io.to(req.params.id).emit('client left party', req.params.clientId);
        res.send(party);
    }
});

/* DELETE a party */
router.delete('/party/:id', function(req, res, next) {
    deleteParty(req.params.id);
    if (parties[partyId] != null) {
        res.status(500).send('Party not updated');
    } else {
        io.to(req.params.id).emit('party deleted', req.params.id);
        res.status(204).send();
    }
});

/* Add a song to party */
router.post('/party/:id/add', function(req, res, next) {
    var parties = addTrack(req.params.id, req.body);
    if (parties == null) {
        res.status(500).send('Party not updated');
    } else {
        io.to(req.params.id).emit('song added', req.params.songid);
        res.send(parties);
    }
});

/* Remove song from party */
router.post('/party/:id/remove/:songid', function(req, res, next) {
    var parties = removeTrack(req.params.id, req.params.songid);
    if (parties == null) {
        res.status(500).send('Party not updated');
    } else {
        io.to(req.params.id).emit('song removed', req.params.songid);
        res.send(parties);
    }
});

/*Authenticate against a party */
router.post('/party/:id/auth', function(req, res, next) {
    console.log(req.body);
    var party = parties[req.params.id];
    if (party == null) {
        res.status(500).send('Party not updated');
    } else {
        var obj = {};
        obj.id = req.params.id;
        obj.auth = (req.body.password == party.password);
        res.send(obj);
    }
});

// Socket stuff
io.on('connection', function(socket) {
    io.to(socket.id).emit('welcome', 'You are connected to the socket');
    socket.on('join room', function(object) {
        console.log("It's working????");
        console.log(object);
        socket.join(object.partyId);
    });
    socket.on('leave room', function(object) {
        socket.leave(object.partyId);
    });
});

module.exports = router;