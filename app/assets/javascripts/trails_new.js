$( document ).on("ready, page:change", function() {
  var path = window.location.pathname;
  if(path.search(/trails\/new/) !=-1) {sessionStorage.clear()}
  if(path.search(/trails\/new/)!=-1 || path.search(/users\/[0-9]+\/trails$/) !=-1){

      L.mapbox.accessToken =
        'pk.eyJ1IjoidGhhbm9zYmVsIiwiYSI6IjRmMGU0NWNjZmM0ZTNiYzY2ZjE5ZDc2MDQ3ZTg4ZWQwIn0.oLX-8wI3088OqyhYC-c4_A';
       map = L.mapbox.map('map', 'thanosbel.lmm46d4d');
       var drawnLayers = undefined;
       drawnLayers = L.featureGroup().addTo(map);


       if(sessionStorage.length>0){
         var geoJsonLayer = L.geoJson(undefined , {
           pointToLayer: function (feature , latlng){
             return  L.marker( latlng, {
                             draggable:false,
                             title: 'Start Point',
                             icon: L.mapbox.marker.icon({
                              'marker-size': 'medium',
                              'marker-symbol': feature.properties.markerSymbol,
                              'marker-color': feature.properties.markerColor
                             }),
                             zIndexOffset: 100
                    });


           }
         });

         var origin = JSON.parse(sessionStorage.originMarker);
         var destination = JSON.parse(sessionStorage.destinationMarker);
         var trailPath = JSON.parse(sessionStorage.trailPath);

         geoJsonLayer.addData(destination);
         geoJsonLayer.addData(origin);
         geoJsonLayer.addData(trailPath);
         drawnLayers.addLayer(geoJsonLayer);
         map.fitBounds(drawnLayers.getBounds());

         $( "#trail-info ul li" ).eq(0).text($("#trail_start_point:hidden").val());
         $( "#trail-info ul li" ).eq(1).text($("#trail_end_point:hidden").val());
         $( "#trail-info ul li" ).eq(2).text($("#trail_length:hidden").val());



       }
      var geocoder =  L.Control.Geocoder.nominatim();


      $("input[type=file]").on('change',function(e){
        var selectedFile = this.files[0];
        var reader = new FileReader();
        reader.onload = function(e){
          var parser = new DOMParser();
          var doc = parser.parseFromString(e.target.result, "application/xml");

          var trackPath = toGeoJSON.gpx(doc);

          previewTrackPath(trackPath, drawnLayers, geocoder);


        }
        reader.readAsText(selectedFile);
      });


  }

});


function previewTrackPath(trackPath , drawnLayers , geocoder){
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
  var coordinates = coordinates.map(function(coordinate){
              return L.latLng([coordinate[1],coordinate[0]]);
          });



  var trailPath = L.polyline(coordinates, polyline_options);
  var length = trailPath.length_in_meters();

  sessionStorage.trailPath = JSON.stringify(trailPath.toGeoJSON());

  drawnLayers.addLayer(trailPath);
  $(window).scrollTop(0)

  var originMarker =  L.marker( coordinates[0], {
                             draggable:false,
                             title: 'Start Point',
                             icon: L.mapbox.marker.icon({
                              'marker-size': 'medium',
                              'marker-symbol': 's',
                              'marker-color': '#00E263'
                             }),
                             zIndexOffset: 100
                    });

  var destinationMarker =  L.marker( coordinates[coordinates.length-1], {
                             draggable:false,
                             title: 'Finish Point',
                             icon: L.mapbox.marker.icon({
                              'marker-size': 'medium',
                              'marker-symbol': 'f',
                              'marker-color': '#D63333'
                             }),
                             zIndexOffset: 100
                    });


  drawnLayers.addLayer(originMarker);
  drawnLayers.addLayer(destinationMarker);

  var originMarkerGeoJSON = originMarker.toGeoJSON();
  originMarkerGeoJSON.properties.name = 'origin';
  originMarkerGeoJSON.properties.markerSymbol= 's';
  originMarkerGeoJSON.properties.markerColor = '#00E263'

  sessionStorage.originMarker = JSON.stringify(originMarkerGeoJSON);


  var destinationMarkerGeoJSON = destinationMarker.toGeoJSON();
  destinationMarkerGeoJSON.properties.name = 'destination';
  destinationMarkerGeoJSON.properties.markerSymbol= 'f';
  destinationMarkerGeoJSON.properties.markerColor = '#D63333';

  sessionStorage.destinationMarker = JSON.stringify(destinationMarkerGeoJSON);

  map.fitBounds(drawnLayers.getBounds());

  var origin = undefined;
  geocoder.reverse(originMarker.getLatLng(), map.options.crs.scale(map.getZoom()), function(results) {

  var r = results[0].name.split(",");

    origin = r.slice(0,3) + r.pop();

     var $li =$( "#trail-info ul li" ).eq(0);
     $li.text("Start Point: ");
     $li.text(" " + $li.text() + origin);
     $("#trail_start_point:hidden").val($li.text());
  })




  var destination = undefined;
  geocoder.reverse(destinationMarker.getLatLng(), map.options.crs.scale(map.getZoom()), function(results) {

   var r = results[0].name.split(",");
    destination =  r.slice(0,3) + r.pop();
     var $li =$( "#trail-info ul li" ).eq(1);
     $li.text("Finish Point: ");
     $li.text($li.text() + destination);
     $("#trail_end_point:hidden").val($li.text());

     $li = $("#trail-info ul li").eq(2);
     $li.text("Trail length: ");
     $li.text("  "+$li.text() + length + ' Kilometers');
     $("#trail_length:hidden").val(length);

  });



 // console.log(destination);
//  $("#trail-info ul li").get(2).text(destination);

}


L.Polyline.prototype.length_in_meters = function(){
     var total_length_in_meters =0;
     var newPoint = undefined;
     var coordinates = this._latlngs;


    for( var i =0, l = coordinates.length; i<l-1; i++){
       newPoint = coordinates[i];
       total_length_in_meters += newPoint.distanceTo(coordinates[i+1]);
     }

    return ((total_length_in_meters)/1000.0).toFixed(2);

}


