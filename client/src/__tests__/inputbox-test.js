jest.dontMock('../inputbox.jsx');
var Inputbox = require('../inputbox.jsx');
var React = require('react/addons');

var TestUtils = React.addons.TestUtils;

var inputbox = TestUtils.renderIntoDocument(
      <Inputbox />
  );

beforeEach(function(){
  $ = {
    ajax:function(){
      this.ajaxProps = arguments[0];
    },
  };
  localStorage = {
    latitude: 5,
    longitude: 5
  };
  if(!window){
    window = {};
  };
  if(!window.sessionStorage){
    window.sessionStorage = {};
  };
});

describe('inputbox', function(){
  it('should create a composite component and render properly', function(){

    expect(TestUtils.isCompositeComponent(inputbox)).toEqual(true);
  });
  
  it('should make ajax post on enter keystroke', function(){

    var input = TestUtils.findRenderedDOMComponentWithClass(inputbox, 'form-control');
    var form = TestUtils.findRenderedDOMComponentWithClass(inputbox, 'clearfix');

    expect(input.getDOMNode()).toBeTruthy();
    expect(input.getDOMNode()).toBeTruthy();

    TestUtils.Simulate.change(input, {target : {value: 'abc123'}});
    TestUtils.Simulate.submit(form);
    expect(JSON.parse($.ajaxProps.data).message).toEqual('abc123');
  });

  it('should send lat and long with message', function(){

    localStorage.latitude = 42;
    localStorage.longitude = 43;
    var form = TestUtils.findRenderedDOMComponentWithClass(inputbox, 'clearfix');
    TestUtils.Simulate.submit(form);
    expect(JSON.parse($.ajaxProps.data).latitude).toEqual(42);
    expect(JSON.parse($.ajaxProps.data).longitude).toEqual(43);
  });

});




