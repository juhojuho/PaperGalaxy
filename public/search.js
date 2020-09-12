var database = firebase.database();
var databaseRef = database.ref();

var searchInput = document.getElementById('search-box');
var paperList = document.getElementById("paper-list");

var data;
// database에 변화가 생길 때마다(data가 새로 들어올 때마다) 불리는 함수
databaseRef.on('value', function (snapshot) {
  var nodes = [];
  data = snapshot.val();
  data['nodes'].forEach(function (item, index, array) {
    nodes.push({
      'name': item,
      'author': data['authors'][index]
    });
  });

  data['nodes'].forEach(function(item) {
      // Create a new <option> element.
      var option = document.createElement('option');
      // Set the value using the item in the JSON array.
      option.value = item;
      // Add the <option> element to the <datalist>.
      paperList.appendChild(option);
  });
});

// Declare variables

var searchButton = document.getElementById('search-button');
searchButton.onclick = function() {
  window.location = 'result.html?pid='
      + data['nodes'].indexOf(searchInput.value);
};
