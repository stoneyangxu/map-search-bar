$(function() {
  console.log("init");

  var pyrmont = new google.maps.LatLng(30, 120);

  map = new google.maps.Map(document.getElementById("map"), {
    center: pyrmont,
    zoom: 15
  });

  var mapSearchBar = new com.github.stone.MapSearchBar({
    $element: $(".my-search-bar"),
    className: "custom-map-search-bar",
    googleMap: map,
    searchOnEnter: true,
    onSelectPlace: function(place) {
      console.log("select place", place);
    }
  });
});
