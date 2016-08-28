var express = require('express');
var bodyparser = require('body-parser');
var mongoose = require('mongoose');
var Verify = require('./verify');
var Favorites = require('../models/favorites');
var favoriteRouter = express.Router();
favoriteRouter.use(bodyparser.json());

favoriteRouter.route('/')
  .get(Verify.verifyOrdinaryUser, function (req, res, next) {
      Favorites.find({postedBy: req.decoded._doc._id})
          .populate('postedBy')
          .populate('dishes')
          .exec(function (err, favorites) {
              if (err) throw err;
              res.json(favorites);
      });
  })
  .post(Verify.verifyOrdinaryUser, function (req, res, next) {
      Favorites.find({postedBy: req.decoded._doc._id}, function (err, favorites) {
          if (err) throw err;
          if(favorites == null || favorites.length == 0){
              Favorites.create({postedBy: req.decoded._doc._id}, function(err, favorite){
                  if(err){
                     console.log('Failed to create new favorite');
                    console.log(err);
                    throw err;
                  }
                   console.log('New favorite '+favorite);
                  favorite.dishes.push(req.body._id);
                  favorite.postedBy = req.decoded._doc._id;
                  favorite.save(function(err,favorite){
                      if(err){
                         console.log('failed to save new favorite');
                        console.log(err);
                        throw err;
                      }
                      res.json(favorite);
                  });
              });
          }
          else{
              console.log("favorite list exists for this user "+favorites.length);
                  //there's only one favorites list per user
                  //Check that dish does not already exist.
                  for (var j = 0 ; j < favorites[0].dishes.length ; j++){
                      if(favorites[0].dishes[j] == req.body._id){
                          console.log("This dish already exists.");
                          res.json(favorites[0]);
                          return;                            
                      }                           
                  }
                  console.log("Adding dish!");
                  favorites[0].dishes.push(req.body._id);
                  favorites[0].save(function(err,favorite){
                      if(err){
                        console.log(err);
                        throw err;
                      }
                      res.json(favorite);
                  });                   
                  return;
          }
      });
  })

  .delete(Verify.verifyOrdinaryUser, function(req,res,next) {
      Favorites.find({postedBy: req.decoded._doc._id}, function(err, favorites){
          if(err) throw err;
          if(favorites.length == 0){
              res.end(null);
              return;
          }
          for(var i=0; i<favorites.length; i++){
          Favorites.remove(favorites[i], function(err, resp){
              if(err) throw err;
              res.json(favorites[i]);
          });
          }
          return;

      });
  });


favoriteRouter.route('/:dishId')
  .delete(Verify.verifyOrdinaryUser, function(req,res,next){
      //find favorites posted by this user
      Favorites.find({postedBy: req.decoded._doc._id}, function(err, favorites){
          if(err) throw err;
          if(favorites.length == 0){
              res.end(null);
              return;
          }
          favorites[0].dishes.remove(req.params.dishId);
          favorites[0].save(function (err, resp) {
              if (err) throw err;
              res.json(resp);
          });
          return;                                                 
      });
  });

module.exports = favoriteRouter;