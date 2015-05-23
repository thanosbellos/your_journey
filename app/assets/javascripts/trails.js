$( document ).ready(function() {

L.mapbox.accessToken = 'pk.eyJ1IjoidGhhbm9zYmVsIiwiYSI6InZqbFEtSk0ifQ.nLEw7BjpabHkHfC1g0Gr_A';
var map = L.mapbox.map('map', 'thanosbel.lmm46d4d');

console.log( track_id);
var url = track_id.toString();
console.log(url);
function load() {
  // As with any other AJAX request, this technique is subject to the Same Origin Policy:
  // http://en.wikipedia.org/wiki/Same_origin_policy the server delivering the request should support CORS.
  $.ajax({
    dataType: 'json',
    url: url,
    success: function(geojson) {
        path_as_geoJson = geojson
        console.log("thanos");
        polyline = L.polyline([]).addTo(map);
        pointsAdded = 0;
        j = 0;
        // On success add fetched data to the map.
        //L.mapbox.featureLayer(geojson).addTo(map);
        L.mapbox.featureLayer(path_as_geoJson[0].features[1]).addTo(map);
        L.mapbox.featureLayer(path_as_geoJson[0].features[2]).addTo(map);

        add();
        //L.mapbox.featureLayer(path_as_geoJson[0].features[1]).addTo(map);
        //L.mapbox.featureLayer(path_as_geoJson[0].features[2]).addTo(map);
    }
  });
}
load();

function add(){

  first_point =  [path_as_geoJson[0].features[0].geometry.coordinates[0][1] ,  path_as_geoJson[0].features[0].geometry.coordinates[j][0]],
  polyline.addLatLng(L.latLng(

    path_as_geoJson[0].features[0].geometry.coordinates[j][1],
    path_as_geoJson[0].features[0].geometry.coordinates[j][0]));

    map.setView(first_point,14);
    j++;
    if(++pointsAdded <path_as_geoJson[0].features[0].geometry.coordinates.length) window.setTimeout(add,100);

}
});
