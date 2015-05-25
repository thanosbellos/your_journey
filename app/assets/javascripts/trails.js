$( document ).ready(function() {

L.mapbox.accessToken = 'pk.eyJ1IjoidGhhbm9zYmVsIiwiYSI6InZqbFEtSk0ifQ.nLEw7BjpabHkHfC1g0Gr_A';
var map = L.mapbox.map('map', 'thanosbel.lmm46d4d');

var url = track_id.toString();

load();
function load() {
  // As with any other AJAX request, this technique is subject to the Same Origin Policy:
  // http://en.wikipedia.org/wiki/Same_origin_policy the server delivering the request should support CORS.
  $.ajax({
    dataType: 'json',
    url: url,
    success: function(geojson) {
        path_as_geoJson = geojson
        coordinates_length =Math.floor(path_as_geoJson[0].features[0].geometry.coordinates.length);
        console.log(coordinates_length)
        middle_point_index =  Math.floor((coordinates_length-1)/2);
        middle_point =  [path_as_geoJson[0].features[0].geometry.coordinates[middle_point_index][1] , path_as_geoJson[0].features[0].geometry.coordinates[middle_point_index][0]];
        first_point = [path_as_geoJson[0].features[1].geometry.coordinates[1] , path_as_geoJson[0].features[1].geometry.coordinates[0]];
        last_point = [path_as_geoJson[0].features[2].geometry.coordinates[1] , path_as_geoJson[0].features[2].geometry.coordinates[0]];
        map.fitBounds([first_point , middle_point,last_point]);
        pointsAdded = 0;
        j = 0;
        polyline = L.polyline([]).addTo(map);

        // On success add fetched data to the map.
        //L.mapbox.featureLayer(geojson).addTo(map);
        //


        start_marker = L.marker(first_point, {
                                bounceOnAdd: true,
                                bounceOnAddOptions: {duration:2000, height:100},
                                icon: L.mapbox.marker.icon({
                                'marker-size': 'small',
                                'marker-symbol': 'bus',
                                'marker-color': '#fa0'
                               })});

        finish_marker = L.marker(last_point, {
                                bounceOnAdd: true,
                                bounceOnAddOptions: {duration:2000, height:100},
                                icon: L.mapbox.marker.icon({
                                'marker-size': 'small',
                                'marker-symbol': 'bus',
                                'marker-color': '#fa0'
                               })});
                               window.setTimeout(myBounceMarkers , 500);
                                //start_marker.bounce(2);
                                //finish_marker.bounce(2);

                                window.setTimeout(add ,2000);
            }
  });
}

function myBounceMarkers(){

  start_marker.addTo(map);
  window.setTimeout(function(){
  finish_marker.addTo(map);
  }, 500);
  //start_marker.bounce(2);
  //
  //finish_marker.bounce(2);
}

function add(){


  polyline.addLatLng(L.latLng(

    path_as_geoJson[0].features[0].geometry.coordinates[j][1],
    path_as_geoJson[0].features[0].geometry.coordinates[j][0]));
    ++j;
      if (j<coordinates_length){

        window.setTimeout(add , 100);
      }

}





});
