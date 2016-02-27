// Scripts for Rutgers Virtual Flyer
$(document).ready(function() {

  // Triggers modal launch
  $('.modal-trigger').leanModal();

  //materialize parallax
  $('.parallax').parallax();

  //Mapbox map
  L.mapbox.accessToken = 'pk.eyJ1IjoiamFtZXNvbmNvZGVzIiwiYSI6ImNpbDJocmJveDNiemd1YWtzdHNwb21lbWsifQ.YptzfDfyzVlF0zNr4NhUhQ';
  var map = L.mapbox.map('map', 'mapbox.light')
      .setView([40.5008227, -74.4495878], 13); //40.5008227,-74.4495878

  // Credit Foursquare : required by documentation
  map.attributionControl
      .addAttribution('<a href="https://foursquare.com/">Places data from Foursquare</a>');

  // Create a Foursquare developer account: https://developer.foursquare.com/
  // NOTE: CHANGE THESE VALUES TO YOUR OWN:
  // Otherwise they can be cycled or deactivated with zero notice.
  var CLIENT_ID = 'AXZYR21QVM5ZASSFWBDMNYZBKVBMMMUWA2SNNDTYPSJPPLC3';
  var CLIENT_SECRET = '4GZZXEFSW50ZA0UKM2CJFMA5PSTLGVHW5NLZPEUEA2JG4ZRZ';

  // https://developer.foursquare.com/start/search
  var API_ENDPOINT = 'https://api.foursquare.com/v2/venues/search' +
    '?query=restaurant' + //create variable of categories and add here
    '&client_id=CLIENT_ID' +
    '&client_secret=CLIENT_SECRET' +
    '&v=20140806' + //foursquare version year/month/day
    '&ll=40.5008227,-74.4495878';

  // Keep our place markers organized in a nice group.
  var foursquarePlaces = L.layerGroup().addTo(map);

  // Use jQuery to make an AJAX request to Foursquare to load markers data.
  $.getJSON(API_ENDPOINT
      .replace('CLIENT_ID', CLIENT_ID)
      .replace('CLIENT_SECRET', CLIENT_SECRET)
      .replace('LATLON', map.getCenter().lat +
          ',' + map.getCenter().lng), function(result, status) {

      if (status !== 'success') return alert('Request to Foursquare failed');

      // Transform each venue result into a marker on the map.
      for (var i = 0; i < result.response.venues.length; i++) {
        var venue = result.response.venues[i]; //can we attach an event to this venue or maybe marker below?
        var latlng = L.latLng(venue.location.lat, venue.location.lng);
        var marker = L.marker(latlng, {
            icon: L.mapbox.marker.icon({
              'marker-color': '#BE9A6B',
              'marker-symbol': 'restaurant',
              'marker-size': 'large'
            })
          })
        .bindPopup('<strong><a href="https://foursquare.com/v/' + venue.id + '">' +
          venue.name + '</a></strong>')
          .addTo(foursquarePlaces);
      }
  });

}); //end of doc.ready



