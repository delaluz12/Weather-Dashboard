//document ready jQuery function
jQuery(function ($) {
    // Your code using failsafe $ alias here...

    $('#searchResults').addClass('hidden');



    //DOM elements
    var cityName = document.getElementById('cityName');
    var weatherIcon = document.getElementById('weatherIcon');
    var currentTemp = document.getElementById('currentTemp');
    var currentHum = document.getElementById('currentHum');
    var currentWind = document.getElementById('currentWind');
    var currentUV = document.getElementById('currentUV');

    //onlick or enter
    $('form').submit(function (event) {

        //grab input for city search
        var citySearched = $('#city').val().trim();

        //pass citySearched to current weather data
        getCurrentWeather(citySearched);
        get5dayForecast(citySearched);
        saveLocalStorage(citySearched);
        createBtn(citySearched);

        event.preventDefault();
    });


    var getCurrentWeather = function (city) {
        var url = 'https://api.openweathermap.org/data/2.5/weather?q=' + city + '&appid=bf1335613e05b00a462dbf64e0325625';
        console.log(url);

        //make call with url for current weather & forecast
        fetch(url)
            .then(function (response) {
                if (response.ok) {
                    //cors repsonse
                    // console.log(response);
                    //covert to json
                    response.json().then(function (data) {
                        // parse to object
                        // console.log(data);
                        var name = data.name;

                        var kelvin = data.main.temp;
                        var fahrenheit = ((kelvin - 273.15) * 1.8000 + 32.00).toFixed();

                        //humidity => %
                        var humidity = data.main.humidity;
                        //wind speed in meter/sec convert to mph 
                        var windMetersPerSecond = data.wind.speed;
                        var windSpeed = (windMetersPerSecond / 0.44704).toFixed(1);

                        //coordinates for UX Index and forecast call
                        var lat = data.coord.lat;
                        var lon = data.coord.lon;

                        //get icon ID
                        var iconID = data.weather[0].icon;
                        //pass coord to get UV index
                        getUVindex(lat, lon);

                        function getUVindex(lat, lon) {
                            var url = 'https://api.openweathermap.org/data/2.5/onecall?lat=' + lat + '&lon=' + lon + '&appid=bf1335613e05b00a462dbf64e0325625'

                            fetch(url)
                                .then(function (response) {
                                    if (response.ok) {
                                        response.json().then(function (data) {
                                            uvIndex = (data.current.uvi).toFixed();
                                            //call displayUVindex function & pass value
                                            displayCurrentWeather(name, fahrenheit, humidity, windSpeed, iconID, uvIndex);




                                        });
                                    } else {
                                        alert('Error' + response.statusText);
                                    }
                                })
                                .catch(function (error) {
                                    alert('Error connecting to Weather API');
                                });
                        };

                    });
                } else {
                    alert('Error: ' + response.statusText);
                }
            })
            .catch(function (error) {
                alert('Unable to connect to Weather API');
            });

    }

    var get5dayForecast = function (city) {
        var url = 'https://api.openweathermap.org/data/2.5/weather?q=' + city + '&appid=bf1335613e05b00a462dbf64e0325625';

        //call to get lat and lon
        fetch(url)
            .then(function (response) {
                if (response.ok) {
                    console.log(response);
                    response.json().then(function (data) {
                        console.log(data);
                        //coordinates for UX Index and forecast call
                        var lat = data.coord.lat;
                        var lon = data.coord.lon;
                        get5DayData(lat, lon);
                        function get5DayData(lat, lon) {
                            var url = 'https://api.openweathermap.org/data/2.5/onecall?lat=' + lat + '&lon=' + lon + '&appid=bf1335613e05b00a462dbf64e0325625'

                            fetch(url)
                                .then(function (response) {
                                    if (response.ok) {
                                        response.json().then(function (data) {
                                            console.log(data);

                                            //date
                                            console.log(moment.unix(data.daily[1].dt).format('L'));


                                            //icon
                                            console.log(data.daily[1].weather[0].icon);
                                            //temp
                                            console.log(data.daily[1].temp.max);

                                            console.log((((data.daily[1].temp.max) - 273.15) * 1.8000 + 32.00).toFixed());
                                            //humidity
                                            console.log(data.daily[1].humidity);

                                            var forecastArr = [];

                                            //for loop to build array of objects to build forecast display

                                            for (var i = 1; i < 6; i++) {

                                                var obj = {
                                                    date: moment.unix(data.daily[i].dt).format('L'),
                                                    iconUrl: 'https://openweathermap.org/img/wn/' + data.daily[i].weather[0].icon + '@2x.png',
                                                    temp: (((data.daily[i].temp.max) - 273.15) * 1.8000 + 32.00).toFixed(),
                                                    humidity: data.daily[i].humidity,
                                                };

                                                forecastArr.push(obj);

                                            };
                                            console.log(forecastArr);
                                            //pass array to displayForecast function
                                            displayForecast(forecastArr);



                                        });
                                    } else {
                                        alert('Error' + response.statusText);
                                    }
                                })
                                .catch(function (error) {
                                    alert('Error connecting to Weather API');
                                });
                        };
                    })
                }
            })
    }


    var displayCurrentWeather = function (city, temperature, humidity, WindSpeed, iconID, uvIndex) {
        $('#searchResults').removeClass('hidden');

        //build weather icon url and change src attr 
        var iconUrl = 'https://openweathermap.org/img/wn/' + iconID + '@2x.png';

        // display city name and icon
        $(cityName).html(city + '<img id="weatherIcon" src=' + iconUrl + '>');
        $('#weatherIcon').addClass('icon');

        //display current temperature
        $(currentTemp).text('Temperature: ' + temperature + '°F');

        //display current humidity
        $(currentHum).text('Humidity: ' + humidity + '%');

        //display current Windspeed
        $(currentWind).text('Wind Speed: ' + WindSpeed + ' mph');

        //display current UV index
        $(currentUV).html('UV Index: ' + '<span class="badge">' + uvIndex + '</span>');

        //color code UV index
        if (0 <= uvIndex && uvIndex <= 2) {
            $('.badge').addClass('low');
        } else if (3 <= uvIndex && uvIndex <= 5) {
            $('.badge').addClass('moderate');
        } else if (6 <= uvIndex && uvIndex <= 7) {
            $('.badge').addClass('high');
        } else if (8 <= uvIndex && uvIndex <= 10) {
            $('.badge').addClass('veryhigh');
        } else if (uvIndex >= 11) {
            $('.badge').addClass('extreme');
        } else {
            $('.badge').addClass('bg-secondary');
        }


    };

    var displayForecast = function (array) {
        console.log(array);
        $('.forecastDay').each(function (index) {
            //display date
            $(this).addClass('iconDate');
            $(this).text(array[index].date);
        });

        $('.forecastIcon').each(function (index) {
            //display icon
            $(this).html('<img id="weatherIcon" src=' + array[index].iconUrl + '>');
        });

        $('.forecastTemp').each(function (index) {
            //display temp
            $(this).text('Temp: ' + array[index].temp + '°F');
        });
        $('.forecastHum').each(function (index) {
            //display humidity
            $(this).text('Humidity: ' + array[index].humidity + '%');
        });


    };

    var saveLocalStorage = function (city) {
        var addCity = city;

        //check if any are already stored
        if (localStorage.getItem('cityHistory') == null) {
            localStorage.setItem('cityHistory', '[]');
        }

        //get any existing values, parse, and add new values
        var existingCityHistory = JSON.parse(localStorage.getItem('cityHistory'));
        existingCityHistory.unshift(addCity);

        //save new values to local storage - stringfy
        localStorage.setItem('cityHistory', JSON.stringify(existingCityHistory));



    }

    var createBtn = function (city) {
        var newBtn = '<button class="list-group-item ">' + city + '</button>'
        $('.list-group').prepend(newBtn)

        $('button.list-group-item').on('click', function (event) {

            console.log($(this).text());

            var cityClicked = $(this).text();

            getCurrentWeather(cityClicked);
            get5dayForecast(cityClicked);



        });

    }

    //render Search History function
    var renderSearchHistory = function () {

        var searchHistory = JSON.parse(localStorage.getItem('cityHistory'));
        console.log(searchHistory);
        // check if empty 
        if (localStorage.getItem('cityHistory') != null) {

            //loop through each item in array and create button for each el in array
            searchHistory.forEach(function (index) {

                $('.list-group').append('<button class="list-group-item ">' + index + '</button>');
            })
        }



    }

    renderSearchHistory();


    $('button.list-group-item').on('click', function (event) {

        console.log($(this).text());

        var cityClicked = $(this).text();

        getCurrentWeather(cityClicked);
        get5dayForecast(cityClicked);



    });
    $('#resetBtn').on('click', function (event) {
        if (localStorage.getItem('cityHistory') !== null){
            $('.list-group-item').remove();  
            localStorage.clear();
              
        }
        
    })
    

});
