var React = require('react');
var Message = require('./message');
var TopBar = require('./topbar');
var InputBox = require('./messageBox');
var LoginSignupModal = require('./loginSignupModal');
var Map = require('./map');
var url = 'http://0.0.0.0:3000/';


// var getCookies = function(){
//   var pairs = document.cookie.split(";");
//   var cookies = {};
//   for (var i=0; i<pairs.length; i++){
//     pairs
//     var pair = pairs[i].trim().split("=");
//     cookies[pair[0]] = unescape(pair[1]);
//   }
//   return cookies;
// }

// bind nonsensitive info to sessionStorage for easy use amongst files

// var cookies = getCookies();
// var token = document.token = cookies.token;
// var auth = document.auth = cookies.auth;

var mainView = React.createClass({

  messages: [],
  getInitialState: function(){
    return {
      messages: [],
      sort: 'recent',
    };
  },

  componentWillMount: function(){
    this.getMessages();
  },

  getMessages: function(){
    $.ajax({
      type: 'GET',
      url: url + 'message',
      contentType: 'application/json',
      success: function(messages){
        var messages = JSON.parse(messages);
        var messageRows = [];
        for(var i=0; i<messages.length; i++) {
          var message = messages[i];
          console.log(message);
          //this is utilizing the message component and setting message properties for use in the message view.
          messageRows.push(
            <Message
              faceId={ message.faceId }
              hairId={ message.hairId }
              userId={ message.userId }
              messageId={ message._id }
              message={ message.message }
              comments={ message.comments }
              totalVotes={ message.totalVotes }
              downVotes={ message.downVotes }
              upVotes={ message.upVotes }
              favorites={ message.favorites }
              timestamp={ message.timestamp }
              messagesUpdate={ this.messagesUpdate }
              latitude={ message.latitude }
              longitude={ message.longitude } />
          );
        }
        // this.setState({messages: "easy"});
        this.setState({messages:messageRows});
      }.bind(this)
    });
  },

  messagesUpdate: function(message) {
    // this.state.messages.push(
    //   <Message
    //     messageId={ message._id }
    //     message={ message.message }
    //     comments={ message.comments }
    //     totalVotes={ message.totalVotes }
    //     downVotes={ message.downVotes }
    //     upVotes={ message.upVotes }
    //     favorites={ message.favorites }
    //     timestamp={ message.timestamp } />
    // );
    // this.setState({messages: this.state.messages});
    this.getMessages();
  },


  handleSortRecent: function(){
    this.setState({sort: 'recent'});
    this.getMessages();
  },
  handleSortPopular: function(){
    this.setState({sort: 'popular'});
    this.getMessages();
  },
  handleFavorites: function(){
    this.setState({sort: 'favorites'});
    this.getMessages();
  },
  handleSortClosest: function(){
    this.setState({sort: 'closest'});
  },
  handleMyPosts: function(){
    this.setState({sort: 'myPosts'});
    this.getMessages();
  },
  updateGeoFilter:function(map){
    var bounds = map.getBounds();
    localStorage.northEast = bounds.getNorthEast();
    localStorage.southWest = bounds.getSouthWest();
  },

  styles: {
    filter: {
      paddingTop: '80px',
      width: '100%',
      textAlign: 'center'
    },
    messageRows: {
      padding: '10px',
      width: '50%',
      height: '100px',
      float: 'left',
      margin: 'auto'
    },
    inputBox: {
      marginTop: '200px'
    }
  },
  render: function(){
    var messageRowsSortedOptions = {
      recent: function() {
        console.log(this.state.messages);
        var messages = this.state.messages.slice();
        messages.sort(function(a,b){
          return a.props.timestamp > b.props.timestamp ? -1 : 1;
        })
        console.log("messages", messages);
        return messages;
      }.bind(this),
      popular: function() {
        console.log(this.state.messages);
        var messages = this.state.messages.slice();
        messages.sort(function(a,b){
          return b.props.totalVotes - a.props.totalVotes;
        });
        console.log(messages[0].props);
        return messages;
      }.bind(this),
      favorites: function() {
        var messages = this.state.messages.slice();
        console.log(messages);
        var filtered = messages.filter(function(message){
          if (message.props.favorites.indexOf(window.sessionStorage.userId) !== -1) {
            return message;
          }
        });
        return filtered;
      }.bind(this), 
      myPosts: function() {
        console.log(window.sessionStorage.userId);
        var messages = this.state.messages.slice();
        console.log(messages);
        var filtered = messages.filter(function(message){
          console.log(message.props.userId);
          if(window.sessionStorage.userId === message.props.userId){
            return message;
          }
        });
        return filtered;
      }.bind(this),
      closest:function() {
        var messages = this.state.messages.slice();
        messages.sort(function(a,b){
          return Math.sqrt((b.longitude-localStorage.longitude)*(b.longitude-localStorage.longitude)
            +(b.latitude-localStorage.latitude)*(b.latitude-localStorage.latitude))
          -Math.sqrt((a.longitude-localStorage.longitude)*(a.longitude-localStorage.longitude)
            +(a.latitude-localStorage.latitude)*(a.latitude-localStorage.latitude));
        });
        return messages;
      }.bind(this)
    };

    return (
      <div>
        <TopBar/>
        <LoginSignupModal/>
        <div>
          <div style={this.styles.filter}>
            <Map messages={this.state.messages}/>
            <div className="btn-group" style={{display: 'inline-block', right: '300px'}}>
              <button className="btn btn-default" style={{fontFamily: 'Roboto'}} onClick={ this.handleSortRecent }> New </button>
              <button className="btn btn-default" style={{fontFamily: 'Roboto'}} onClick={ this.handleSortPopular }> Hot </button>
              <button className="btn btn-default" style={{fontFamily: 'Roboto'}} onClick={ this.handleFavorites }>Favorites</button>
              <button className="btn btn-default" style={{fontFamily: 'Roboto'}} onClick={ this.handleMyPosts }>My Posts</button>
              <button className="btn btn-default" style={{fontFamily: 'Roboto'}} onClick={ this.handleSortClosest }>Closest</button>
            </div>
            <InputBox style={this.styles.style} messagesUpdate={this.messagesUpdate} />
          </div>
          <div style={ this.styles.messageRows }>        
            { messageRowsSortedOptions[this.state.sort]() }
          </div>
        </div>

      </div>
    )
  }
})


var element = React.createElement(mainView);
React.render(element, document.querySelector('.container'));
