$( document).ready(function() {
  var path = window.location.pathname;
  if((path.search(/\/search$/)!= -1)){

    zoomControl = pointMap.zoomControl;
    //var directions = L.mapbox.directions();
    //var directionsLayer = L.mapbox.directions.layer(directions).addTo(pointMap);

    //var directionsInputControl = L.mapbox.directions.inputControl('inputs', directions).addTo(pointMap);
    //var directionsErrorsControl = L.mapbox.directions.errorsControl('errors', directions).addTo(pointMap);
    //var directionsRoutesControl = L.mapbox.directions.routesControl('routes', directions).addTo(pointMap);
    //var directionsInstructionsControl = L.mapbox.directions.instructionsControl('instructions', directions).addTo(pointMap);
    $('#directions').hide();
    $('#inputs').hide();
    $('#errors').hide();
    $('#routes').hide();
    $('#instructions').hide();
    $('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
      newTabId = ($(e.target).attr("aria-controls"));
      oldTabId = ($(e.relatedTarget).attr("aria-controls"));



      if(newTabId =="search-with-destination"){



      }else {


     }
  });
  }
})
