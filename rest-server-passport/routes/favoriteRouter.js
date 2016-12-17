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
    .all(function (req, res, next) {
        req.body.owner = req.decoded._id;

        next();
    })
    .get(function (req, res, next) {
        Favorites
            .find({
                'owner': req.body.owner
            })
            .populate('owner dishes')
            .exec(function (err, favorite) {
                if (err) next(err);
                res.json(favorite);
            });
    })
    .post(Verify.verifyOrdinaryUser, function (req, res, next) {
        if (!req.body._id) {
            throw new Error('_id is not defined.');
        }

        req.body.dish = req.body._id;

        Favorites.findOne({
            'owner': req.body.owner
        }, function (err, favoriteDoc) {
            if (err) next(err);

            var result = '';

            try {
                if (!favoriteDoc) {
                    Favorites.create(req.body, function (err, favorite) {
                        if (err) next(err);

                        favorite.dishes.push(req.body.dish);
                        favorite.save(function (err, resp) {
                            if (err) next(err);
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
                            if (err) next(err);
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
    .put(Verify.verifyOrdinaryUser, function (req, res, next) {
        // two steps:
        // - remove all user's favorites
        // - create a new user's favorite with a dish collection from req.body
        // req.body: {"dishes": ["dishid1", "dishid2", ..., "dishidN"]}
        Favorites.remove({
            'owner': req.body.owner
        }, function (err, resp) {
            if (err) next(err);

            Favorites.create(req.body, function (err, favorite) {
                if (err) next(err);

                res.end('Created the favorite with id: ' + favorite._id);
            });
        });
    })
    .delete(Verify.verifyOrdinaryUser, function (req, res, next) {
        Favorites.remove({
            'owner': req.body.owner
        }, function (err, resp) {
            if (err) next(err);
            res.json(resp);
        });
    });

favoriteRouter.route('/:id')
    .all(function (req, res, next) {
        req.body.owner = req.decoded._id;
        req.body.dish = req.params.id;

        next();
    })
    .delete(Verify.verifyOrdinaryUser, function (req, res, next) {
        Favorites.findOne({
            'owner': req.body.owner
        }, function (err, favoriteDoc) {
            if (err) next(err);

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
