$( document ).on("ready, page:change", function() {
 // var path = (typeof window.method_name == 'undefined') ? window.location.pathname : window.method_name
  var path = window.location.pathname;
  if(path.search(/trails\/new/)!=-1){

      L.mapbox.accessToken =
        'pk.eyJ1IjoidGhhbm9zYmVsIiwiYSI6IjRmMGU0NWNjZmM0ZTNiYzY2ZjE5ZDc2MDQ3ZTg4ZWQwIn0.oLX-8wI3088OqyhYC-c4_A';
       map = L.mapbox.map('map', 'thanosbel.lmm46d4d');
      var drawnLayers = L.featureGroup().addTo(map);
      var geocoder =  L.Control.Geocoder.nominatim()


      $("input[type=file]").on('change',function(e){
        var selectedFile = this.files[0];
        var reader = new FileReader();
        reader.onload = function(e){
          var parser = new DOMParser();
          var doc = parser.parseFromString(e.target.result, "application/xml");

          trackPath = toGeoJSON.gpx(doc);

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



  var myPolyline = L.polyline(coordinates, polyline_options);
  var length = myPolyline.length_in_meters();
  drawnLayers.addLayer(myPolyline);

  firstMarker =  L.marker( coordinates[0], {
                             draggable:false,
                             title: 'Start Point',
                             icon: L.mapbox.marker.icon({
                              'marker-size': 'medium',
                              'marker-symbol': 's',
                              'marker-color': '#00E263'
                             }),
                             zIndexOffset: 100
                    });

  lastMarker =  L.marker( coordinates[coordinates.length-1], {
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

   origin = 0;
  geocoder.reverse(firstMarker.getLatLng(), map.options.crs.scale(map.getZoom()), function(results) {

  var r = results[0].name.split(",");

    origin = r.slice(0,3) + r.pop();

    console.log(r.name);
     var $li =$( "#trail-info ul li" ).eq(0);
     $li.text("Start Point: ");
     $li.text(" " + $li.text() + origin);
     $("#trail_start_point:hidden").val($li.text());
  })


  //$("#trail-info ul li").get(1).text(origin);


  var destination;
  geocoder.reverse(lastMarker.getLatLng(), map.options.crs.scale(map.getZoom()), function(results) {
console.log(results[0].html);

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


