$( document ).on("ready, page:change", function() {
  var path = window.location.pathname;
  if(path.search(/trails\/new/) !=-1) {sessionStorage.clear()}
  if(path.search(/trails\/new/)!=-1 || path.search(/users\/[0-9]+\/trails$/) !=-1){
    var fileList = [];
    $(".fileupload-buttonbar :button").attr("disabled", true);

    var trail_id = undefined;
    var fileList = []
    var photos_data =[]
    var e_table = [];
    var filesRemaining =0;
    var redirect_url= undefined;
    $(function(){
      $('#fileupload').fileupload({
        downloadTemplateId: null,
        singleFileUploads: false,
        autoUpload: false,
        sequentialUploads: true
      }).bind('fileuploadadd',function(e,data){

        filesRemaining++;

        if(data.paramName[0] !== "trail[trailgeometry]"){

          fileList.push(this);
          photos_data.push(data);
          e_table.push(e);
        }

        data.context = $("#submit-button")

        .click(function(){
          //
          if(data.paramName[0] =="trail[trailgeometry]"){
            data.submit();
          }
        })
      }).bind('fileuploaddone', function(e,data){
        console.log(filesRemaining);
        console.log(data.result);
        filesRemaining--;
        if(data.result.type !== undefined && filesRemaining !==0){
          for(var i=0, length=photos_data.length; i<length; i++){
            photos_data[i].formData = {hidden_trail_id: data.result.id};
            photos_data[i].submit();
          }
        }else if (data.result.redirect_url !== undefined && filesRemaining ==0) {
          $(location).attr('href',data.result.redirect_url);
        }
      })
    })




    $("#raty").raty();

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

      //   $("#routes ul li .mapbox-directions-routes-details").eq(0).text($("#trail_name").val());
      $( "#routes ul li .mapbox-directions-routes-details" ).eq(1).text($("#trail_start_point:hidden").val());
      $( "#routes ul li  .mapbox-directions-routes-details" ).eq(2).text($("#trail_end_point:hidden").val());
      $( "#routes ul li  .mapbox-directions-routes-details" ).eq(3).text($("#trail_length:hidden").val());



    }
    var geocoder =  L.Control.Geocoder.nominatim();


    $("#trail_trailgeometry").on('change',function(e){
      var selectedFile = this.files[0];

      $(".fileupload-buttonbar :button").removeAttr('disabled');

      var fileExtension = selectedFile.name.split('.').pop();
      var reader = new FileReader();
      reader.onload = function(e){
        if(fileExtension.match(/gpx|kml/)){

          var parser = new DOMParser();
          var content_type = "application/xml"
          doc = parser.parseFromString(e.target.result, content_type);

          if (fileExtension == "gpx"){
            trackPath = toGeoJSON.gpx(doc);
          }else{
            trackPath = toGeoJSON.kml(doc);
          }
          var routes = [];

          for(var i=0, length= trackPath.features.length; i<length; i++){
            if (trackPath.features[i].geometry.type =="LineString"){
              routes.push(trackPath.features[i]);
            }
          }
          trackPath.features = routes;

        }else{
          trackPath = JSON.parse(e.target.result);
        }


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
  window.scrollTo(0, 0);


  var $div =$("#routes ul li .mapbox-directions-route-summary").eq(0);
  if ($("#trail_name").val() !=''){
    $div.text( $("#trail_name").val());
  }

  var origin = undefined;
  geocoder.reverse(originMarker.getLatLng(), map.options.crs.scale(map.getZoom()), function(results) {

    var r = results[0].name.split(",");

    origin = r.slice(0,3) + r.pop();

    var $div =$( "#routes ul li .mapbox-directions-route-details" ).eq(0);
    $div.text($div.text()+ origin);
    $("#trail_start_point:hidden").val(origin);
  })




  var destination = undefined;
  geocoder.reverse(destinationMarker.getLatLng(), map.options.crs.scale(map.getZoom()), function(results) {

    var r = results[0].name.split(",");
    destination =  r.slice(0,3) + r.pop();
    var $div =$( "#routes ul li .mapbox-directions-route-details" ).eq(1);
    $div.text($div.text() + destination);
    $("#trail_end_point:hidden").val(destination);

    $div = $("#routes ul li .mapbox-directions-route-details").eq(2);
    $div.text($div.text() + length + ' Kilometers');
    $("#routes ul").show();

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



