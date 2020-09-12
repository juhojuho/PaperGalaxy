var buttonPlus = document.getElementById('fixed-button');
var buttonAddPaper = document.getElementById('fixed-button-top');
var buttonAddConnection = document.getElementById('fixed-button-bottom');
var modalAddPaper = document.getElementById('modal-add-paper');
var modalAddConnection = document.getElementById('modal-add-connection');
var modalPaper = document.getElementById('modal-show-paper');
var modalConnection = document.getElementById('modal-show-connection');
var buttonSendNewPaper = document.getElementById('sendNewPaper');
var buttonSendNewConnection = document.getElementById('sendNewConnection');
var buttonCloseModalPaper = document.getElementById('closeModalPaper');
var board1stName = document.getElementById('1stName');
var board1stScore = document.getElementById('1stScore');
var board2stName = document.getElementById('2ndName');
var board2stScore = document.getElementById('2ndScore');
var board3stName = document.getElementById('3rdName');
var board3stScore = document.getElementById('3rdScore');
var board1st = document.getElementById('first');
var board2nd = document.getElementById('second');
var board3rd = document.getElementById('third');
var scoreBoard = document.getElementById('score-board');

var defaultContent =
  '<tr class="white bg-navy">' +
  '<th class="pv2 ph3 tl f6 fw6 ttu">#</th>' +
  '<th class="tr f6 ttu fw6 pv2 ph3">Username</th>' +
  '<th class="tr f6 ttu fw6 pv2 ph3">Points</th>' +
  '</tr>' +
  '<tr id="first" class="navy bg-white">' +
  '<td class="pv2 ph3">1</td>' +
  '<td class="pv2 ph3" id="1stName"></td>' +
  '<td class="pv2 ph3" id="1stScore"></td>' +
  '</tr>' +
  '<tr id="second" class="navy bg-white">' +
  '<td class="pv2 ph3">2</td>' +
  '<td class="pv2 ph3" id="2ndName"></td>' +
  '<td class="pv2 ph3" id="2ndScore"></td>' +
  '</tr>' +
  '<tr id="third" class="navy bg-white">' +
  '<td class="pv2 ph3">3</td>' +
  '<td class="pv2 ph3 tc" id="3rdName"></td>' +
  '<td class="pv2 ph3" id="3rdScore"></td>' +
  '</tr>'
var addContentWhenUserIs4nd =
  '<tr id="me" class="white bg-light-red">' +
  '<td class="pv2 ph3">4</td>' +
  '<td class="pv2 ph3" id="myName"></td>' +
  '<td class="pv2 ph3" id="myScore"></td>' +
  '</tr>' +
  '<tr id="down" class="navy bg-white">' +
  '<td class="pv2 ph3">5</td>' +
  '<td class="pv2 ph3" id="downName"></td>' +
  '<td class="pv2 ph3" id="downScore"></td>' +
  '</tr>';

var addContentWhenUserIs5th =
  '<tr id="up" class="navy bg-white">' +
  '<td class="pv2 ph3">4</td>' +
  '<td class="pv2 ph3" id="upName"></td>' +
  '<td class="pv2 ph3 tc" id="upScore"></td>' +
  '</tr>' +
  '<tr id="me" class="white bg-light-red">' +
  '<td class="pv2 ph3">5</td>' +
  '<td class="pv2 ph3" id="myName"></td>' +
  '<td class="pv2 ph3" id="myScore"></td>' +
  '</tr>' +
  '<tr id="down" class="navy bg-white">' +
  '<td class="pv2 ph3">6</td>' +
  '<td class="pv2 ph3" id="downName"></td>' +
  '<td class="pv2 ph3" id="downScore"></td>' +
  '</tr>';

var addContentWhenUserIs6th =
  '<tr id="jum" class="navy bg-white">' +
  '<td class="pv2 ph3"></td>' +
  '<td class="pv2 ph3">...</td>' +
  '<td class="pv2 ph3"></td>' +
  '</tr>' +
  '<tr id="up" class="navy bg-white">' +
  '<td class="pv2 ph3"></td>' +
  '<td class="pv2 ph3" id="upName"></td>' +
  '<td class="pv2 ph3 tc" id="upScore"></td>' +
  '</tr>' +
  '<tr id="me" class="white bg-light-red">' +
  '<td class="pv2 ph3"></td>' +
  '<td class="pv2 ph3" id="myName"></td>' +
  '<td class="pv2 ph3" id="myScore"></td>' +
  '</tr>' +
  '<tr id="down" class="navy bg-white">' +
  '<td class="pv2 ph3"></td>' +
  '<td class="pv2 ph3" id="downName"></td>' +
  '<td class="pv2 ph3" id="downScore"></td>' +
  '</tr>';

