var express = require('express');
var session = require('express-session');

var app = express();
var bodyParser = require('body-parser');
var serverUrl = process.env.NODE_ENV === 'production' ? '107.170.218.14' : '0.0.0.0';
var port = process.env.NODE_ENV === 'production' ? 80 : 3000;

//hopefully these can be removed soon... 
var Cookies = require("cookies");
app.use(Cookies.express())

//MONGO BABY!
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/geoChat');
var db = mongoose.connection;
//verify connection.
db.once('open', function callback () {
  console.log('Conntected To Mongo Database');
});


var Schema = mongoose.Schema;
var userSchema = new Schema({
  username: String,
  password: String,
  hairId: String,
  faceId: String
});

var messageSchema = new Schema({
  userId: String,
  username: String,
  message: String,
  totalVotes: Number,
  downVotes: [],
  upVotes: [],
  comments: [], //holds array of comments submitted on each message.
  favorites: [], //holds a list of userIds that have favorited this message.
  latitude: String,
  longitude: String,
  hairId: String,
  faceId: String,
  timestamp: {type: Date, default: Date.now}
});

var commentSchema = new Schema({
  messageId: String,
  userId: String,
  username: String,
  comment: String,
  timestamp: {type: Date, default: Date.now}
});


app.use('/murmur', express.static('./client'));
app.use(bodyParser.json());

//express session support
app.use(session({
  secret: 'geo chat gee baller',
  resave: false,
  saveUninitialized: false
}));

app.get('/', function (request, response){
  response.redirect('murmur');
});

//the token needs to be set in order to access firebase.
//this is a crappy function that should be taken out or replaced by something useful.
// app.get('/', function(request, response){
//   if(request.cookies.get('token')){
//     console.log('already have a token')
//     request.method = 'get';
//     response.redirect('/murmur');
//     //response.send({redirect: '/murmur'});
//   } else {  // set Token Cookie
//     response.cookies.set('token', tokenFactory(), {
//       maxAge: 2628000000,   // expires in 1 month
//       httpOnly: false,    // more secure but then can't access from client
//     })
//     request.method = 'get';
//     response.send({redirect: '/murmur'});
//   }
// });

var user = mongoose.model('user', userSchema); //this is basically the users collection.

function checkUser(username, password, request, response, cb){
  var clientResponse = 'Welcome ' + username;
  user.find({username: username, password: password}, function(err, data){
    if(data.length === 0 && request.url === '/signup'){
      var newUser = new user({
        username: username, 
        password: password,
        hairId: Math.floor(Math.random()*98)+1,
        faceId: Math.floor(Math.random()*17)+1
      });
      newUser.save(function(err, data){
      });
    }
    else if(data.length !== 0 && request.url === '/signup'){
      clientResponse = 'Username found, please login';
    }
    else if(data.length === 0 && request.url === '/login'){
      clientResponse = 'Username or password not found. Please signup';
    }
  console.log("userData", data);
  cb(clientResponse, data);
  });
}

app.post('/login', function (request, response){
  checkUser(request.body.username, request.body.password, request, response, function(clientResponse, data){
    response.send(clientResponse, data);
  });
});

app.post('/signup', function (request, response){
  // request.session.username = request.body.username;
  
  checkUser(request.body.username, request.body.password, request, response, function(clientResponse, data){
    response.send(clientResponse, data);
  });
});


var message = mongoose.model('message', messageSchema);

app.post('/message', function (request, response) {
  var newMessage = new message({
    userId: request.body.userId, //this should come from the session.
    username: request.body.username,  //this should come from the session.
    message: request.body.message,
    totalVotes: 0,
    downVotes : [], //voters holds an array of userIds to record who has voted on this message.
    upVotes: [],
    favorites : [], //holds a list of userIds that have favorited this message.
    latitude: request.body.latitude,
    longitude: request.body.longitude,
    hairId: request.body.hairId,
    faceId: request.body.faceId
  });
  newMessage.save(function (err, data){
    console.log("new message", data);
    response.send(data);
  });
  // response.send(request.session.username);
});
//fetch all messages from the server.
app.get('/message', function (request, response) {
  message.find({}, function (err, messages) {
    console.log(messages);
    response.send(JSON.stringify(messages));
  });
});


var comment = mongoose.model('comment', commentSchema); //comment collection.

app.post('/comment', function (request, response){
  console.log("comment submitted!");
  var newComment = new comment({
    messageId: request.body.messageId,
    userId: request.body.userId, //this should come from the session.
    username: request.body.username,  //this should come from the session.
    comment: request.body.comment
  });
  newComment.save(function (err, data){
    response.send(data);
  });
  // response.send(request.session.username);
});

app.post('/comments', function (request, response) {
  console.log("comments fetched!");
  comment.find({messageId: request.body.messageId}, function (err, comments) {
    console.log(JSON.stringify(comments));
    response.send(JSON.stringify(comments));
  });
});

app.post('/voteComment', function (request,response){
  firebase.voteComment(request, response);
});

app.post('/favorite', function (request,response){
  message.findOne({_id: request.body.messageId}, function (err, targetMessage) {
    targetMessage.favorites = request.body.favorites;
    targetMessage.save(function (err, data) {
      response.send(data);
    })
  });
});

app.post('/downVote', function (request,response){
  message.findOne({_id: request.body.messageId}, function (err, targetMessage) {
    targetMessage.totalVotes = request.body.totalVotes;
    targetMessage.downVotes = request.body.downVotes;
    targetMessage.save(function (err, data) {
      response.send(data);
    });
  });
});

app.post('/upVote', function (request,response){
  message.findOne({_id: request.body.messageId}, function (err, targetMessage) {
    targetMessage.totalVotes = request.body.totalVotes;
    targetMessage.upVotes = request.body.upVotes;
    targetMessage.save(function (err, data) {
      response.send(data);
    });
  });
});

app.listen(port, serverUrl);
console.log('server listening to:', serverUrl, ':', port);
