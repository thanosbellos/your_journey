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
        pointsAdded = 0;
        j = 0;
        polyline = L.polyline([]).addTo(map);

        // On success add fetched data to the map.
        //L.mapbox.featureLayer(geojson).addTo(map);
        //
        middle_point_index =Math.floor((path_as_geoJson[0].features[0].geometry.coordinates.length-1)/2);
        middle_point =  [path_as_geoJson[0].features[0].geometry.coordinates[middle_point_index][1] , path_as_geoJson[0].features[0].geometry.coordinates[middle_point_index][0]];
        first_point = [path_as_geoJson[0].features[1].geometry.coordinates[1] , path_as_geoJson[0].features[1].geometry.coordinates[0]];
                                map.setView(middle_point,12);


        last_point = [path_as_geoJson[0].features[2].geometry.coordinates[1] , path_as_geoJson[0].features[2].geometry.coordinates[0]];
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
                                finish_marker.addTo(map);
                                start_marker.addTo(map);
                                window.setInterval(add , 200);
    }
  });
}










function add(){


  polyline.addLatLng(L.latLng(

    path_as_geoJson[0].features[0].geometry.coordinates[j][1],
    path_as_geoJson[0].features[0].geometry.coordinates[j][0]));
    ++j;
    if(++pointsAdded <path_as_geoJson[0].features[0].geometry.coordinates.length) window.setInterval(add,500);

}





});
