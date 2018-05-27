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
        notFoundText: "Address not found.",
        searchOnEnter: false,
        interval: 2000,
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

    var _lastChangedTime = null;
    var _lastKeyword = null;
    var _timer = null;

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

      resetTime();
    }

    function bindEvents() {
      $input.keypress(function(e) {
        if (e.which == 13) {
          search();
          resetTime();
        }
      });

      if (_setting.searchOnEnter) {
        $input.bind("input", function(e) {
          resetTime();
        });
      }

      $btn.click(function(e) {
        search();
      });

      _timer = setInterval(function() {
        var current = new Date().getTime();
        if (current - _lastChangedTime > _setting.interval) {
          if ($input.val() !== _lastKeyword) {
            console.log("fire auto complete");
            search();
          }
        }
      }, 500);

      $(window).bind("unload", function() {
        if (_timer) {
          clearInterval(_timer);
        }
      });
    }

    function resetTime() {
      _lastChangedTime = new Date().getTime();
    }

    function startSearch() {
      $btn.addClass("map-search-bar-btn-search");
    }

    function endSearch() {
      $btn.removeClass("map-search-bar-btn-search");
    }

    function search() {
      startSearch();
      var keyword = $input.val().trim();
      _lastKeyword = keyword;
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
                  address: result.name + " " + result.formatted_address,
                  location: {
                    lon: result.geometry.location.lng(),
                    lat: result.geometry.location.lat()
                  }
                });
              }

              endSearch();
              showSearchResult(places, true);
            } else if (
              status === google.maps.places.PlacesServiceStatus.ZERO_RESULTS
            ) {
              console.log("google search empty");
              searchByOpenstreet(keyword);
            } else {
              console.log("google search failed", status);
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

      $.ajax({
        url: openstreetUrl,
        method: "GET",
        dataType: "json",
        success: function(results) {
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

            endSearch();
            showSearchResult(places, false);
          } else {
            console.log("openstreet search empty");
            endSearch();
            showEmptyResult(false);
          }
        },
        error: function() {
          endSearch();
        }
      });
    }

    function showEmptyResult(isGoogle) {
      $panel.empty();
      var $content = $("<ul />");
      var $li = $(
        "<li class='map-search-bar-panel-li map-search-bar-panel-empty'></li>"
      );
      $li.text(_setting.notFoundText);
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

      if (isGoogle) {
        var $poweredByGoogle = $(
          "<div class='powered-by-google'><span></span></div>"
        );
        $panel.append($poweredByGoogle);
      }

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
