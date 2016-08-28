var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');

var Favorites = require('../models/favorites');

var favoritesRouter = express.Router();
favoritesRouter.use(bodyParser.json());

var Verify = require('./verify');

favoritesRouter.route('/')
    .get(Verify.verifyOrdinaryUser, function (req, res, next) {
        //  retrieve all their favorite dishes
        var userId = req.decoded._doc._id;
        Favorites.find({user:userId})
            .populate('user')
            .populate('dishes')
            .exec(function (err, dish) {
                if (err) throw err;
                res.json(dish);
            });
    })

    .post(Verify.verifyOrdinaryUser, function (req, res, next) {
        // add a dish to their favorites,

        var userId = req.decoded._doc._id;
        var dishId = req.body._id;

        Favorites.findOne({user:userId}).exec(function (err, favorite) {
            if (err) throw err;

            if(favorite == null)
            {
                console.log("Test B"+favorite);
                Favorites.create({user:userId, dishes:[dishId]}, function (err, newEntry) {
                    if (err) throw err;
                    res.writeHead(200, {
                        'Content-Type': 'text/plain'
                    });
                    res.end('Dish added as favorite');
                });
            }
            else{
                if(favorite.dishes.indexOf(dishId) > -1) {
                    res.writeHead(200, {
                        'Content-Type': 'text/plain'
                    });

                    res.end('Dish already added as favorite');
                }
                else{
                    favorite.dishes.push(dishId);
                    favorite.save(function (err, updatedfavorite) {
                        if (err) throw err;
                        res.writeHead(200, {
                            'Content-Type': 'text/plain'
                        });
                        res.end('Dish added as favorite');
                    });
                }
            }
        });
    })

    .delete(Verify.verifyOrdinaryUser, function (req, res, next) {
        // delete the list of their favorites
        var userId = req.decoded._doc._id;
        Favorites.findOne({user:userId}).exec(function (err, favorite) {
            if (err) throw err;
            if(favorite == null) {
                res.writeHead(200, {
                    'Content-Type': 'text/plain'
                });

                res.end('No favorites');
            }
            else{
                favorite.dishes = [];
                favorite.save(function (err) {
                    if (err) throw err;
                    res.writeHead(200, {
                        'Content-Type': 'text/plain'
                    });
                    res.end('Favorite removed.');
                });
            }
        });
    });

favoritesRouter.route('/:dishObjectId')
    .delete(Verify.verifyOrdinaryUser, function (req, res, next) {
        // delete the specific dish from the list of their favorite dishes
        var userId = req.decoded._doc._id;
        var dishId = req.params.dishObjectId;

        Favorites.findOne({user:userId}).exec(function (err, favorites) {
            if (err) throw err;
            if(favorites == null) {
                res.writeHead(200, {
                    'Content-Type': 'text/plain'
                });

                res.end('No favorites');
            }
            else{
                favorites.dishes.remove(dishId);
                favorites.save(function (err) {
                    if (err) throw err;
                    res.writeHead(200, {
                        'Content-Type': 'text/plain'
                    });
                    res.end('Favorite removed.');
                });
            }
        });
    });

module.exports = favoritesRouter;

