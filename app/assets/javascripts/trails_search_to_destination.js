$( document).on("ready, page:change" , function() {
  var path = window.location.pathname;


  if((path.search(/\/trail_searches\/new$/)!== -1)){

    //clear old fields on reload
    clearFields();
    pointMap = initializeMap();
    drawnFeatureGroup = L.featureGroup().addTo(pointMap);

    userMarker = L.featureGroup().addTo(pointMap);

    tracksNearPoint =  L.geoJson(undefined , {pointToLayer: L.mapbox.marker.style});
    tracksLikeSampleRoute = L.geoJson(undefined , {pointToLayer: L.mapbox.marker.style});



    if($(window).width() >1050){

     drawControl = addDrawControl(pointMap , drawnFeatureGroup , userMarker);

    }

    geolocationControl = L.control.accurateLocateControl({position: 'topright',
                                                         featureGroup: drawnFeatureGroup,
                                                         userMarker: userMarker,
                                                          strings: {title: "Show me where I am"}
                                                        });

    geolocationControl.addTo(pointMap);
    geocodeControl = L.Control.geocoder().addTo(pointMap);
    geocodeControl.markGeocode = markerFromGeocode








    var zoomControl = pointMap.zoomControl;
    directions = L.mapbox.directions({units: 'metric'});
    var directionsLayer = L.mapbox.directions.layer(directions);
    var directionsInputControl = L.mapbox.directions.inputControl('inputs', directions).addTo(pointMap);
    var directionsErrorsControl = L.mapbox.directions.errorsControl('errors', directions).addTo(pointMap);
    var directionsRoutesControl = L.mapbox.directions.routesControl('routes', directions).addTo(pointMap);

    directions.on('load' , function(e){


      var origin = e.origin;
      var destination = e.destination;
      var route = e.routes[0];
      var encodedPolyline = polyline.encode(route.geometry.coordinates);

      var sampleRoute = $("#sample_route");






     sampleRoute.val(encodedPolyline);
     sampleRoute.data("prev-sample-route-with-destination" , sampleRoute.val());

      $("#search-button").click();


    });

    directions.on('origin', function(e){
      var originLonLat = $("#origin_lnglat:hidden");

      if(typeof e.origin !=='undefined'){
        originLonLat.val([e.origin.geometry.coordinates[0] ,e.origin.geometry.coordinates[1]]);
      } else{

        originLonLat.val('');


      }

      originLonLat.data("prev-origin-lnglat-with-destination" , originLonLat.val());
    });

    directions.on('destination', function(e){
       var destinationLonLat = $("#destination_lnglat:hidden");

      if(typeof e.destination !=='undefined'){
        destinationLonLat.val([e.destination.geometry.coordinates[0] ,e.destination.geometry.coordinates[1]]);
      } else{

        destinationLonLat.val('');

      }
      console.log(destinationLonLat.val());
      destinationLonLat.data("prev-destination-lnglat-with-destination" , destinationLonLat.val());

    })


    //listen to events on pages various changes
    $("#radius").change(function(){
      var radius = $("#radius").val();
      userMarker.eachLayer(function(layer){
       if(typeof layer._mRadius !== 'undefined'){
          layer.setRadius(radius);
       }
     });
    });

    $("#trail-search-form").on("ajax:beforeSend", function(e,xhr){
     xhr.setRequestHeader('X-CSRF-Token', $('meta[name="csrf-token"]').attr('content'))

        var activeTabId = $("div.tab-pane.active").attr("id");
        var originLngLat = $("#origin_lnglat:hidden");
        var destinationLngLat = $("#destination_lnglat:hidden");
        var route = $("#sample_route:hidden");


        var results = (activeTabId =="search-near-point") ? tracksNearPoint : tracksLikeSampleRoute
        results.eachLayer(function(layer){
          drawnFeatureGroup.removeLayer(layer);
        });
        results.clearLayers();

        if((originLngLat.val()=='') || ((activeTabId == 'search-with-destination') && ((destinationLngLat.val()=='' || route.val()=='')))){
          return false;
        }
    });


    $("#trail-search-form").on("ajax:success" , function(e,data,status, xhr){

      if(typeof data.message == 'undefined'){

        var activeTabId = $("div.tab-pane.active").attr("id");
        console.log(activeTabId);
        var results = (activeTabId =="search-near-point") ? tracksNearPoint : tracksLikeSampleRoute;


        results.addData(data);
        results.eachLayer(function(layer){
           drawnFeatureGroup.addLayer(layer);
        });

        //function to add info on our suggestions div
        //
        addSuggestionsInfo(data);

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
        drawnFeatureGroup.clearLayers();
        clearFields();

        if(newTabId == 'search-with-destination'){
          directionsLayer.addTo(pointMap);

           var originLonLat = $("#origin_lnglat:hidden");
           var destinationLonLat =$("#destination_lnglat:hidden");
           var sampleRoute = $("#sample_route");




          originLonLat.val(originLonLat.data("prev-origin-lnglat-with-destination"));
          destinationLonLat.val(destinationLonLat.data("prev-destination-lnglat-with-destination"));
          sampleRoute.val(sampleRoute.data("prev-sample-route-with-destination"));

          if(originLonLat.val() == '' && userMarker.getLayers()[0]!== undefined){
            var userMarkerLatLng = userMarker.getLayers()[0].getLatLng();
            directions.setOrigin(userMarkerLatLng);
          }
         $('.leaflet-top').hide();

          directionsDivs.forEach(function(value){
            $(value).show();
          });
          $('label[for=origin] , input#origin').hide();

          drawnFeatureGroup.addLayer(tracksLikeSampleRoute);

        }else{
          var originName = $("#origin");
          var originLngLat = $("#origin_lnglat:hidden");
          originName.val(originName.data("prev-origin-name"));
          originLngLat.val(originLngLat.data("prev-origin-lnglat"));

          $('label[for=origin] , input#origin').show();
          $('.leaflet-top').show();
          directionsDivs.forEach( function(value){
            $(value).hide();
          });

          pointMap.removeLayer(directionsLayer);
          drawnFeatureGroup.addLayer(tracksNearPoint);
          userMarker.eachLayer(function(layer){
            drawnFeatureGroup.addLayer(layer);
          })




          //userCircleMarker should be added

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


 function markerFromGeocode (result){

      geolocationControl.stopGeolocate();
      if(this._geocodeMarker){
          this._map.removeLayer(this._geocodeMarker);
          this._map.removeLayer(this._geocodeCircle);
      }
      addCustomCircleMarker([result.center.lat, result.center.lng], userMarker);


      var marker = undefined;
      var  circle = undefined;
      userMarker.eachLayer(function(layer){
        if((typeof layer._mRadius) == 'undefined'){
          marker = layer;
        }else{
          circle = layer;
        }

      });

      this._geocodeMarker = marker;
      this._geocodeCircle = circle;


     drawnFeatureGroup.addLayer(this._geocodeMarker);
     drawnFeatureGroup.addLayer(this._geocodeCircle);


     _setOrigin(result.center,result.name|| result.html);

     return this;
}


function addSuggestionsInfo(suggestions){
  //array of routes
     routes =undefined;
    suggestions.features.forEach(function(i) {if (i.id== 'Polyline') {routes = i}});

    container = $("#suggestions");
    container.html('');


    html = '<ul>';

    html +=  '<li class="mapbox-directions-route">'

    var routeIndex = "<div class='mapbox-directions-route-heading'>"+ 'Route ' + 1 +  '</div>'
    html += routeIndex;

    var routeName = "<div class='mapbox-directions-route-summary'>" + routes.properties.Name + '</div>'
    html += routeName;

    var routeInfo = "<div class='mapbox-directions-route-details'>" + routes.properties.Length + ' km'+ '</div>'

    html += routeInfo;

    html += '</li>'

    html += '</ul>';



    container.append(html);







}
