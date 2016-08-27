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

            var favorDishes = favorDoc.dishes;
            req.body.favorDishes = favorDishes;

            try {
                var reqDishId = JSON.stringify(req.body.dish);
            } catch (err) {
                err.status = 500;
                return next(err.message);
            }

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
        Favorites.findOne({
            "owner": req.body.owner
        }, function (err, favorDoc) {
            if (err) throw err;

            var result = '"' + req.body.dish + '"';
            var favorIdx = req.body.getFavorIndex(favorDoc);

            try {
                if (favorIdx < 0) {
                    result += ' is not found.'
                    req.body.favorDishes.push(req.body.dish);

                    favorDoc.save(function (err, resp) {
                        if (err) throw err;

                        res.json(resp);
                    });
                } else {
                    result = 'index of ' + result + ' is ' + favorIdx + '.';
                }
            } catch (err) {
                err.status = 500;
                return next(err.message);
            }

            res.end(result);
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
