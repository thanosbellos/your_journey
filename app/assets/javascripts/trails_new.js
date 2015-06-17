$( document ).ready(function() {
  var path = document.URL;
  console.log(path);
  if(path.search(/trails\/new/)!=-1){

    console.log('asdf');
      L.mapbox.accessToken =
        'pk.eyJ1IjoidGhhbm9zYmVsIiwiYSI6IjRmMGU0NWNjZmM0ZTNiYzY2ZjE5ZDc2MDQ3ZTg4ZWQwIn0.oLX-8wI3088OqyhYC-c4_A';
       map = L.mapbox.map('map', 'thanosbel.lmm46d4d');
      var drawnLayers = L.featureGroup().addTo(map);

      $("input[type=file]").on('change',function(e){
        var selectedFile = this.files[0];
        var reader = new FileReader();
        reader.onload = function(e){
          var parser = new DOMParser();
          var doc = parser.parseFromString(e.target.result, "application/xml");

          trackPath = toGeoJSON.gpx(doc);

          previewTrackPath(trackPath, drawnLayers);


        }
        reader.readAsText(selectedFile);
      });


  }

});


function previewTrackPath(trackPath , drawnLayers){
  drawnLayers.clearLayers();

    var polyline_options = {
      color: '#D63333',
      weight: 3,
      opacity: 0.5,
      smoothFactor: 1
     };

    var coordinates;

  if(trackPath.features[0].geometry.type =="MultiLineString"){

   coordinates = trackPath.features[0].geometry.coordinates
        .reduce(function(a,b){
          return a.concat(b);
        });
   }else {
   coordinates = trackPath.features[0].geometry.coordinates;
  }
  var latlng = coordinates.map(function(coordinate){
              return L.latLng([coordinate[1],coordinate[0]]);
          });


  var myPolyline = L.polyline(latlng, polyline_options);


  drawnLayers.addLayer(myPolyline);

  firstMarker =  L.marker( latlng[0], {
                             draggable:false,
                             title: 'Start Point',
                             icon: L.mapbox.marker.icon({
                              'marker-size': 'medium',
                              'marker-symbol': 's',
                              'marker-color': '#00E263'
                             }),
                             zIndexOffset: 100
                    });

  lastMarker =  L.marker( latlng[latlng.length-1], {
                             draggable:false,
                             title: 'Finish Point',
                             icon: L.mapbox.marker.icon({
                              'marker-size': 'medium',
                              'marker-symbol': 'f',
                              'marker-color': '#D63333'
                             }),
                             zIndexOffset: 100
                    });

  drawnLayers.addLayer(firstMarker);
  drawnLayers.addLayer(lastMarker);

  map.fitBounds(drawnLayers.getBounds());









}

