$( document ).on("ready, page:change", function() {
  var path = window.location.pathname;
  if(path.search(/trails\/new/) !=-1) {sessionStorage.clear()}
  if(path.search(/trails\/new/)!=-1 || path.search(/users\/[0-9]+\/trails$/) !=-1){
    var fileList = [];
    $(".fileupload-buttonbar :button").attr("disabled", true);
    $("#raty").raty({score: 1});

    L.mapbox.accessToken =
      'pk.eyJ1IjoidGhhbm9zYmVsIiwiYSI6IjRmMGU0NWNjZmM0ZTNiYzY2ZjE5ZDc2MDQ3ZTg4ZWQwIn0.oLX-8wI3088OqyhYC-c4_A';
    map = L.mapbox.map('map', 'thanosbel.lmm46d4d');
    drawnLayers = undefined;
    drawnLayers = L.featureGroup().addTo(map);
    imagesLayer =  L.mapbox.featureLayer().addTo(map);

    imagesLayer.on('layeradd', function(e) {
      var marker = e.layer,
        feature = marker.feature;

      // Create custom popup content
      var popupContent =  '<a target="_blank" class="popup" href="#">' +
        '<img src="' + feature.properties.url + '" />' +
        '</a>'+
        '<h5>' + feature.properties.name + '</h5>';


      marker.bindPopup(popupContent,{
        closeButton: false,
        minWidth: 320,
      });
    });
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



    var trail_id = undefined;
    var unsubmittedPhotos =[]
    var filesRemaining =0;
    var redirect_url= undefined;
    var trailUploaded = false;

    var trailGeometriesFiles = 0;


    $.blueimp.fileupload.prototype.options.processQueue.push(
      {
        action: 'customValidate',
        acceptFileTypes: '@'
      },

      {
        action: 'previewGeometryFile'
      },

      {
        action: 'getImagePosition'
      },
      {
        action: 'previewImageOnMap'
      }



    );
    $.widget('blueimp.fileupload', $.blueimp.fileupload, {
      processActions: {


        getImagePosition: function(data,options){
          if(data.exif !== undefined){
            if(data.exif.get("GPSLongitude")  !==  undefined){

              var lon = degreesToDecimal(data.exif.get("GPSLongitude"), data.exif.get("GPSLongitudeRef"));
              var lat = degreesToDecimal(data.exif.get("GPSLatitude"), data.exif.get("GPSLatitudeRef"));
              data.lonLat = [lon,lat];
            }
          }
          return data;
        },

        previewImageOnMap: function(data,options){
          if(typeof data.lonLat !== 'undefined'){
            var imgUrl = window.URL.createObjectURL(data.files[data.index]);

            var imgGeoJson = [{
              type: 'Feature',
              "geometry": {
                type: "Point" , "coordinates": data.lonLat
              },
              "properties": {
                "image" : data.files[data.index].name,
                "url" : imgUrl,
                "marker-color": "#ff8888",
                "marker-size" : "small",
                "marker-symbol" : "camera",
                "name" : data.files[data.index].name

              }
            }]


            imagesLayer.setGeoJSON(imgGeoJson);
            data.files[data.index].lonLat = data.lonLat;
            data.files[data.index].layerId =
              imagesLayer.getLayers()[imagesLayer.getLayers().length-1]._leaflet_id;
          }
          return data;
        },


        customValidate: function(data, options){

          if (options.disabled) {
            return data;
          }
          var dfd = $.Deferred(),
            file = data.files[data.index];

          if(data.paramName[0] == "trail[trailgeometry]"){

            if(!file.type.match(/(\.|\/)(json|gpx)$/i) && !file.name.match(/(.|\/)(gpx)$/i)){
              file.error = 'Invalid geometry file type. Only gpx and geojson files are supported';
              dfd.rejectWith(this, [data]);

            }else{
              dfd.resolveWith(this, [data]);
            }

          }else if(data.paramName[0] !== "trail[trailgeometry]"){
            if(!file.type.match(/(\.|\/)(gif|jpe?g|png)$/i)){
              file.error = 'Invalid file type '+file.name +
                'is not a supported image file. Only gif,jpeg/jpg,png are supported';
              dfd.rejectWith(this, [data]);

            }else{
              dfd.resolveWith(this, [data]);
            }


          }

          return dfd.promise();
        },
        previewGeometryFile: function(data,options){

          var dfd = $.Deferred(),
            file = data.files[data.index];

          if($("#trail_name").val() ==''){
            $("#trail_name").val(file.name);
          }



          if(data.paramName[0] == "trail[trailgeometry]"){

            var reader = new FileReader();
            reader.onload = function(e){
              if(file.name.match(/(.|\/)(gpx|kml)$/i)){
                var parser = new DOMParser();
                var content_type = "application/xml"
                var doc = parser.parseFromString(e.target.result, content_type);
                if(file.name.match(/.gpx/)){

                  trackPath = toGeoJSON.gpx(doc);

                }else{
                  trackPath = toGeoJSON.kml(doc);
                }
              }else{
                trackPath = JSON.parse(e.target.result);
              }

              var trailPathId = previewTrackPath(trackPath, drawnLayers, geocoder);
              data.files[data.index].layerId = trailPathId;

            }
            reader.readAsText(file);
          }
          $(".fileupload-buttonbar :button").removeAttr('disabled');

          dfd.resolveWith(this, [data]);

          return dfd.promise();
        }

      }
    })

    $('#fileupload')
    .on('fileuploadprocessfail', function (e, data) {
      //if there is a validation error fill out error form
      data.context.each(function (index){
        var error = data.files[index].error;
        if(error){
          $(this).find('.error').text(error);
        }
      })
    })



    $('#fileupload').fileupload({
      uploadTemplateId:"template-upload",
      downloadTemplateId: null,
      singleFileUploads: false,
      autoUpload: false,
      sequentialUploads: true,
      maxNumberOfFiles:7,
      maxFileSize: 50000000,
      disableImageReferencesDeletion: true
    });


    $('#fileupload').bind('fileuploadadd' , function(e,data){
      if(data.paramName[0] == "trail[trailgeometry]"){
        trailGeometriesFiles++;
        if(trailGeometriesFiles>1){
          $("#fileupload .files .cancel")[0].click();
        }
      }
    })




    $('#fileupload').bind('fileuploadfail', function(e,data){
      if(data.paramName[0] == "trail[trailgeometry]"){
        $(".fileupload-buttonbar :button").attr("disabled", true);
        drawnLayers.clearLayers();
        trailGeometriesFiles--;
        $("#trail_name").val('');
      }else{
        for(var i =0 , length= data.files.length; i<length; i++){
          if(typeof data.files[i].layerId !== 'undefined'){
            imagesLayer.removeLayer(data.files[i].layerId);
          }
        }
      }
    })


    $('#fileupload').bind('fileuploadsubmit' , function(e,data){

      if(!trailUploaded && data.paramName[0] !=="trail[trailgeometry]"){
        unsubmittedPhotos.push(data);
        filesRemaining++;
        console.log(filesRemaining);
        return false;
      } else if (trailUploaded && data.paramName[0] !=="trail[trailgeometry]") {
      }


    }).bind('fileuploaddone',function(e,data){
      console.log(filesRemaining);
      console.log(data.result);


      if( filesRemaining >0 ){
        if(data.result.type !== undefined){
          console.log(unsubmittedPhotos);


          trailUploaded = true;
          for(var i= 0; i<unsubmittedPhotos.length ; i++){

            var locations = [];


            unsubmittedPhotos[i].formData = {hidden_trail_id: data.result.id}
            for(var j=0; j< unsubmittedPhotos[i].files.length; j++){

              locations.push(unsubmittedPhotos[i].files[j].lonLat);

            }
            unsubmittedPhotos[i].formData = {hidden_trail_id: data.result.id, locations: JSON.stringify(locations)}
            unsubmittedPhotos[i].submit();


          }
        }else {
          filesRemaining--;
        }
      }
      console.log(filesRemaining);
      if (filesRemaining == 0){

        if(data.result.redirect_url !== undefined){

          $(location).attr('href',data.result.redirect_url);

        }

      }

    })
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

  var trailPathId = trailPath._leaflet_id;


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
    $div.text("End Point" + origin);
    $("#trail_start_point:hidden").val(origin);
  })




  var destination = undefined;
  geocoder.reverse(destinationMarker.getLatLng(), map.options.crs.scale(map.getZoom()), function(results) {

    var r = results[0].name.split(",");
    destination =  r.slice(0,3) + r.pop();
    var $div =$( "#routes ul li .mapbox-directions-route-details" ).eq(1);
    $div.text("Start Point" + destination);
    $("#trail_end_point:hidden").val(destination);

    $div = $("#routes ul li .mapbox-directions-route-details").eq(2);
    $div.text("Length" + length + ' Kilometers');
    $("#routes ul").show();

    $("#trail_length:hidden").val(length);

  });


  return trailPathId ;


}


function degreesToDecimal( GpsCoordinateInDegrees , GpsCoordinateRef){

  var dd = GpsCoordinateInDegrees.reduce(function( previousValue , currentValue,index,array){
    return previousValue + currentValue/Math.pow(60,index);
  }, 0);

  dd =  (GpsCoordinateRef == 'S' || GpsCoordinateRef == 'W') ? dd * -1 : dd;
  return dd;



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




