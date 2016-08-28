// grab the things we need
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var favoriteSchema = new Schema({

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required:true
    },
    dishes:[{ type: Schema.Types.ObjectId, ref: 'Dish', required:true }]
}, {
    timestamps: true
});

// the schema is useless so far
// we need to create a model using it
var Favorites = mongoose.model('Favorites', favoriteSchema);

// make this available to our Node applications
module.exports = Favorites;