buttonPlus.addEventListener('click', function () {
  document.getElementById('buttons').classList.toggle('dn');
});

buttonAddPaper.addEventListener('click', function () {
  modalAddPaper.classList.toggle('dn');
});

buttonAddConnection.addEventListener('click', function () {
  modalAddConnection.classList.toggle('dn');
});

buttonCloseModalPaper.addEventListener('click', function () {
  modalPaper.classList.add('dn');
})

buttonSendNewPaper.addEventListener('click', function () {
  if (document.getElementById('paper-title').value != "") {
    var nodes = [];
    var authors = [];
    var database = firebase.database();

    database.ref().once('value', function (snapshot) {
      var data = snapshot.val();
      data['nodes'].forEach(function (item, index, array) {
        nodes.push(item);
      });
      data['authors'].forEach(function (item, index, array) {
        authors.push(item);
      })
      nodes.push(document.getElementById('paper-title').value);
      authors.push(document.getElementById('paper-author').value);
      database.ref().update({
        nodes,
        authors
      });
    });
    var user = firebase.auth().currentUser;
    var name, uid;
    if (user != null) {
      name = user.displayName;
      uid = user.uid;
    } else {
      alert("Please Sign-Up");
      return;
    }
    if (user) {
      firebase.database().ref('users/' + uid + '/papers').push().set({
        'name': document.getElementById('paper-title').value,
        'author': document.getElementById('paper-author').value
      });
      var score;
      database.ref('users/' + uid + '/score').once('value', function (snapshot) {
        if (snapshot.val() == undefined) {
          score = 0;
        } else {
          score = snapshot.val();
        }
      });
      updates = {};
      updates['users/' + uid + '/score'] = score + 30;
      updates['/users/' + uid + '/name'] = name;
      database.ref().update(updates);
    }
    modalAddPaper.classList.add('dn');

  }
});

buttonSendNewConnection.addEventListener('click', function () {
  var paper1 = document.getElementById('paper1');
  var paper2 = document.getElementById('paper2');
  var relationship = document.getElementById('relationship');
  var description = document.getElementById('connection-description');

  var user = firebase.auth().currentUser;
  var name, uid;
  if (user != null) {
    name = user.displayName;
    uid = user.uid;
  } else {
    alert("Please Sign-Up");
    return;
  }
  var newPostRef = firebase.database().ref('connections').push();
  newPostRef.set({
    'paper1': Number(paper1.value),
    'paper2': Number(paper2.value),
    'relationship': Number(relationship.value),
    'description': description.value,
    'name': name,
    'uid': uid,
    'plus': 0,
    'minus': 0
  });
  if (user) {
    firebase.database().ref('users/' + uid + '/connections').push().set({
      'paper1': Number(paper1.value),
      'paper2': Number(paper2.value),
      'relationship': Number(relationship.value),
      'description': description.value,
    });
    var score;
    database.ref('users/' + uid + '/score').once('value', function (snapshot) {
      if (snapshot.val() == undefined) {
        score = 0;
      } else {
        score = snapshot.val();
      }
    });
    updates = {};
    updates['users/' + uid + '/score'] = score + 50;
    updates['/users/' + uid + '/name'] = name;
    database.ref().update(updates);
  }
  modalAddConnection.classList.add('dn');
});

window.onclick = function (event) {
  if (event.target == modalAddPaper) {
    modalAddPaper.classList.add('dn');
  }
  if (event.target == modalAddConnection) {
    modalAddConnection.classList.add('dn');
  }
  if (event.target == modalConnection) {
    modalConnection.classList.add('dn');
  }
  if (event.target == modalPaper) {
    modalPaper.classList.add('dn');
  }
}

