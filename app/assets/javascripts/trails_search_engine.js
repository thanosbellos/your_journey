$(document).on('ready', function(){
  var path = window.location.pathname;

  if((path.search(/\/trail_searches\/new$/)!==-1)){

    map = initializeMap();

    drawnFeatureGroup = L.featureGroup().addTo(map);
    userMarker = L.featureGroup().addTo(map);
    sampleBuffer = L.geoJson(null);


    //initialize map and add contols
    //


    geolocationControl = L.control.accurateLocateControl({position: 'topleft',
                                                         strings: {title: "Show me where I am"},
    featureGroup: drawnFeatureGroup,
    userMarker: userMarker
    });
    geolocationControl.addTo(map);
    geocodeControl = L.Control.geocoder({position: 'topleft'}).addTo(map);
    geocodeControl.markGeocode = markerFromGeocode;
    if($(window).width() >1050){

      var drawControl = addDrawControl(map , drawnFeatureGroup , userMarker);

    }

    directions = L.mapbox.directions({units: 'metric'});
    directionsLayer = L.mapbox.directions.layer(directions );
    var directionsInputControl = L.mapbox.directions.inputControl('inputs', directions).addTo(map);
    var directionsErrorsControl = L.mapbox.directions.errorsControl('errors', directions).addTo(map);
    var directionsRoutesControl = L.mapbox.directions.routesControl('routes', directions).addTo(map);

    var tracksNearPoint =  L.geoJson(undefined , {pointToLayer: L.mapbox.marker.style});
    var tracksLikeSampleRoute = L.geoJson(undefined , {pointToLayer: L.mapbox.marker.style});

    var suggestionsNearPoint=[];
    var suggestionsForDestination=[];


    setUpEventsHandlers(directions);
    setUpSearchDirectionsAjaxCall();

    setUpTabsState();



  }


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


  function setUpEventsHandlers(directions){
    $("#radius").change(function(){
      var radius = $("#radius").val();
      var activeTabId = $("div.tab-pane.active").attr("id");
      console.log(activeTabId);
      if(activeTabId == 'search-near-point'){
        userMarker.eachLayer(function(layer){
          if(typeof layer._mRadius !== 'undefined'){
            layer.setRadius(radius);
          }
        });

        $("#radius").data('search-near-point-radius', radius);


      }
      else {

        if(typeof directions.directions !== 'undefined'){

          $("#radius").data('search-with-destination-radius', radius);
          var sampleRoute = $("#sample_route");
          var simplifiedSampleRoute = createSimplifiedRoute();
          var buffer = createTurfBuffer(simplifiedSampleRoute);
          var encodedPolyline = polyline.encode(simplifiedSampleRoute.toGeoJSON().geometry.coordinates);


          sampleRoute.val(encodedPolyline);
          sampleRoute.data("prev-sample-route-with-destination" , sampleRoute.val());

        }

      }
    });


    directions.on('load' , function(e){

      var origin = e.origin;
      var destination = e.destination;
      var  route = e.routes[0];
      var sampleRoute = $("#sample_route");
      var simplifiedSampleRoute = createSimplifiedRoute();

      var buffer = createTurfBuffer(simplifiedSampleRoute);
      var encodedPolyline = polyline.encode(simplifiedSampleRoute.toGeoJSON().geometry.coordinates);

      sampleRoute.val(encodedPolyline);
      sampleRoute.data("prev-sample-route-with-destination" , sampleRoute.val());

      $("#search-button").click();
    });


    directions.on('origin', function(e){
      var originLonLat = $("#origin_lnglat:hidden");
      if(typeof e.origin !=='undefined'){
        originLonLat.val([e.origin.geometry.coordinates[0] ,e.origin.geometry.coordinates[1]]);
      } else{
        sampleBuffer.clearLayers();
        originLonLat.val('');
      }
      originLonLat.data("prev-origin-lnglat-with-destination" , originLonLat.val());
    });

    directions.on('destination', function(e){
      var destinationLonLat = $("#destination_lnglat:hidden");

      if(typeof e.destination !=='undefined'){
        destinationLonLat.val([e.destination.geometry.coordinates[0] ,e.destination.geometry.coordinates[1]]);
      } else{

        sampleBuffer.clearLayers();
        destinationLonLat.val('');


      }
      destinationLonLat.data("prev-destination-lnglat-with-destination" , destinationLonLat.val());

    });

  }

  function setUpSearchDirectionsAjaxCall(){

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

      if((originLngLat.val()=='') || ((activeTabId == 'search-with-destination') &&
                                      ((destinationLngLat.val()=='' || route.val()=='')))){
        return false;
      }
    });

    $("#trail-search-form").on("ajax:success" , function(e,data,status, xhr){

      if(typeof data.message == 'undefined'){

        var activeTabId = $("div.tab-pane.active").attr("id");
        var results = (activeTabId =="search-near-point") ? tracksNearPoint : tracksLikeSampleRoute;


        results.addData(data.geojson);
        results.eachLayer(function(layer){
          drawnFeatureGroup.addLayer(layer);
        });

        //function to add info on our suggestions div
        //
        addSuggestionsInfo(data,activeTabId);


       // $("#results").append(xhr.responseText);
      } else {
        $("#suggestions").html('');
        //$("#results").append(data.message)
        //append to error section of mapbox-dir pane
      }
    });
  }

  function setUpTabsState(){
    var directionsDivs = ["#inputs","#mapbox-routes-h5",
      "#routes",  'label[for=destination] , input#destination'];
    directionsDivs.forEach( function(value){
      $(value).hide();
    });


    $('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {

      newTabId = ($(e.target).attr("aria-controls"));
      oldTabId = ($(e.relatedTarget).attr("aria-controls"));
      drawnFeatureGroup.clearLayers();
      clearFields();

      if(newTabId == 'search-with-destination'){

        restoreSearchDestinationTab(directionsDivs);

      }else{
        restoreSearchNearUserTab(directionsDivs);
      }



    })

  }

  function restoreSearchDestinationTab(directionsDivs){
    $("#search-near-point-results").hide();
    $("#search-with-destination-results").show();
    directionsLayer.addTo(map);
    var originLonLat = $("#origin_lnglat:hidden");
    var destinationLonLat =$("#destination_lnglat:hidden");
    var sampleRoute = $("#sample_route");

    var radius = $("#radius");
    radius.val(radius.data("search-with-destination-radius"));

    originLonLat.val(originLonLat.data("prev-origin-lnglat-with-destination"));
    destinationLonLat.val(destinationLonLat.data("prev-destination-lnglat-with-destination"));
    sampleRoute.val(sampleRoute.data("prev-sample-route-with-destination"));
    if(originLonLat.val() == '' && userMarker.getLayers()[0]!== undefined){
      var userMarkerLatLng = userMarker.getLayers()[0].getLatLng();
      directions.setOrigin(userMarkerLatLng);
    }
    //
    //
    $suggestions = $("#suggestions");
    $suggestions.html('');
    $suggestions.html($suggestions.data('prev-suggestions-search-with-destination'));
    setEventsOnSuggestions();
    directionsDivs.forEach(function(value){
      $(value).show();
    });


    $('.leaflet-top').hide();
    $('label[for=origin] , input#origin').hide();

    drawnFeatureGroup.addLayer(tracksLikeSampleRoute);
    drawnFeatureGroup.addLayer(sampleBuffer);
  }

  function restoreSearchNearUserTab(directionsDivs){

    $("#search-with-destination-results").hide();
    $("#search-near-point-results").show();

    var originName = $("#origin");
    var originLngLat = $("#origin_lnglat:hidden");
    originName.val(originName.data("prev-origin-name"));
    originLngLat.val(originLngLat.data("prev-origin-lnglat"));

    var radius = $("#radius");
    radius.val(radius.data("search-near-point-radius"));

    $('label[for=origin] , input#origin').show();
    $('.leaflet-top').show();
    var $suggestions = $("#suggestions");



    $suggestions.html('');
    $suggestions.html($suggestions.data('prev-suggestions-search-near-point'));
    setEventsOnSuggestions();

    directionsDivs.forEach( function(value){
      $(value).hide();
    });

    map.removeLayer(directionsLayer);
    drawnFeatureGroup.addLayer(tracksNearPoint);
    drawnFeatureGroup.removeLayer(sampleBuffer);
    userMarker.eachLayer(function(layer){
      drawnFeatureGroup.addLayer(layer);
    })

  }






  function addSuggestionsInfo(suggestions,activeTabId){
    //array of routes
    var routes = [];
    var suggestionsState = activeTabId == 'search-near-point'? suggestionsNearPoint : suggestionsForDestination;
    var results = activeTabId =='search-near-point'? $("#search-near-point-results") : $("#search-with-destination-results");
    var userInstructions = activeTabId == 'search-near-point'? $("#user-instructions-search-near-point") : $("#user-instructions-search-with-destination");

    suggestions.geojson.features.forEach(function(i) {if (i.id== 'Polyline') {routes.push(i)}});
    var $container = $("#suggestions");

    results.html('');
    results.append("<h3>Αποτελέσματα</h3>");

    results.append(suggestions.html);
    results.show();
    $container.html('');

    userInstructions.hide();


    for(var i=0, length = routes.length; i<length ; i++){


    var    ul = '<ul>';
    ul +=  '<li class="mapbox-directions-route">'


      raty_id = "raty"+i;
      raty_class = "."+raty_id;

      var routeIndex = "<div class='mapbox-directions-route-heading'>"+ 'Trail ' + (i+1) +  '</div>'
      ul += routeIndex;

      var routeName = "<div class='mapbox-directions-route-summary'>" + routes[i].properties.Name + '</div>'
      ul += routeName;

      var routeInfo = "<div class='mapbox-directions-route-details'>" + routes[i].properties.Length + ' km'+ '</div>'
      ul += routeInfo;

      var rating = "<div class= " +raty_id+ " mapbox-directions-route-details'>" + "<label>Avg Rating: </label>"+ '</div>'
      ul += rating;

      ul += '</li>'
      ul += '</ul>';

      $container.append(ul);
      var totalRaters= 'Rated by:' + routes[i].properties.totalRaters;

      $(raty_class).raty({
        hints: [totalRaters, totalRaters, totalRaters, totalRaters, totalRaters],
        halfShow:true,
        readOnly: true,
        score:routes[i].properties.Rating,
        starOn: 'star-on-small.png',
        starOff: 'star-off-small.png',
        starHalf: 'star-half-small.png'
      });


      $container.find('ul').data('route-id' , i);

    }
    $container.data('prev-suggestions-'+ activeTabId , $container.html());

    setEventsOnSuggestions();
  }

  function setEventsOnSuggestions(){
    var $container = $("#suggestions");
    if($container.find('ul').length !==0){
      $container.find('ul').on('click' , function(e){
        route = e.delegateTarget;
        $('#routes ul li.mapbox-directions-route-active').removeClass('mapbox-directions-route-active');

        $('#suggestions ul li.mapbox-directions-route-active').removeClass('mapbox-directions-route-active');
        $(route).find('li').addClass('mapbox-directions-route-active')
      });


      $('#routes').on('click' , function(e){
        $('#suggestions ul li.mapbox-directions-route-active').removeClass('mapbox-directions-route-active');
      });
      $container.find('ul').get(0).click();
    }

  }


  function createTurfBuffer(simplifiedRoute){



    //var coordinates = linestring



    var bufferSize = $("#radius").val();
    var buffer = turf.merge(turfBuffer(simplifiedRoute.toGeoJSON(), bufferSize/1000 , 'kilometers',16));
    var activeTabId = $("div.tab-pane.active").attr("id");

    drawnFeatureGroup.removeLayer(sampleBuffer);
    sampleBuffer.clearLayers();
    sampleBuffer.addData(buffer);
    sampleBuffer.setStyle({stroke: 'red', fillColor: '#0033ff', fillOpacity: 0.2 });

    if(activeTabId =='search-with-destination'){
      drawnFeatureGroup.addLayer(sampleBuffer);
    }
    return sampleBuffer.toGeoJSON();

  }

  function createSimplifiedRoute(route){

    var zoomLevel = map.getBoundsZoom(directionsLayer.routeLayer.getBounds());
    var coordinates = directionsLayer.routeLayer.getLayers()[0]._latlngs
    .map(function(latLng){
      return map.project(latLng , zoomLevel);
    });


    coordinates = L.LineUtil.simplify(coordinates, 0.4);
    coordinates = coordinates.map(function(latLng){ return map.unproject(latLng, zoomLevel)});

    var simplifiedRoute = L.polyline(coordinates);
    return simplifiedRoute


  }
});

