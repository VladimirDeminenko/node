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

        req.body.getFavorIndex = function (favor) {
            var result = -1;

            var favorDishes = favor[0].dishes;
            req.body.favorDishes = favorDishes;

            var reqDishId = JSON.stringify(req.body.dish);

            for (var i = 0; i < favorDishes.length; i++) {
                var dishId = JSON.stringify(favorDishes[i]);

                if (reqDishId === dishId) {
                    result = i;

                    break;
                }
            }

            return result;
        }

        next();
    })
    .post(function (req, res, next) {
        Favorites.find({
            "owner": req.body.owner
        }, function (err, favor) {
            if (err) throw err;

            var result = '"' + req.body.dish + '"';
            var favorIdx = req.body.getFavorIndex(favor);

            if (favorIdx < 0) {
                result += ' is not found.'
                req.body.favorDishes.push(req.body.dish);

                favor.save(function (err, favor) {
                    if (err) throw err;

                    res.json(favor);
                });
            } else {
                result = 'index of ' + result + ' is ' + favorIdx + '.';
            }

            res.writeHead(200, {
                'Content-Type': 'text/plain'
            });

            res.end(result);
        });
        /** /
                    favor.save(function (err, result) {
                        if (err) throw err;
                        res.writeHead(200, {
                            'Content-Type': 'text/plain'
                        });
                        res.end('Deleted all comments!');
                    });
        /**/
        /** /
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
        /**/
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
