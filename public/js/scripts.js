// Scripts for Rutgers Virtual Flyer
$(document).ready(function() {

  // Triggers modal launch
  $('.modal-trigger').leanModal();

  // Materialize parallax
  $('.parallax').parallax();

  // For dropdown menu
  $('select').material_select();

  // To scroll directly to latest reviews
  $('.scrollspy').scrollSpy();

  $('.deleteBtn').on('click', function(e) {
    e.preventDefault();
    var id = $(this).data('id');
    var that = $(this);
    $.ajax({
      url: '/deleteReview/' + id,
      type: 'DELETE',
      success: function(result) {
        that.parent(".review").fadeOut();
      }
    })
  })

   //blank map
    //button to find your current location
    //create marker (address to long-lat)
    //insert marker on review submit -- review attached to marker

    //mapbox key
    L.mapbox.accessToken = 'pk.eyJ1IjoiamFtZXNvbmNvZGVzIiwiYSI6ImNpbDJocmJveDNiemd1YWtzdHNwb21lbWsifQ.YptzfDfyzVlF0zNr4NhUhQ';

    //initialize a map
    var map = L.mapbox.map('map', 'mapbox.streets', {
      zoomControl: true
    }).setView([40.5008227, -74.4495878], 13); //long-lat of New Brunswick. zoom level : 13

    //manage auto zooming issue on page scroll
    //map.dragging.disable();
    map.touchZoom.disable();
    map.doubleClickZoom.disable();
    map.scrollWheelZoom.disable();
    map.keyboard.disable();

    //add a marker to the map
    var marker = new L.Marker(new L.LatLng(40.5008227, -74.4495878)); //adds marker to these coordinates
    map.addLayer(marker);

    // Mapbox
    var geocoder = L.mapbox.geocoder('mapbox.places-v1');
    geocoder.query('', showMap); //We can add the submitted review into this query to drop the pin

    function showMap(err, data) {
      if (data.lbounds) {
          map.fitBounds(data.lbounds);
          var marker = L.marker([data.latlng[0], data.latlng[1]]).addTo(map);
      } else if (data.latlng) {
          map.setView([data.latlng[0], data.latlng[1]], 13);
      }
    }
  }); //end of doc.ready

