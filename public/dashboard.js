var user = firebase.auth().currentUser;
var name, uid;

if (user != null) {
  name = user.displayName;
  uid = user.uid;

  var database = firebase.database();
  var databaseRef = database.ref('/users');
  databaseRef.on('value', function (snapshot) {
    var data = snapshot.val();
    console.log(data);
  });
}