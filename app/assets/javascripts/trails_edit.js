$( document ).on("ready", function() {
  var path = window.location.pathname;
  if(path.search(/trails\/[0-9]+\/edit$/)!=-1){
    var photosIndexUrl = window.location.origin + '/trails/' +
      $('#fileupload').prop('action').split(/\/trails\//)[1]+
      '/photos';
    drawnLayers = undefined;
    markersGroup =  L.featureGroup();

    trailShow();





    $.blueimp.fileupload.prototype.options.processQueue.push(
      {
        action: 'customValidate',
        acceptFileTypes: '@'
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

            var imageLayer = L.mapbox.featureLayer();
            imageLayer.on('layeradd', function(e) {
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
              markersGroup.addLayer(imageLayer);


            });



            imageLayer.setGeoJSON(imgGeoJson);

            data.files[data.index].lonLat = data.lonLat;
            data.files[data.index].layerId =
              markersGroup.getLayers()[markersGroup.getLayers().length-1]._leaflet_id;

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
        }
      }
    });
    $('#fileupload').fileupload({
      singleFileUploads:false,
      autoUpload: false,
      sequentialUploads: true,
      maxNumberOfFiles:7,
      maxFileSize: 50000000,
      disableImageReferencesDeletion: true

    });
    var filesToBeUploaded = 0;
    $.getJSON(photosIndexUrl , function (files) {
      fu = $('#fileupload').data('blueimpFileupload')
      //template;
      //fu._adjustMaxNumberOfFiles(-files.length);
      //$('#fileupload').fileupload('option', 'maxNumberOfFiles');
      template = fu._renderDownload(files)
      .appendTo($('#fileupload .files'));
      // Force reflow:
      fu._reflow = fu._transition && template.length &&
        template[0].offsetWidth;
      template.addClass('in');
      $('#loading').remove();
    });

    $('#fileupload')
    .bind('fileuploadprocessfail', function (e, data) {
      //if there is a validation error fill out error form
      data.context.each(function (index){
        var error = data.files[index].error;
        if(error){
          $(this).find('.error').text(error);
        }
      })
    })


    .bind('fileuploadfail', function(e,data){

        for(var i =0 , length= data.files.length; i<length; i++){
          if(typeof data.files[i].layerId !== 'undefined'){
            markersGroup.removeLayer(data.files[i].layerId);
          }
        }
    }).bind('fileuploaddestroy', function(e,data){

      var photoId = parseInt(data.url.split(/\/photos\//)[1]);

        drawnLayers.photos.setFilter(function(e){
        e.id === photoId
      })
      //set maxFilesNumber
      //var maxNumberOfFiles = $("#fileupload").fileupload('option', 'maxNumberOfFiles')
      //$('#fileupload').fileupload('option', 'maxNumberOfFiles', ++maxNumberOfFiles);

    }).bind('fileuploadprocessdone', function(e,data){
      console.log("Breakpoint from processfinish");

    }).bind('fileuploadadded', function(e,data){
        }).bind('fileuploadsubmit',function(e,data){
      console.log("Breakpoint from submit");
        var locations = [];
      for(var i=0; i<data.files.length; i++){
        console.log(data.files[i]);
        locations.push(data.files[i].lonLat);
      }
      $("#geolocations").val(JSON.stringify(locations))

      filesToBeUploaded++;
    }).bind('fileuploaddone', function(e,data){
      filesToBeUploaded--;
      //var maxNumberOfFiles = $("#fileupload").fileupload('option', maxNumberOfFiles);
      //$("#fileupload").fileupload('option','maxNumberOfFiles', maxNumberOfFiles--);
      if(filesToBeUploaded == 0) {
        $(location).attr('href',data.result.redirect_url);
      }
    });
  }


  function trailShow(){
    L.mapbox.accessToken =
      'pk.eyJ1IjoidGhhbm9zYmVsIiwiYSI6IjRmMGU0NWNjZmM0ZTNiYzY2ZjE5ZDc2MDQ3ZTg4ZWQwIn0.oLX-8wI3088OqyhYC-c4_A';
    map = L.mapbox.map('map', 'thanosbel.lmm46d4d');

    var url = window.track_id.toString();

    var polyline_options = {
      color: '#D63333'
    };
    // As with any other AJAX request, this technique is subject to the Same Origin Policy:
    // http://en.wikipedia.org/wiki/Same_origin_policy the server delivering the request should support CORS.
    var infoPage = window.location.href.split(/edit$/);
    $.ajax({
      url: window.location.href.split(/edit$/)[0],
      dataType: 'json',
    }).done(processGeoJsonData)

    markersGroup.addTo(map);
  }


  function processGeoJsonData(data){

    var layers = {
      photos: L.mapbox.featureLayer().addTo(map),
      trail: L.mapbox.featureLayer().addTo(map)
    };
    console.log(data.photos);



    layers.photos.on('layeradd', function(e) {
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

    layers.photos.setGeoJSON(data.photos);
    layers.trail.setGeoJSON(data.trail);
    drawnLayers = layers;
  }
})
