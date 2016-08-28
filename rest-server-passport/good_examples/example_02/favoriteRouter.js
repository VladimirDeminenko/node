var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var Verify = require('./verify');

var Favorites = require('../models/favorites');

var favoriteRouter = express.Router();
favoriteRouter.use(bodyParser.json());

favoriteRouter.route('/')
.get(Verify.verifyOrdinaryUser, function (req, res, next) {
    Favorites.find({})
        .populate('postedBy')
        .populate('dishes')
        .exec(function (err, favorite) {
        if (err) throw err;
        res.json(favorite);
    });
})

.post(Verify.verifyOrdinaryUser, function (req, res, next) {
    Favorites.findByIdAndUpdate(req.decoded._doc._id, {
        $set: {postedBy: req.decoded._doc._id},
        $addToSet: { dishes: req.body._id}
    }, {
        upsert: true,
        new: true   
    }, function (err, favorite) {
        if (err) throw err;
        res.json(favorite);
    });
})

.delete(Verify.verifyOrdinaryUser, function (req, res, next) {
    Favorites.remove({}, function (err, favorite) {
        if (err) throw err;
        res.json(favorite);
    });
});

favoriteRouter.route('/:favoriteId')
.delete(Verify.verifyOrdinaryUser, function (req, res, next) {
    Favorites.findById(req.decoded._doc._id, function (err, favorite) {
        var dish = req.params.favoriteId;
        var index = favorite.dishes.indexOf(dish);
        favorite.dishes.splice(index, 1);
        favorite.save(function (err, resp) {
            if (err) throw err;
            res.json(resp);
        });
    });
});

module.exports = favoriteRouter;