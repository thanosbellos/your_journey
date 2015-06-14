$( document).ready(function() {
  var path = window.location.pathname;
  if((path.search(/\/trail_searches\/new$/)!== -1)){

    zoomControl = pointMap.zoomControl;
    directions = L.mapbox.directions({units: 'metric'});
    directionsLayer = L.mapbox.directions.layer(directions);
    var directionsInputControl = L.mapbox.directions.inputControl('inputs', directions).addTo(pointMap);
    var directionsErrorsControl = L.mapbox.directions.errorsControl('errors', directions).addTo(pointMap);
    var directionsRoutesControl = L.mapbox.directions.routesControl('routes', directions).addTo(pointMap);
    var locationName;
    x = 0;
    $("#origin").change( function(){
      locationName = $("#origin").val();
    })

    directions.on('load' , function(e){
      console.log(e);

      var origin = e.origin;
      var destination = e.destination;
      var route = e.routes[0];
      var encodedPolyline = polyline.encode(route.geometry.coordinates);
      $("#origin_lnglat:hidden").val([origin.geometry.coordinates[0] , origin.geometry.coordinates[1]]);
      $("#destination_lnglat:hidden").val([destination.geometry.coordinates[0], destination.geometry.coordinates[1]]);
      $("#sample_route:hidden").val(encodedPolyline);

      $("#search-button").click();


    });

     $('#directions').hide();
     $('#inputs').hide();
     $('#errors').hide();
     $('#routes').hide();
     $('#instructions').hide();
     $('label[for=destination] , input#destination').hide();



     $('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {

         newTabId = ($(e.target).attr("aria-controls"));
         oldTabId = ($(e.relatedTarget).attr("aria-controls"));


        if(newTabId =="search-with-destination"){


          directionsLayer.addTo(pointMap);
          pointMap.removeLayer(drawnFeatureGroup);
          $('label[for=destination] , input#destination').show();
          $('#directions').show();
          $('#inputs').show();
          $('#errors').show();
          $('#routes').show();
          $('#instructions').show();
          $('label[for=origin] , input#origin').hide();


          $('.leaflet-top').hide();


        }else {
          $('#location').val(locationName);
          drawnFeatureGroup.addTo(pointMap);
          pointMap.removeLayer(directionsLayer);
          $('#directions').hide();
          $('#inputs').hide();
          $('#errors').hide();
          $('#routes').hide();
          $('#instructions').hide();

          $('.leaflet-top').show();
        }
    });





  }
})


function hideDivs(divsObject){
  for (var key in divsObject){

  }
}
