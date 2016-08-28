var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');

var Favorites = require('../models/favorites');

var favoriteRouter = express.Router();

favoriteRouter.use(bodyParser.json());
var Verify = require('./verify');

favoriteRouter.route('/')
    .all(Verify.verifyOrdinaryUser, function (req, res, next) {
        req.body.owner = req.decoded._doc._id;

        next();
    })
    .get(function (req, res, next) {
        Favorites
            .find({
                "owner": req.body.owner
            })
            .populate('owner dishes')
            .exec(function (err, favorite) {
                if (err) throw err;
                res.json(favorite);
            });
    })
    .put(function (req, res, next) {
        // two steps:
        // - remove all user's favorites
        // - create a new user's favorite with dish collection
        Favorites.remove({
            "owner": req.body.owner
        }, function (err, resp) {
            if (err) throw err;

            Favorites.create(req.body, function (err, favorite) {
                if (err) throw err;

                res.writeHead(200, {
                    'Content-Type': 'text/plain'
                });

                res.end('Created the favorite with id: ' + favorite._id);
            });
        });
    })
    .delete(function (req, res, next) {
        Favorites.remove({
            "owner": req.body.owner
        }, function (err, resp) {
            if (err) throw err;
            res.json(resp);
        });
    });

favoriteRouter.route('/:id')
    .all(Verify.verifyOrdinaryUser, function (req, res, next) {
        req.body.owner = req.decoded._doc._id;
        req.body.dish = req.params.id;

        req.body.getFavorIndex = function (favorDoc) {
            var result = -1;

            try {
                var reqDishId = JSON.stringify(req.body.dish);

                for (var i = 0; i < favorDoc.dishes.length; i++) {
                    var dishId = JSON.stringify(favorDoc.dishes[i]);

                    if (reqDishId === dishId) {
                        result = i;

                        break;
                    }
                }
            } catch (err) {
                next('*** 1: ' + err.message);
            }

            return result;
        }

        next();
    })
    .post(function (req, res, next) {
        Favorites.findOne({
            "owner": req.body.owner
        }, function (err, favorDoc) {
            if (err) throw err;

            var result = '';

            try {
                if (!favorDoc) {
                    Favorites.create(req.body, function (err, favorite) {
                        if (err) throw err;

                        favorite.dishes.push(req.body.dish);
                        favorite.save(function (err, resp) {
                            if (err) throw err;
                        });

                        result += 'Created the favorite with id: "' + favorite._id + '".';

                        res.end(result);
                    });
                } else {
                    result += '"' + req.body.dish + '"';
                    var favorIdx = req.body.getFavorIndex(favorDoc);

                    if (favorIdx < 0) {
                        result += ' is added.'
                        favorDoc.dishes.push(req.body.dish);

                        favorDoc.save(function (err, resp) {
                            if (err) throw err;
                        });
                    } else {
                        result = ' *** this favorite exists: index of ' + result + ' is ' + favorIdx + '.';
                    }

                    res.end(result);
                }
            } catch (err) {
                return next('*** 2: ' + err.message);
            }
        });
    })
    .delete(function (req, res, next) {
        Favorites.remove({
            "owner": req.body.owner
        }, function (err, resp) {
            if (err) throw err;
            res.json(resp);
        });
    });

module.exports = favoriteRouter;
