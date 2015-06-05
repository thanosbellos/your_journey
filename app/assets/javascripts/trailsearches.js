$( window ).load(function() {
 var path = window.location.pathname;
 if (path.search(/search$/)){
   $("#location").val('')
   radius = $("#radius").val();
   L.mapbox.accessToken = 'pk.eyJ1IjoidGhhbm9zYmVsIiwiYSI6InZqbFEtSk0ifQ.nLEw7BjpabHkHfC1g0Gr_A';
   map = L.mapbox.map('map', 'thanosbel.lmm46d4d');

   myGeocoder =  L.Control.Geocoder.nominatim();
   control = L.Control.geocoder({
	 			geocoder: myGeocoder
  	}).addTo(map);


   geolocateUser();
 }
});

function geolocateUser(){

  var geolocate = document.getElementById('geolocate');
  var myLayer = L.mapbox.featureLayer().addTo(map);
  var marker = L.marker([-73, 40], {
    icon: L.mapbox.marker.icon({
      'marker-color': '#f86767'
    })
  });
  var t = 0;

if (!navigator.geolocation) {
    geolocate.innerHTML = 'Geolocation is not available';
} else {

    geolocateHandler = function (e) {
    e.preventDefault();
    e.stopPropagation();
    geolocate.innerHTML = "Searching your location"
    marker.addTo(map);
    map.locate();
    findUserAnimation = window.setInterval(function() {
    // Making a lissajous curve just for fun.
    // Create your own animated path here.
    marker.setLatLng(L.latLng(
        Math.cos(t * 0.5) * 50,
        Math.sin(t) * 50));
        t += 0.1;
      }, 35);
    };

   geolocate.onclick = geolocateHandler;
}

// Once we've got a position, zoom and center the map
// on it, and add a single marker.
  map.on('locationfound', function(e) {
  var userPosition = L.marker( [e.latlng.lat, e.latlng.lng], {
                                draggable: true,
                                bounceOnAdd: true,
                                bounceOnAddOptions: {duration:2000, height:50},
                                title: 'You are here' ,
                                icon: L.mapbox.marker.icon({
                                'marker-size': 'medium',
                                'marker-symbol': 'star',
                                'marker-color': '00E263'
                               })}).setBouncingOptions({
                                 bounceHeight : 35
                               });

    circle = L.circle();

    window.setTimeout(function(){
    //userPosition.addTo(map).bounce();
    geolocate.innerHTML = "We found your location"
    userPosition.addTo(map).bounce();
    map.removeLayer(marker);
    clearInterval(findUserAnimation);
    geolocate.onclick = null;

    window.setTimeout(function(){
      map.setView([e.latlng.lat , e.latlng.lng],11);
      myGeocoder.reverse(e.latlng, map.options.crs.scale(map.getZoom()), function(results) {
        var r = results[0];
        $("#location").val(r.name);
      });

      circle.setLatLng([e.latlng.lat , e.latlng.lng]);
      circle.setRadius(radius);
      circle.addTo(map);
      userPosition.stopBouncing();

    } ,2000);
    },5000);

    userPosition.on('drag', function(e){

      circle.setLatLng(userPosition.getLatLng());

    });

    userPosition.on('dragend', function(e){
    myGeocoder.reverse(userPosition.getLatLng(), map.options.crs.scale(map.getZoom()) ,  function(results){
        var r = results[0];
        $("#location").val(r.name);
      });
    });




});


// If the user chooses not to allow their location
// to be shared, display an error message.
map.on('locationerror', function() {
    geolocate.innerHTML = 'Position could not be found';
    clearInterval(findUserAnimation);
    map.removeLayer(marker);

});

$("#radius").change( function() {

 circle.setRadius( parseInt($("#radius").val()));

});

}
