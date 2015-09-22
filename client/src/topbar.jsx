var React = require('react');
var DisplayUsername = require('./displayUsername');

TopBar = React.createClass({
  signOut: function() {
    window.sessionStorage.username = 'Anonymous';
    window.sessionStorage.userId = 1;
    window.sessionStorage.hairId = 1;
    window.sessionStorage.faceId = 1;
    this.props.loadUser(); //resets the username on the homepage
  },
  render: function() {
    return (
      <div className="navbar navbar-default navbar-fixed-top" style={{'backgroundColor': 'rgb(5,101,188)'}}>
        <div className="container">
          <div className="navbar-header" style={{'float': 'left', 'padding': '15px', 'textAlign': 'center', 'width': '100%' }}>
            <div data-toggle="modal" data-target="#myModal" style={{'float':'left', 'color':'white', 'cursor':'pointer'}}>Login/Signup</div>
            <a href="" className="navbar-brand" style={{'fontFamily': 'Copperplate Gothic Light', 'color': 'white', 'float': 'none' }}> GeoChat</a>
              <span id='username' onClick={this.signOut} style={{'float':'right', 'color':'white', 'cursor':'pointer', 'font-size': '16px', "margin-left":"20px"}}>Logout</span>
              <span id='username' style={{'float':'right', 'color':'white', 'cursor':'pointer', 'font-size': '16px'}}>{this.props.username}</span>
              
          </div>
        </div>
      </div>
    );
  }
});

module.exports = TopBar;
