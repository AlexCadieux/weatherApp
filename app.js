(function () {
  const DARKSKY_API_URL = 'https://api.darksky.net/forecast/';
  const DARKSKY_API_KEY = '1dc5929dbe2bd5743da0570670bc4ae2';
  const CORS_PROXY = 'https://cors-anywhere.herokuapp.com/';

  const GOOGLE_MAPS_API_KEY = 'AIzaSyBRndCiMmGNxQb9Z0tIKbWp4pBXj7-MoOE';
  const GOOGLE_MAPS_API_URL = 'https://maps.googleapis.com/maps/api/geocode/json';

  const GOOGLE_STATICS_MAP_URL = 'https://maps.googleapis.com/maps/api/staticmap?'
  const GOOGLE_STATIC_MAP_KEY = 'AIzaSyC5sN9nRHjJEnynNuLPbyvtU8XiPreIKBo'

  var body = $("body");
  var makeElement = (elem) => $(`<${elem}>`)

  // This function returns a promise that will resolve with an object of lat/lng coordinates
  function getInfoForCity(cityName) {
    // This is an ES6 template string, much better than verbose string concatenation...
    var url = `${GOOGLE_MAPS_API_URL}?address=${cityName}&key=${GOOGLE_MAPS_API_KEY}`;
    console.log(url);
    return (
      $.getJSON(url) // Returns a promise for a Response
      .then(data => {
        console.log(data)
        return data = {
          coordinates: data.results[0].geometry.location,
          locationName: data.results[0].formatted_address,
          staticImgUrl: `${GOOGLE_STATICS_MAP_URL}center=${data.results[0].geometry.location.lat},${data.results[0].geometry.location.lng}&zoom=10&size=1000x1000&scale=2&format=jpg&style=feature:all|lightness:20|saturation:-10&style=feature:road%7Celement:labels|visibility:off&style=feature:poi|element:labels|visibility:off&style=feature:administrative.neighborhood|element:labels|visibility:off&style=feature:administrative.locality|element:labels|visibility:simplified&style=feature:landscape.man_made|color:#bcbcbc|visibility:simplified&maptype=roadmap&key=${GOOGLE_STATIC_MAP_KEY}`
        }
      }) // Transform the response to only take what we need
    );
  }

  function getCurrentWeather(cityInfo) {
    // Template string again! I hope you can see how nicer this is :)
    var url = `${CORS_PROXY}${DARKSKY_API_URL}${DARKSKY_API_KEY}/${cityInfo.lat},${cityInfo.lng}?units=si&exclude=minutely,hourly,daily,alerts,flags`;

    return (
      $.getJSON(url)
      .then(data => data.currently)
    );
  }

  var app = $('#app');
  var cityForm = app.find('.city-form');
  var cityInput = cityForm.find('.city-input');
  var cityWeather = app.find('.city-weather');

  cityForm.on('submit', function(event) {
    event.preventDefault();
    var city = cityInput.val(); // Grab the current value of the input
    var locationName;
    var locationImgUrl;

    cityWeather.html('The page is loading...');

    getInfoForCity(city) // get the coordinates for the input city
    .then(result => {
      locationName = result.locationName;
      locationImgUrl = result.staticImgUrl;
      return getCurrentWeather(result.coordinates)
    }) // get the weather for those coordinates
    .then(function(weather) {
      var icon;
      switch (weather.icon) {
        case 'clear-night':
          icon = 'wi-night-clear';
          break;
        case 'rain':
          icon = 'wi-rain';
          break;
        case 'snow':
          icon = 'wi-snow';
          break;
        case 'sleet':
          icon = 'wi-sleet';
          break;
        case 'wind':
          icon = 'wi-windy';
          break;
        case 'fog':
          icon = 'wi-fog';
          break;
        case 'cloudy':
          icon = 'wi-cloud'
          break;
        case 'partly-cloudy-day':
          icon = 'wi-day-cloudy';
          break;
        case 'partly-cloudy-night':
          icon = 'wi-night-cloudy';
          break;
        case 'clear-day':
          icon = 'wi-day-sunny';
          break;
        default: icon = '';
      }

      var backgroundImg = makeElement('img')

      // var degCelsius = makeElement('i');
      // degCelsius.attr('class', 'wi wi-celsius');

      var iconType = makeElement('i');
      iconType.attr('class', `wi ${icon}`);

      var location = makeElement('h2');
      location.attr('class','location');
      location.html(locationName);

      var currentTemp = makeElement('p');
      currentTemp.attr('class', 'currentWeather');
      currentTemp.html('Currently '+weather.temperature +' °C');

      var summary = makeElement('p');
      summary.attr('class', 'summary');
      summary.html(`Actual condition: ${weather.summary}\nWindspeed: ${weather.windSpeed}km/h.\nThere is ${Math.floor(weather.precipProbability*100)}% of precipitation`);

      cityWeather.html('');
      location.appendTo(cityWeather);
      currentTemp.appendTo(cityWeather);
      summary.appendTo(cityWeather);
      iconType.appendTo(cityWeather);
      body.css('backgroundImage', `url(${locationImgUrl})`);
    });
  });
})();
