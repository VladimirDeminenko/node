var mongoose = require('mongoose'),
    assert = require('assert');

var Dishes = require('./models/dishes');
var Promotions = require('./models/promotions');

var dishesTestDone = false;
var promotionsTestDone = false;

var closeDb = function (db) {
    if (dishesTestDone && promotionsTestDone) {
        db.close();
    }
}

// Connection URL
var url = 'mongodb://localhost:27017/conFusion';
mongoose.connect(url);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
    // we're connected!
    console.log("*** Connected correctly to server");

    // create a new dish
    Dishes.create({
        name: 'Uthapizza',
        //image: will set the default value from the schema
        category: 'mains',
        //label: will set the default value from the schema
        price: '4.99',
        description: 'Test',
        comments: [
            {
                rating: 3,
                comment: 'This is insane',
                author: 'Matt Daemon'
            }
        ]
    }, function (err, dish) {
        if (err) throw err;
        console.log('\n\n*** Dish created!');
        console.log(dish);

        // get all the dishes
        setTimeout(function () {
            Dishes.findByIdAndUpdate(dish._id, {
                    $set: {
                        image: 'images/uthapizza.png',
                        description: 'A unique combination of Indian Uthappam (pancake) and Italian pizza, topped with Cerignola olives, ripe vine cherry tomatoes, Vidalia onion, Guntur chillies and Buffalo Paneer.',
                        label: 'Hot'
                    }
                }, {
                    new: true
                })
                .exec(function (err, dish) {
                    if (err) throw err;
                    console.log('\n\n*** Updated Dish!');
                    console.log(dish);

                    dish.comments.push({
                        rating: 5,
                        comment: 'I\'m getting a sinking feeling!',
                        author: 'Leonardo di Carpaccio'
                    });

                    dish.save(function (err, dish) {
                        console.log('\n\n*** Updated Comments!');
                        console.log(dish);

                        db.collection('dishes').drop(function () {
                            dishesTestDone = true;
                            closeDb(db);
                        });
                    });
                });
        }, 3000);
    });

    // create a new dish
    Promotions.create({
        name: 'Weekend Grand Buffet',
        //image: will set the default value from the schema
        category: 'mains',
        //label: will set the default value from the schema
        price: '19.99',
        description: 'Featuring mouthwatering combinations with a choice of five different salads, six enticing appetizers, six main entrees and five choicest desserts. Free flowing bubbly and soft drinks. All for just $19.99 per person'
    }, function (err, dish) {
        if (err) throw err;
        console.log('\n\n*** Promotion created!');
        console.log(dish);

        // get all the promotions
        setTimeout(function () {
            Promotions.findByIdAndUpdate(dish._id, {
                    $set: {
                        image: 'images/buffet.png'
                    }
                }, {
                    new: true
                })
                .exec(function (err, dish) {
                    if (err) throw err;
                    console.log('\n\n*** Updated Promotion!');
                    console.log(dish);

                    dish.save(function (err, dish) {
                        db.collection('promotions').drop(function () {
                            promotionsTestDone = true;
                            closeDb(db);
                        });
                    });
                });
        }, 3000);
    });
});