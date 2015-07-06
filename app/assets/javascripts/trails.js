$( document ).on("ready",function() {
  var path = window.location.pathname;

  if(path.search(/trails\/[0-9]+$/)!=-1){
    $("a.fancybox").fancybox();
    trailShow();

  }

  //it's peanut butter jelly time - search controller

});

function trailShow(){
  L.mapbox.accessToken =
    'pk.eyJ1IjoidGhhbm9zYmVsIiwiYSI6IjRmMGU0NWNjZmM0ZTNiYzY2ZjE5ZDc2MDQ3ZTg4ZWQwIn0.oLX-8wI3088OqyhYC-c4_A';
  var map = L.mapbox.map('map', 'thanosbel.lmm46d4d');

  var url = window.track_id.toString();

  var polyline_options = {
    color: '#D63333'
  };
  // As with any other AJAX request, this technique is subject to the Same Origin Policy:
  // http://en.wikipedia.org/wiki/Same_origin_policy the server delivering the request should support CORS.
  $.ajax({
    dataType: 'json',
    url: url
  }).done(processGeoJsonData)


  function processGeoJsonData(data){

    trailGeoJson = data.trail;
    photosGeoJson = data.photos;
    points = initiateMyMap();
    pointsAdded = 0;
    j = 0;
    polyline = L.polyline([], polyline_options).addTo(map);


    markers = createMarkers(points);

    window.setTimeout(myBounceMarkers , 1000);

    // if animateDraw == true {
    //
    // window.setTimeout(drawOnMap ,3000);
    //
     photosLayer = L.mapbox.featureLayer().addTo(map);

    photosLayer.on('layeradd', function(e) {
      var marker = e.layer,
        feature = marker.feature;

      // Create custom popup content
      var popupContent =//  '<a target="_blank" class="popup" href="' + feature.properties.url + '">' +
        '<img src="' + feature.properties.url + '" />'// +
//        feature.properties.city +
  //      '</a>';

      // http://leafletjs.com/reference.html#popup
      marker.bindPopup(popupContent,{
        closeButton: false,
        minWidth: 320
      });
    });

    //// Add features to the map


    //}
    //else {
    window.setTimeout(animateUserMovement , 3000);
    //}
  }







  function initiateMyMap() {

    var coordinates_length = trailGeoJson.features[0].geometry.coordinates.length;
    console.log(coordinates_length);
    var middle_point_index =  Math.floor((coordinates_length-1)/2);
    var  middle_point =  [trailGeoJson.features[0].geometry.coordinates[middle_point_index][1] ,
      trailGeoJson.features[0].geometry.coordinates[middle_point_index][0]];
    first_point = [trailGeoJson.features[1].geometry.coordinates[1] , trailGeoJson.features[1].geometry.coordinates[0]];
    last_point = [trailGeoJson.features[2].geometry.coordinates[1] , trailGeoJson.features[2].geometry.coordinates[0]];
    time_step = Math.floor(10000 / coordinates_length);
    timer = Math.max(1 , time_step);

    var f = L.mapbox.featureLayer(trailGeoJson.features[0]);
    map.fitBounds(f.getBounds());
    delete f;

    return { first_point: first_point , last_point: last_point};


  }



  function createMarkers(points){


    var start_marker = L.marker( points.first_point, {
      bounceOnAdd: true,
      bounceOnAddOptions: {duration:2000, height:50},
      title: trailGeoJson.features[1].properties.title,
      icon: L.mapbox.marker.icon({
        'marker-size': 'medium',
        'marker-symbol': 's',
        'marker-color': '00E263'
      })}).setBouncingOptions({
        bounceHeight : 35
      });

      var finish_marker = L.marker(points.last_point, {
        bounceOnAdd: true,
        bounceOnAddOptions: {duration:2000, height:100},
        title: trailGeoJson.features[2].properties.title,
        icon: L.mapbox.marker.icon({
          'marker-size': 'medium',
          'marker-symbol': 'f',
          'marker-color': '#D63333'

        })}).setBouncingOptions({
          bounceHeight : 35
        });
        return {start_marker: start_marker , finish_marker: finish_marker};
  }

  function myBounceMarkers(){

    markers.start_marker.addTo(map).bounce(1);
    window.setTimeout(function(){
      markers.finish_marker.addTo(map).bounce(1);
    }, 1000);
  }


  function drawOnMap(){
    coordinatesLength =  trailGeoJson.features[0].geometry.coordinates.length;
    point = [ trailGeoJson.features[0].geometry.coordinates[j][1],
      trailGeoJson.features[0].geometry.coordinates[j][0]];


    polyline.addLatLng(L.latLng(point));
    ++j;
    if (j< coordinatesLength){

      window.setTimeout(drawOnMap , timer);
    }

  }



  function animateUserMovement(){



    //L.mapbox.featureLayer(trailGeoJson[0].features[0]).addTo(map);
    marker = L.marker(points.first_point, {
      icon: L.mapbox.marker.icon({
        'marker-size' :'medium',
        'marker-symbol': 'pitch',
        'marker-color': '#66A3FF'
      })
    }).addTo(map);
    tick();
  }


  function tick() {
    var coordinatesLength =  trailGeoJson.features[0].geometry.coordinates.length;
    var point = [ trailGeoJson.features[0].geometry.coordinates[j][1],
      trailGeoJson.features[0].geometry.coordinates[j][0]];

    polyline.addLatLng(L.latLng(point));


    marker.setLatLng(L.latLng(point));


    // Move to the next point of the line
    // until `j` reaches the length of the array.
    if (++j < coordinatesLength) setTimeout(tick, timer);
    else {
      marker.bounce(2);
      window.setTimeout(function() {
      map.removeLayer(marker)},2100);
      photosLayer.setGeoJSON(photosGeoJson);
    }


  }
}



