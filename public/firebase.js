function PrejudiceViewer() {
  this.signInButton = document.getElementById('sign-in');
  this.signOutButton = document.getElementById('sign-out');
  this.userName = document.getElementById('user-name');
  //this.signInSnackbar = document.getElementById('must-signin-snackbar');

  this.signInButton.addEventListener('click', this.signIn.bind(this));
  this.signOutButton.addEventListener('click', this.signOut.bind(this));

  this.initFirebase();
}


PrejudiceViewer.prototype.initFirebase = function () {
  this.auth = firebase.auth();
  this.database = firebase.database();
  this.storage = firebase.storage();

  this.auth.onAuthStateChanged(this.onAuthStateChanged.bind(this));
}

PrejudiceViewer.prototype.signIn = function () {
  var provider = new firebase.auth.GoogleAuthProvider();
  this.auth.signInWithPopup(provider);
}

PrejudiceViewer.prototype.signOut = function () {
  this.auth.signOut();
}

PrejudiceViewer.prototype.onAuthStateChanged = function (user) {
  if (user) {
    var userName = user.displayName;

    this.userName.textContent = userName;

    this.userName.classList.remove('dn');
    this.signOutButton.classList.remove('dn');
    this.signInButton.classList.add('dn');
    this.userName.classList.add('dib');
    this.signOutButton.classList.add('dib');
    this.signInButton.classList.remove('dib');

  } else {
    this.userName.classList.add('dn');
    this.signOutButton.classList.add('dn');
    this.signInButton.classList.remove('dn');
    this.userName.classList.remove('dib');
    this.signOutButton.classList.remove('dib');
    this.signInButton.classList.add('dib');

  }
}

window.onload = function () {
  window.prejudiceViewer = new PrejudiceViewer();
}