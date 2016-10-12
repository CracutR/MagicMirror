var config = require('./config.json')
var Promise = require('promise')
var requestClient = Promise.denodeify(require('request'));
var getIp = Promise.denodeify(require('external-ip')());
var DarkSky = require('dark-sky');
var forecast = new DarkSky(config.apiKeys.darkSky)
getIp()
	.then(getLatLongByIp)
	.then(getWeatherByLatLong)
	.then(handleWeather);

function getLatLongByIp(ip) {
	return requestClient('http://ip-api.com/json/'+ ip)
	.then(function(result){
		return JSON.parse(result.body)
	})
	.then(function(result) {
		console.log(result);
		return {latitude: result.lat, longitude: result.lon, city: result.city, region: result.region};
	});

}


function getWeatherByLatLong(result) {
	console.log("getting weather");
	return forecast.latitude(result.latitude).longitude(result.longitude).get()
		.then(function(res) {
			return {weather: res, city: result.city, region: result.region };
		}); 
}

function handleWeather(res) {
	var weather = res.weather;
	console.log(JSON.stringify(weather));
	var city = res.city;
	var region = res.region;
	var currentWeather = weather.currently.summary;
		var temp = weather.currently.temperature;
		var windSpeed = weather.currently.windSpeed;
		var minutelySummary = weather.minutely ? '-' + weather.minutely.summary + '\n' : '';
		var hourlySummary = weather.hourly? '-' + weather.hourly.summary : '';
		var weatherSummary = "Weather Summary for : " + city + ", " + region + "\n" +
							 "-Temperature: " + temp + " degrees\n" +
							 "-Windspeed: " + windSpeed + " mph\n" +
							 minutelySummary + hourlySummary;
		console.log(weatherSummary);
	for (var i = 0; i < weather.alerts.length; i++) console.log(weather.alerts[0].description);
}