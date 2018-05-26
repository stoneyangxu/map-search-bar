$(function() {
  console.log("init");

  var pyrmont = new google.maps.LatLng(-33.8665433, 151.1956316);

  map = new google.maps.Map(document.getElementById("map"), {
    center: pyrmont,
    zoom: 15
  });

  var mapSearchBar = new com.github.stone.MapSearchBar({
    $element: $(".my-search-bar"),
    className: "custom-map-search-bar",
    googleMap: map,
    onSelectPlace: function(place) {
      console.log("select place", place);
    }
  });
});
