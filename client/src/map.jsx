var React = require('react');
var url = 'http://0.0.0.0:3000/';
var Message = require('./message.jsx');

module.exports = React.createClass({
    showMap: function(position){
        localStorage.setItem('latitude', position.coords.latitude);
        localStorage.setItem('longitude', position.coords.longitude);
        var mapOptions = {
                center: new google.maps.LatLng(position.coords.latitude, position.coords.longitude),
                zoom: 20
            },
            map = new google.maps.Map(this.getDOMNode(), mapOptions);
        

        var marker = new google.maps.Marker({
            position: new google.maps.LatLng(position.coords.latitude, position.coords.longitude), 
            map: map, 
            title: "Where you're at", 
            icon: new google.maps.MarkerImage('https://maps.google.com/mapfiles/kml/shapes/man.png', null, null, null, new google.maps.Size(40, 40)) 
        });

        marker.addListener('click', function(){
            map.setZoom(30);
            map.setCenter(marker.getPosition());
        });
        map.addListener('click', function(){
            map.setZoom(20);
            map.setCenter(marker.getPosition());

        });
        
        map.addListener('bounds_changed', function(){
          // console.log('bounds_changed', map.getBounds());
          var bounds = map.getBounds();
          this.updateMap(bounds);
        }.bind(this));

        function addInfoWindow(marker, message) {
            var infoWindow = new google.maps.InfoWindow({
                content: message
            });
            marker.addListener('mouseover', function () {
                infoWindow.open(map, marker);
            });
            marker.addListener('mouseout', function () {
                infoWindow.close(map, marker);
            });
        }

        for(var i = 0; i < this.props.messages.length; i++){
            var Newmarker = new google.maps.Marker({       
                position: new google.maps.LatLng(this.props.messages[i]._store.props.latitude, this.props.messages[i]._store.props.longitude), 
                map: map,
                icon: new google.maps.MarkerImage("http://icons.iconarchive.com/icons/custom-icon-design/mono-general-1/512/chat-icon.png", null, null, null, new google.maps.Size(40, 40))     
            }); 
            addInfoWindow(Newmarker, this.props.messages[i]._store.props.message);
        }

    },
    getLocation: function(){
        if(navigator.geolocation){
            navigator.geolocation.getCurrentPosition(this.showMap);
        }
        else{
            alert("Geolocation is not supported by this browser.");
        }
    },
    updateMap: function(bounds){
        console.log('map update', bounds);
        // this.props.updateGeoFilter(min, max, j);
    },
    render: function () {
        this.getLocation();
        return (
            <div className='map-gic'></div>
        );
    }
});
