var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');

var Favorites = require('../models/favorites');

var favoriteRouter = express.Router();

favoriteRouter.use(bodyParser.json());
var Verify = require('./verify');

var getDishIndex = function (favoriteDoc, dish) {
    var result = -1;
    var dishId = JSON.stringify(dish);

    for (var i = 0; i < favoriteDoc.dishes.length; i++) {
        if (JSON.stringify(favoriteDoc.dishes[i]) === dishId) {
            result = i;

            break;
        }
    }

    return result;
}

favoriteRouter.route('/')
    .all(Verify.verifyOrdinaryUser, function (req, res, next) {
        req.body.owner = req.decoded._doc._id;

        next();
    })
    .get(function (req, res, next) {
        Favorites
            .find({
                'owner': req.body.owner
            })
            .populate('owner dishes')
            .exec(function (err, favorite) {
                if (err) throw err;
                res.json(favorite);
            });
    })
    .post(function (req, res, next) {
        if (!req.body._id) {
           throw new Error('_id is not defined.');
        }

        req.body.dish = req.body._id;

        Favorites.findOne({
            'owner': req.body.owner
        }, function (err, favoriteDoc) {
            if (err) throw err;

            var result = '';

            try {
                if (!favoriteDoc) {
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
                    var dishIdx = getDishIndex(favoriteDoc, req.body.dish);

                    if (dishIdx < 0) {
                        result += ' is added.'
                        favoriteDoc.dishes.push(req.body.dish);

                        favoriteDoc.save(function (err, resp) {
                            if (err) throw err;
                        });
                    } else {
                        result = ' *** favorite dish ' + result + ' exists: index is ' + dishIdx + '.';
                    }

                    res.end(result);
                }
            } catch (err) {
                return next(err);
            }
        });
    })
    .put(function (req, res, next) {
        // two steps:
        // - remove all user's favorites
        // - create a new user's favorite with a dish collection from req.body
        // req.body: {"dishes": ["dishid1", "dishid2", ..., "dishidN"]}
        Favorites.remove({
            'owner': req.body.owner
        }, function (err, resp) {
            if (err) throw err;

            Favorites.create(req.body, function (err, favorite) {
                if (err) throw err;

                res.end('Created the favorite with id: ' + favorite._id);
            });
        });
    })
    .delete(function (req, res, next) {
        Favorites.remove({
            'owner': req.body.owner
        }, function (err, resp) {
            if (err) throw err;
            res.json(resp);
        });
    });

favoriteRouter.route('/:id')
    .all(Verify.verifyOrdinaryUser, function (req, res, next) {
        req.body.owner = req.decoded._doc._id;
        req.body.dish = req.params.id;

        next();
    })
    .delete(function (req, res, next) {
        Favorites.findOne({
            'owner': req.body.owner
        }, function (err, favoriteDoc) {
            if (err) throw err;

            var result = '';

            try {
                if (!favoriteDoc) {
                    result += '*** favorite dish list for user "' + req.body.owner + '" don\'t exist.';
                } else {
                    result += '"' + req.body.dish + '"';
                    var dishIdx = getDishIndex(favoriteDoc, req.body.dish);

                    if (dishIdx < 0) {
                        result += ' is not in favorite dish list.'
                    } else {
                        favoriteDoc.dishes.splice(dishIdx, 1);
                        favoriteDoc.save();

                        result += ' was removed from favorite dish list.';
                    }
                }

                res.end(result);
            } catch (err) {
                return next(err);
            }
        });
    });

module.exports = favoriteRouter;
