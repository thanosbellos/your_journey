$( document).ready(function() {
  var path = window.location.pathname;
  if((path.search(/\/search$/)!== -1)){

    zoomControl = pointMap.zoomControl;
    var directions = L.mapbox.directions({units: 'metric'});
    var directionsLayer = L.mapbox.directions.layer(directions);
    var directionsInputControl = L.mapbox.directions.inputControl('inputs', directions).addTo(pointMap);
    var directionsErrorsControl = L.mapbox.directions.errorsControl('errors', directions).addTo(pointMap);
    var directionsRoutesControl = L.mapbox.directions.routesControl('routes', directions).addTo(pointMap);




     $('#directions').hide();
     $('#inputs').hide();
     $('#errors').hide();
     $('#routes').hide();
     $('#instructions').hide();



     $('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
         newTabId = ($(e.target).attr("aria-controls"));
         oldTabId = ($(e.relatedTarget).attr("aria-controls"));



        if(newTabId =="search-with-destination"){


          directionsLayer.addTo(pointMap);
          pointMap.removeLayer(drawnFeatureGroup);

          $('#directions').show();
          $('#inputs').show();
          $('#errors').show();
          $('#routes').show();
          $('#instructions').show();


          $('.leaflet-top').hide();


        }else {
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
