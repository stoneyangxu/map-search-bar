var com = com || {};
com.github = com.github || {};
com.github.stone = com.github.stone || {};

(function(NS) {
  function MapSearchBar(options) {
    var _setting = $.extend(
      {
        $element: null,
        placeholder: "Please enter keyword",
        className: "",
        googleMap: null,
        openstreetUrl:
          "https://nominatim.openstreetmap.org/?format=json&addressdetails=0&format=json&limit=10&q=",
        onSelectPlace: function(place) {}
      },
      options || {}
    );

    var $element = _setting.$element;
    var $input = null;
    var $btn = null;
    var $panel = null;

    var _googlePlaceService = null;

    function init() {
      if (_setting.$element) {
        $element.addClass("map-search-bar");
        $element.addClass(_setting.className);

        $input = $("<input type='text' class='map-search-bar-input' />");
        $input.attr("placeholder", _setting.placeholder);
        $element.append($input);

        $btn = $("<div class='map-search-bar-btn' />");
        $element.append($btn);

        $panel = $("<div class='map-search-bar-panel'></div>");
        $element.append($panel);
      }

      if (_setting.googleMap) {
        _googlePlaceService = new google.maps.places.PlacesService(
          _setting.googleMap
        );
      }

      bindEvents();
    }

    function bindEvents() {
      $input.keypress(function(e) {
        if (e.which == 13) {
          //e.preventDefault();
          search();
        }
      });

      $btn.click(function(e) {
        search();
      });
    }

    function search() {
      var keyword = $input.val().trim();
      if (keyword !== "") {
        var request = {
          query: keyword
        };

        if (_googlePlaceService) {
          _googlePlaceService.textSearch(request, function(results, status) {
            if (status === google.maps.places.PlacesServiceStatus.OK) {
              var places = [];
              for (var i = 0; i < results.length; i++) {
                var result = results[i];
                places.push({
                  name: result.name,
                  address: result.formatted_address,
                  location: {
                    lon: result.geometry.location.lng(),
                    lat: result.geometry.location.lat()
                  }
                });
              }

              showSearchResult(places, true);
            } else if (
              status === google.maps.places.PlacesServiceStatus.ZERO_RESULTS
            ) {
              console.log("google search empty");
              searchByOpenstreet(keyword);
              // showEmptyResult(true);
            } else {
              console.log("google search failed");
              searchByOpenstreet(keyword);
            }
          });
        } else {
          searchByOpenstreet(keyword);
        }
      }
    }

    function searchByOpenstreet(keyword) {
      var openstreetUrl = _setting.openstreetUrl + keyword;
      $.get(openstreetUrl, function(results) {
        if (results.length > 0) {
          var places = [];
          for (var i = 0; i < results.length; i++) {
            var result = results[i];
            places.push({
              name: result.display_name,
              address: result.display_name,
              location: {
                lon: parseFloat(result.lon),
                lat: parseFloat(result.lat)
              }
            });
          }

          showSearchResult(places, true);
        } else {
          console.log("openstreet search empty");
          showEmptyResult(false);
        }
      });
    }

    function showEmptyResult(isGoogle) {
      $panel.empty();
      var $content = $("<ul />");
      var $li = $(
        "<li class='map-search-bar-panel-li map-search-bar-panel-empty'></li>"
      );
      $li.text("Address not found");
      $content.append($li);
      $panel.append($content);
      $panel.show();
    }

    function showSearchResult(places, isGoogle) {
      $panel.empty();

      var $content = $("<ul />");

      for (var i = 0; i < places.length; i++) {
        var place = places[i];

        var $li = $(
          "<li class='map-search-bar-panel-li map-search-bar-panel-result'></li>"
        );
        $li.text(place.address);
        $li.attr("title", place.address);
        $li.data("name", place.name);
        $li.data("lon", place.location.lon);
        $li.data("lat", place.location.lat);

        $content.append($li);
      }

      $panel.append($content);
      $panel.show();

      bindSelectEvent();
    }

    function bindSelectEvent() {
      $(".map-search-bar-panel-li").click(function() {
        var $li = $(this);

        $panel.hide();

        _setting.onSelectPlace({
          name: $li.data("name"),
          address: $li.text(),
          location: {
            lon: $li.data("lon"),
            lat: $li.data("lat")
          }
        });
      });
    }

    init();
  }

  NS.MapSearchBar = MapSearchBar;
})(com.github.stone);
