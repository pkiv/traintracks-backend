var express = require('express');
var request = require('request');

var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index');
});

router.get('/:id', function(req, res, next) {
	request('http://traintrax.me:3000/api/party/' + req.params.id, function(error, response, body) {
            		if (!error && response.statusCode == 200) {
            			console.log(body);
            			res.render('party',  JSON.parse(body));
            		} else {
            			res.render('error');
            		}
			    });
});


router.post('/join', function(req, res, next) {
    var auth = {
        password: req.body.partypass
    };

    request({
        url: 'http://traintrax.me:3000/api/party/' + req.body.partyid + '/auth',
        method: "POST",
        json: auth
    }, function(error, response, body) {
        if (!error && response.statusCode == 200) {
            console.log(body);
            if (body.auth == true) {
            	res.redirect('/'+body.id);
            } else {
                res.render('error');
            }
        } else {
            console.log(response);
            console.log(error);
            res.render('error');
        }
    });
});

module.exports = router;