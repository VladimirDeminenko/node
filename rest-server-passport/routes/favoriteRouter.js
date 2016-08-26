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

        next();
    })
    .post(function (req, res, next) {
        Favorites.find({
            "owner": req.body.owner
        }, function (err, favor) {
            if (err) throw err;
            var result = '';
            var myObj = favor[0]['dishes'];

            var idx = 0;
            for (var field in myObj) {
                idx++;
                result += '\n' + idx + '(' + field + '): ' + myObj[field];
            }

            var dishesArr = favor[0].dishes;

            result = '_id:\t' + favor[0]._id + '\nowner:\t' + favor[0].owner + '\ndishes:\t' + favor[0].dishes + '\ntypeof(dishes):\t'
                + typeof (favor[0].dishes)
                + 'dishesArr.length:\t' + dishesArr.length;



            for (var i = 0; i < dishesArr.length; i++) {
                var dish = dishesArr[i];

                result += '\n(dishes[' + i + ']):\t' + dish;

                if (dish === req.body.dish) {
                    //                    result = dish;
                    break;
                } else {
                    //result += '\n' + dish;
                }
            }

            res.writeHead(200, {
                'Content-Type': 'text/plain'
            });

            res.end('***' + result + '\n***');
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
