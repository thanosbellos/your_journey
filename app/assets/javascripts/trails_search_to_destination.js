$( document).ready(function() {
  var path = window.location.pathname;


  if((path.search(/\/trail_searches\/new$/)!== -1)){

    //clear old fields on reload
    clearFields();
    var pointMap = initializeMap();
    drawnFeatureGroup = L.mapbox.featureLayer().addTo(pointMap);

     tracksNearPoint =  L.geoJson(undefined , {pointToLayer: L.mapbox.marker.style});
     tracksLikeSampleRoute = L.geoJson(undefined , {pointToLayer: L.mapbox.marker.style});



    if($(window).width() >1050){

     drawControl = addDrawControl(pointMap , drawnFeatureGroup);

    }

    geocodeControl = addGeocodeControl(pointMap);
    geolocationControl = L.control.accurateLocateControl({position: 'topright',featureGroup: drawnFeatureGroup,
                                                          strings: {title: "Show me where I am"}
                                                        });

    geolocationControl.addTo(pointMap);
    var zoomControl = pointMap.zoomControl;
    var directions = L.mapbox.directions({units: 'metric'});
    var directionsLayer = L.mapbox.directions.layer(directions);
    var directionsInputControl = L.mapbox.directions.inputControl('inputs', directions).addTo(pointMap);
    var directionsErrorsControl = L.mapbox.directions.errorsControl('errors', directions).addTo(pointMap);
    var directionsRoutesControl = L.mapbox.directions.routesControl('routes', directions).addTo(pointMap);



    //listen to events on pages various changes
    $("#radius").change(function(){
      var radius = $("#radius").val();
      drawnFeatureGroup.eachLayer(function(layer){
       if(typeof layer._mRadius !== 'undefined'){
          layer.setRadius(radius);
       }
     });
    });

    $("#trail-search-form").on("ajax:before", function(e){
        var activeTabId = $("div.active").attr("id");
        var results = (activeTabId =="search-near-point") ? tracksNearPoint : tracksLikeSampleRoute
        pointMap.removeLayer(results);
        results.eachLayer(function(layer){
          drawnFeatureGroup.removeLayer(layer);
        });
        results.clearLayers();
    });


    $("#trail-search-form").on("ajax:success" , function(e,data,status, xhr){

      if(typeof data.message == 'undefined'){

        var activeTabId = $("div.active").attr("id");
        var results = (activeTabId =="search-near-point") ? tracksNearPoint : tracksLikeSampleRoute;

        results.addData(data);
        results.addTo(pointMap);
        results.eachLayer(function(layer){
           drawnFeatureGroup.addLayer(layer);
        });

        $("#results").append(xhr.responseText);
      } else {
        $("#results").append(data.message)
        //append to error section of mapbox-dir pane
      }
    });




    // what to hide and show on each tab

     directionsDivs = ["#directions", "#inputs" , "#errors",
       "#routes", "#instructions" , 'label[for=destination] , input#destination'];
     directionsDivs.forEach( function(value){
       $(value).hide();
     });




    $('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {

        newTabId = ($(e.target).attr("aria-controls"));
        oldTabId = ($(e.relatedTarget).attr("aria-controls"));

        if(newTabId == 'search-with-destination'){

         $('.leaflet-top').hide();

          directionsDivs.forEach(function(value){
            $(value).show();
          });

          pointMap.removeLayer(drawnFeatureGroup);
          directionsLayer.addTo(pointMap);

        }else{

          pointMap.removeLayer(directionsLayer);

          drawnFeatureGroup.removeLayer(tracksLikeSampleRoute);
          drawnFeatureGroup.addLayer(tracksNearPoint);
          //userCircleMarker should be added
          pointMap.addLayer(drawnFeatureGroup);

          $('.leaflet-top').show();
          directionsDivs.forEach( function(value){
            $(value).hide();
          });

          //tab = search near a point
          //hide mapbox-directions controls ,inputs and show info areas
          //disable the mapbox directions plugin temporary

          //add previous userCircleMarker
          //set orign_lnglat and origin_name to previous values
          //restore old search values

        }
    })
  }
});
