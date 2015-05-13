$( document ).ready(function() {

L.mapbox.accessToken = 'pk.eyJ1IjoidGhhbm9zYmVsIiwiYSI6InZqbFEtSk0ifQ.nLEw7BjpabHkHfC1g0Gr_A';
var map = L.mapbox.map('map', 'thanosbel.lmm46d4d').setView([59.797465, 5.256687],12);

console.log( track_id);

$.ajax({
  dataType: 'text',
  url: track_id.toString()+".json",
  success: function(data) {
   path_as_geoJson = $.parseJSON(data);
   polyline = L.polyline([]).addTo(map);
   pointsAdded = 0;
   j = 0;
   add();
  }
});


function add(){

  first_point =  [path_as_geoJson[0].features[0].geometry.coordinates[0][1] ,  path_as_geoJson[0].features[0].geometry.coordinates[j][0]],
  polyline.addLatLng(L.latLng(

    path_as_geoJson[0].features[0].geometry.coordinates[j][1],
    path_as_geoJson[0].features[0].geometry.coordinates[j][0]));

    map.setView(first_point,12);
    j++;
    if(++pointsAdded <path_as_geoJson[0].features[0].geometry.coordinates.length) window.setTimeout(add,5);

}









});