firebase.database().ref('users').on('value', function (snapshot) {
  var scores = [];

  var data = snapshot.val();
  for (var key in data) {
    scores.push({
      score: data[key]['score'],
      name: data[key]['name'],
      uid: key
    })
  }
  scores.sort(compare);
  //console.log(scores);
  var currentUserUID = firebase.auth().currentUser.uid;
  board1stScore.innerText = scores[0].score;
  board1stName.innerText = scores[0].name;
  board2stName.innerHTML = scores[1].name;
  board2stScore.innerHTML = scores[1].score;
  board3stName.innerText = scores[2].name;
  board3stScore.innerText = scores[2].score;
  removeScoreContentBeforeInsert()
  if (scores[0].uid == currentUserUID) {
    board1st.classList.add('white', 'bg-light-red');
    board1st.classList.remove('navy', 'bg-white');
    board2nd.classList.add('navy', 'bg-white');
    board2nd.classList.remove('white', 'bg-light-red');
    board3rd.classList.add('navy', 'bg-white');
    board3rd.classList.remove('white', 'bg-light-red');
  } else if (scores[1].uid == currentUserUID) {
    board1st.classList.add('navy', 'bg-white');
    board1st.classList.remove('white', 'bg-light-red');
    board2nd.classList.add('white', 'bg-light-red');
    board2nd.classList.remove('navy', 'bg-white');
    board3rd.classList.add('navy', 'bg-white');
    board3rd.classList.remove('white', 'bg-light-red');
  } else if (scores[2].uid == currentUserUID) {
    board1st.classList.add('navy', 'bg-white');
    board1st.classList.remove('white', 'bg-light-red');
    board2nd.classList.add('navy', 'bg-white');
    board2nd.classList.remove('white', 'bg-light-red');
    board3rd.classList.add('white', 'bg-light-red');
    board3rd.classList.remove('navy', 'bg-white');
  } else if (scores[3].uid == currentUserUID) {
    board1st.classList.add('navy', 'bg-white');
    board1st.classList.remove('white', 'bg-light-red');
    board2nd.classList.add('navy', 'bg-white');
    board2nd.classList.remove('white', 'bg-light-red');
    board3rd.classList.add('navy', 'bg-white');
    board3rd.classList.remove('white', 'bg-light-red');
    scoreBoard.insertAdjacentHTML('beforeend', addContentWhenUserIs4nd);
    document.getElementById('myName').innerText = scores[3].name;
    document.getElementById('myScore').innerText = scores[3].score;
    document.getElementById('downName').innerText = scores[4].name;
    document.getElementById('downScore').innerText = scores[4].score;
  } else if (scores[4].uid == currentUserUID) {
    board1st.classList.add('navy', 'bg-white');
    board1st.classList.remove('white', 'bg-light-red');
    board2nd.classList.add('navy', 'bg-white');
    board2nd.classList.remove('white', 'bg-light-red');
    board3rd.classList.add('navy', 'bg-white');
    board3rd.classList.remove('white', 'bg-light-red');
    scoreBoard.insertAdjacentHTML('beforeend', addContentWhenUserIs5th);
    document.getElementById('upName').innerText = scores[3].name;
    document.getElementById('upScore').innerText = scores[3].score;
    document.getElementById('myName').innerText = scores[4].name;
    document.getElementById('myScore').innerText = scores[4].score;
    document.getElementById('downName').innerText = scores[5].name;
    document.getElementById('downScore').innerText = scores[5].score;
  } else {
    var rank = 0;
    for (var i = 0; i < scores.length; i++) {
      if (scores[i].uid == currentUserUID) {
        rank = i;
      }
    }
    board1st.classList.add('navy', 'bg-white');
    board1st.classList.remove('white', 'bg-light-red');
    board2nd.classList.add('navy', 'bg-white');
    board2nd.classList.remove('white', 'bg-light-red');
    board3rd.classList.add('navy', 'bg-white');
    board3rd.classList.remove('white', 'bg-light-red');
    scoreBoard.insertAdjacentHTML('beforeend', addContentWhenUserIs6th);
    document.getElementById('upName').innerText = scores[rank - 1].name;
    document.getElementById('upScore').innerText = scores[rank - 1].score;
    document.getElementById('myName').innerText = scores[rank].name;
    document.getElementById('myScore').innerText = scores[rank].score;
    document.getElementById('downName').innerText = scores[rank + 1].name;
    document.getElementById('downScore').innerText = scores[rank + 1].score;
  }


});

function compare(a, b) {
  if (a.score > b.score) {
    return -1;
  } else {
    return 1;
  }
}

function removeScoreContentBeforeInsert() {
  if (document.getElementById('up') != null) {
    document.getElementById('score-board').removeChild(document.getElementById('up'));
  }
  if (document.getElementById('me') != null) {
    document.getElementById('score-board').removeChild(document.getElementById('me'));
  }
  if (document.getElementById('down') != null) {
    document.getElementById('score-board').removeChild(document.getElementById('down'));
  }
  if (document.getElementById('jum') != null) {
    document.getElementById('score-board').removeChild(document.getElementById('jum'));
  }
}