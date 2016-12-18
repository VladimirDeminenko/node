module.exports = function (app) {
  var cloudantDB = app.dataSources.cloudant;
  cloudantDB.automigrate('Customer', function (err) {
    if (err) throw (err);
    var Customer = app.models.Customer;
    Customer.find({ where: { username: 'Admin' }, limit: 1 }, function (err, users) {

      if (!users) {


        Customer.create([
          { username: 'Admin', email: 'admin@admin.com', password: 'abcdef' }
        ], function (err, users) {
          if (err) return debug(err);

          var Role = app.models.Role;
          var RoleMapping = app.models.RoleMapping;

          Role.destroyAll();
          RoleMapping.destroyAll();

          //create the admin role
          Role.create({
            name: 'admin'
          }, function (err, role) {
            if (err) return debug(err);

            //make admin
            role.principals.create({
              principalType: RoleMapping.USER,
              principalId: users[0].id
            }, function (err, principal) {
              if (err) throw (err);
            });
          });
        })
      }
      else {

      }

    });
  });
};