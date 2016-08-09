var mongoose = require('mongoose'),
    assert = require('assert');

var Dishes = require('./models/dishes');
var Promotions = require('./models/promotions');
var Leaders = require('./models/leadership');

var dishesTestDone = false;
var promotionsTestDone = false;
var leadersTestDone = false;

var closeDb = function (db) {
    if (dishesTestDone && promotionsTestDone && leadersTestDone) {
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

        // get the dish
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
        }, 2000);
    });

    // create a new promotion
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

        // get the promotion
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
        }, 2000);
    });

    // create a new leader
    Leaders.create({
        name: 'Peter',
        //image: will set the default value from the schema
        designation: 'Chief Epicurious Officer',
        abbr: 'CEO',
        description: 'Amma Mia!'
    }, function (err, leader) {
        if (err) throw err;
        console.log('\n\n*** Leader created!');
        console.log(leader);

        // get the leader
        setTimeout(function () {
            Leaders.findByIdAndUpdate(leader._id, {
                    $set: {
                        name: 'Peter Pan',
                        image: 'images/alberto.png',
                        description: "Our CEO, Peter, credits his hardworking East Asian immigrant parents who undertook the arduous journey to the shores of America with the intention of giving their children the best future. His mother's wizardy in the kitchen whipping up the tastiest dishes with whatever is available inexpensively at the supermarket, was his first inspiration to create the fusion cuisines for which The Frying Pan became well known.He brings his zeal for fusion cuisines to this restaurant, pioneering cross - cultural culinary connections."
                    }
                }, {
                    new: true
                })
                .exec(function (err, leader) {
                    if (err) throw err;
                    console.log('\n\n*** Updated Leader!');
                    console.log(leader);

                    leader.save(function (err, leader) {
                            leadersTestDone = true;
                        return;
                        db.collection('leaders').drop(function () {
                            leadersTestDone = true;
                            closeDb(db);
                        });
                    });
                });
        }, 2000);
    });
});