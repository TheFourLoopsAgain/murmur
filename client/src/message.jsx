var React = require('react');
var moment = require('moment');
var CommentBox = require('./commentBox');
var Comment = require('./comment');

var url = 'http://0.0.0.0:3000/';

var Message = React.createClass({

  getInitialState: function() {
    console.log("creating message!");

    this.loadComments();
    console.log("totalVotes", this.props.totalVotes, this.props.message);
    return {
      commentsView: false,
      commentRows: [],
      favorites: this.props.favorites,
      totalVotes: this.props.totalVotes,
      upVotes: this.props.upVotes,
      downVotes: this.props.downVotes
    };
  },

  commentsUpdate: function(newComment) {
    
    this.state.commentRows.push(
      <Comment
        commentId={ newComment._id }
        messageId={ newComment.messageId }
        comment={ newComment.comment }
        timestamp={ newComment.timestamp } />
    );
    this.setState({commentRows: this.state.commentRows})
  },

  toggleComments: function() {
    this.setState({ commentsView: !this.state.commentsView });
  },

  loadComments: function(){
    var commentRows = [];
    $.ajax({
      type: 'POST',
      data: JSON.stringify({
        "messageId": this.props.messageId,
      }),
      url: url+'comments',
      contentType: 'application/json',
      success: function(comments) {
        var comments = JSON.parse(comments);
        for (var i=0; i<comments.length; i++){
          commentRows.push(
            <Comment
              commentId={ comments[i]._id }
              messageId={ comments[i].messageId }
              comment={ comments[i].comment }
              commentVotes={ 0 }
              timestamp={ comments[i].timestamp } />
          );
        }
        this.setState({ commentRows: commentRows });
      }.bind(this)
    });
  },

  // Post upvote data to Server
  upVoteToggle: function(){
    var upVotes = this.state.upVotes;  
    var totalVotes = this.state.totalVotes;
    var voteLoc = upVotes.indexOf(window.sessionStorage.userId);
    if (voteLoc !== -1){
      upVotes.splice(voteLoc, 1);
      var newTotal = totalVotes + 1;
    }
    else {
      upVotes.push(window.sessionStorage.userId);
      var newTotal = totalVotes + 1;
    }
    // if (this.state.upVotes.indexOf(window.sessionStorage.userId) !== -1) {
    //   // this.upVoteToggle();
    // }
    this.setState({totalVotes: newTotal})
    this.setState({upVotes: upVotes});

    $.ajax({
      type: 'POST',
      url: url + 'upVote' ,
      contentType: 'application/json',
      data: JSON.stringify({
        "messageId": this.props.messageId,
        "upVotes": upVotes,
        "totalVotes": newTotal
      }),
      success: function(){
      }
    });
  },

  // Post downvote data to Server
  downVoteToggle: function(){
    var downVotes = this.state.downVotes; //favorites is a object of objects with userIds as keys and true/false as values.    
    var totalVotes = this.state.totalVotes;
    var voteLoc = downVotes.indexOf(window.sessionStorage.userId);
    if (voteLoc !== -1){
      downVotes.splice(voteLoc, 1);
      var newTotal = totalVotes + 1;
    }
    else {
      downVotes.push(window.sessionStorage.userId);
      var newTotal = totalVotes - 1;
    }
    if (this.props.upVotes.indexOf(window.sessionStorage.userId) !== -1) {
      // this.upVoteToggle();
    }
    this.setState({totalVotes: newTotal});
    this.setState({downVotes: downVotes})

    $.ajax({
      type: 'POST',
      url: url + 'downVote' ,
      contentType: 'application/json',
      data: JSON.stringify({
        "messageId": this.props.messageId,
        "downVotes": downVotes,
        "totalVotes": newTotal
      }),
      success: function(){
      }
    });
  },

  toggleFavorite: function(event){
    var favs = this.state.favorites.slice(); //favorites is a object of objects with userIds as keys and true/false as values.    
    var favLocation = favs.indexOf(window.sessionStorage.userId);
    if (favLocation !== -1){
      favs.splice(favLocation, 1);
    }
    else {
      favs.push(window.sessionStorage.userId);
    }
    $.ajax({
      type: 'POST',
      url: url + 'favorite' ,
      contentType: 'application/json',
      data: JSON.stringify({
        "messageId": this.props.messageId,
        "favorites": favs,
      }),
      success: function(data, err){
        this.setState({favorites: favs})
      }.bind(this)

    });
  },

  componentDidMount: function () {
    var component = this;
    setTimeout(function () {
        component.setState({
          commentsView: false,
        });
    });
  },

  render: function() {
    var commentRows = [];
    if(this.props.comments.length !== 0){
      for(commentKey in this.props.comments){
        var comments = this.props.comments[commentKey];
        commentRows.push(
          <CommentMessage
            key={ comments.commentId }
            token={ this.props.token }
            auth={ this.props.auth }
            messageId={ this.props.messageId }
            commentId={ comments.commentId }
            commentMessage={ comments.comment }
            commentVotes={ comments.votes }
            commentTimestamp={ comments.timestamp }
            baseId={ comments.baseId }
            hairId={ comments.hairId } />
        );
      }
    }

    var commentRowsSortedOptions = {
      recent: this.state.commentRows.sort(function(a,b){
        return a.props.timestamp > b.props.timestamp ? -1 : 1;
      })
    };

    var styleFavorites =
      // check if the 'uid' favorited the message
      this.state.favorites.indexOf(window.sessionStorage.userId) === -1 ?
        {
          float: 'left',
          marginRight: '10px',
          fontSize: '1.85em',
          color: '#a8aeb8', // if NOT favorited
          borderColor: 'green',
          cursor: "pointer"
        }
        :
        {
          float: 'left',
          marginRight: '10px',
          fontSize: '1.85em',
          color: '#F12938', // red if favorited
          cursor: "pointer"
        }

    return (
      <div className="jumbotron" id= {this.props.messageId} key={this.props.messageId}  style={{ borderRadius: '40px', paddingLeft: '0', paddingRight: '0', paddingTop: '15px', paddingBottom: '7px', backgroundColor: '#ECF0F5'}} >
        <div className="container">
          <div className="col-xs-10" style={{ marginBottom: '20px', paddingLeft:'10px', marginBottom: '0'}}>
            <p style={{fontFamily: 'Alegreya', color: 'chocolate', marginLeft: "10px", marginBottom: '0'}}>
              { this.props.message }
            </p>
          </div>
          <div className="votes col-xs-2" style={ this.styles.votes }>
            <div style={ this.styles.voteContainer }>
              <i className="glyphicon glyphicon-chevron-up" style={{color: "#0000FF", cursor:"pointer"}} onClick={ this.upVoteToggle }></i>
              <span className="count" style={{fontFamily: 'Alegreya'}}> { this.state.totalVotes } </span>
              <i className="glyphicon glyphicon-chevron-down" style={{color: "#0000FF", cursor:"pointer"}} onClick={ this.downVoteToggle }></i>
            </div>
          </div>

          <div className="col-xs-12" style={{paddingLeft:'10px'}}>
            <div className="col-xs-1">
              <span style={styleFavorites} onClick={ this.toggleFavorite }>
                <i className="glyphicon glyphicon-heart"></i>
              </span>
            </div>
            <div className="col-xs-2" style={ this.styles.timestamp }>
              <i className="glyphicon glyphicon-time" style={ this.styles.iconStyle }></i>
              <span style={{fontFamily:"Alegreya", fontStyle: "italic", fontSize: '.8em', position: 'relative', top: '-7px'}}>
                { moment(this.props.timestamp).fromNow() }
              </span>
            </div>
            <div style={ this.styles.comments }>
              <div className="commentViewToggle" onClick={ this.toggleComments } style={{cursor:"pointer"}}>
                <i className="glyphicon glyphicon-comment" style={ this.styles.iconStyle }></i>
                <span style={{fontStyle: "italic", fontSize: '.8em'}}>
                  <span style={{fontFamily:"Alegreya", fontWeight: 'bold', color: 'blue', fontSize: '1.1em', position: 'relative', top: '-7px'}}> { this.state.commentsView ? 'hide ' : 'show ' } </span>
                  <span style={{fontFamily:"Alegreya", position: 'relative', top: '-7px'}}> { this.state.commentRows.length + ' comments'} </span>
                </span>
              </div>
            </div>
          </div>

          <div style={ this.state.commentsView ? this.styles.commentsView : this.styles.hidden }>
            <CommentBox messageId={ this.props.messageId } commentsUpdate={this.commentsUpdate} />
            { commentRowsSortedOptions.recent }
          </div>
        </div>
      </div>
    )
  },

  styles: {
    timestamp: {
      float: "left"
    },
    comments: {
      float: "left"
    },
    votes: {
      fontSize: "19px",
      textAlign: 'center'
    },
    commentButton: {
      position: "relative",
      top: "-3px"
    },
    voteContainer: {
      width: "20px",
      float: "right"
    },
    iconStyle: {
      marginLeft: "20px",
      marginRight: "10px",
      fontSize: '1.85em',
      color: '#a8aeb8'
    },
    commentsView: {
      display: "block",
    },
    hidden: {
      display: "none",
    }
  }
});

module.exports = Message;
