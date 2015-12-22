var appid = 'a020ccbd6127bedba3aac2353858c9d6';

var selectedCityForecast;
var selectedCityCurrentWeather;
var sameAreaCitysForecast;

var secondCityForecast;

var chartTemp = new CanvasJS.Chart("tempGraph",
 {
     title: {
         text: "Прогноз температуры",
         fontSize: 20
     },
     animationEnabled: false,
     axisX: {
         title: "",
         gridThickness: 1,
         interval: 6,
         intervalType: "hour",
         gridColor: "Silver",
         tickColor: "Silver",
         valueFormatString: "DD/MM/YY HH ч.",
         labelAngle: -30

     },
     toolTip: {
         shared: true
     },
     theme: "theme2",
     axisY: {
         gridThickness: 1,
         gridColor: "Silver",
         tickColor: "Silver"
     },
     legend: {
         verticalAlign: "center",
         horizontalAlign: "right"
     },
     data: []
 });

var chartPressure = new CanvasJS.Chart("pressureGraph",
{

    title: {
        text: "Прогноз давления",
        fontSize: 20
    },
    animationEnabled: false,
    axisX: {
        title: "",
        gridThickness: 1,
        interval: 8,
        intervalType: "hour",
        gridColor: "Silver",
        tickColor: "Silver",
        valueFormatString: "DD/MM/YY HH ч.",
        labelAngle: -30

    },
    toolTip: {
        shared: true
    },
    theme: "theme2",
    axisY: {
        gridThickness: 1,
        gridColor: "Silver",
        tickColor: "Silver",
        minimum: 680,
        maximum: 800,
        interval: 10
    },
    legend: {
        verticalAlign: "center",
        horizontalAlign: "right"
    },
    data: []
});

function GenerateGraphsMainCity(listTemp, cityName) {

    ClearDiagram(chartTemp);
    ClearDiagram(chartPressure);

    var maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + parseInt($('#cbGraphsInterval').val()));

    var targetWeatherlistTemp = listTemp.filter(function (value, i) {
        return ((i % 2) == 0 && (value.Date <= maxDate));
    });

    AddTempGraph(targetWeatherlistTemp, cityName, "red");
    AddPresureGraph(targetWeatherlistTemp, cityName, "green");
};

function AddSecondaryCityGraph(listTemp, cityName) {
    ClearDiagram(chartTemp, 1);    

    var maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + parseInt($('#cbGraphsInterval').val()));

    var targetWeatherlistTemp = listTemp.filter(function (value, i) {
        return ((i % 2) == 0 && (value.Date <= maxDate));
    });

    AddTempGraph(targetWeatherlistTemp, cityName, "orange"); 
};

function ClearDiagram(diagram, graphsCount) {
    if (graphsCount) {
        diagram.options.data.length = graphsCount;
    } else {
        diagram.options.data.length = 0;
    }   
};

function GetRandomColor() {
    var back = ["#ff0000", "blue", "green", "yellow", "orange"];
    var rand = back[Math.floor(Math.random() * back.length)];
    return rand;
};

function RemoveSecondCityGraph()
{
    chartTemp.options.data.splice(1,200);
    chartTemp.render();
}

function AddTempGraph(listTemp, cityName, color) {

    var data = {
        type: "line",
        showInLegend: true,
        lineThickness: 2,
        name: cityName,
        markerType: "square",
        color: color ? color : GetRandomColor(),
        cityName: cityName,
        dataPoints : []
    };

    listTemp.forEach(function (value, i) {
        data.dataPoints.push({ x: value.Date, y: value.Temperature });
    });
   
    chartTemp.options.data.push(data);
    chartTemp.render();
}

function AddPresureGraph(listPressure, cityName, color) {

    var data = {
        type: "column",
        showInLegend: true,
        lineThickness: 2,
        name: cityName,
        markerType: "square",
        color: color ? color : GetRandomColor(),
        cityName: cityName,
        dataPoints: []
    };

    listPressure.forEach(function (value, i) {
        data.dataPoints.push({ x: value.Date, y: value.Pressure });
    });

    chartPressure.options.data.push(data);
    chartPressure.render();
}

function GetCitysInSameArea(latitude, longas) {
    var resultCitysForecast = [];

    for (var i = 1; i < 10; i++) {

        if (resultCitysForecast.length >= 5) {
            break;
        }

        $.ajax({
            async: false,
            method: 'GET',
            url: 'http://api.openweathermap.org/data/2.5/forecast',
            data: {
                lat: latitude + i * 0.1,
                lon: longas + i * 0.1,
                APPID: appid,
                units: 'metric',
                lang: 'ru'
            },
            success: function (data, status, xhr) {
                debugger;
                var tmpForecast = {};
                tmpForecast.CityName = data.city.name;
                tmpForecast.Weather = [];
                data.list.forEach(function (val, i) {
                    tmpForecast.Weather[i] = {};
                    tmpForecast.Weather[i].Date = new Date(val.dt_txt);
                    tmpForecast.Weather[i].Temperature = val.main.temp;
                    tmpForecast.Weather[i].Pressure = Math.round(val.main.pressure * 0.750062);
                    tmpForecast.Weather[i].WindSpeed = val.main.humidity;
                    tmpForecast.Weather[i].Humidity = val.wind.speed;
                    tmpForecast.Weather[i].WeatherDescription = val.weather.description;
                });

                var duplicates = resultCitysForecast.find(function(city){
                    return city.CityName == tmpForecast.CityName;
                });

                if (!duplicates) {
                    resultCitysForecast.push(tmpForecast);
                }                         
            },
            error: function (xhr, status, error) {
                alert('Ошибка при запросе сервиса! ' + error);
            }
        });
    }

    return resultCitysForecast;
};

function GetForecastByCityID(cityId) {
    var resultForecast = {};
    resultForecast.CityId = cityId;

    $.ajax({
        async: false,
        method: 'GET',
        url: 'http://api.openweathermap.org/data/2.5/forecast',
        data: {
            id: cityId,
            APPID: appid,
            units: 'metric',
            lang: 'ru'
        },
        success: function (data, status, xhr) {
            
            resultForecast.CityName = data.city.name;
            var weatherPerHour = [];
            data.list.forEach(function (val, i) {
                weatherPerHour[i] = {};
                weatherPerHour[i].Date = new Date(val.dt_txt);
                weatherPerHour[i].Temperature = val.main.temp;
                weatherPerHour[i].Pressure = Math.round(val.main.pressure * 0.750062);
                weatherPerHour[i].WindSpeed = val.main.humidity;
                weatherPerHour[i].Humidity = val.wind.speed;
            });

            resultForecast.Status = 0;
            resultForecast.Error = undefined;
            resultForecast.Weather = weatherPerHour;
        },
        error: function (xhr, status, error) {
            alert('Ошибка при запросе сервиса! ' + error);
            resultForecast.Status = -1;
            resultForecast.Error = error;
        }
    });

    return resultForecast;
}

function GetCurrentWeatherByCityID(cityId) {
    var resultWeather = {};
    $.ajax({
        async: false,
        method: 'GET',
        url: 'http://api.openweathermap.org/data/2.5/weather',
        data: {
            id: cityId,
            APPID: appid,
            units: 'metric',
            lang: 'ru'
        },
        success: function (data, status, xhr) {
            debugger;
            resultWeather.Temperature = data.main.temp;
            resultWeather.Pressure = Math.round(data.main.pressure * 0.750062);
            resultWeather.WindSpeed = data.wind.speed;
            resultWeather.CityName = data.name;
            resultWeather.Humidity = data.main.humidity;
            resultWeather.Latitude = data.coord.lat;
            resultWeather.Longitude = data.coord.lon;
            resultWeather.WeatherDescription = data.weather.description;
            resultWeather.Status = 0;
            resultWeather.Error = undefined;
        },
        error: function (xhr, status, error) {
            alert('Ошибка при запросе сервиса! ' + error);
            resultWeather.Status = -1;
            resultWeather.Error = error;
        }
    });

    return resultWeather;
}


$(function () {
    $('#googleGraphs').css({ 'height': ($(document).height() - 160) + 'px' });    

    $('#btnGetCityForecast').click(function () {

        $('#sameCitysButtonsArea').html("");
        $('#secondCityPanel').hide();
        $('#sameCityPanel').hide();

        selectedCityCurrentWeather = GetCurrentWeatherByCityID($('#cbCity').val());
        selectedCityForecast = GetForecastByCityID($('#cbCity').val());

        sameAreaCitysForecast = GetCitysInSameArea(selectedCityCurrentWeather.Latitude, selectedCityCurrentWeather.Longitude);
        secondCityForecast = undefined;

        $('#mainCityName').html('Город: ' + selectedCityCurrentWeather.CityName + ' (' + GetFormattedDate(new Date) + ')');
        $('#mainCityTemp').html('Температура: ' + selectedCityCurrentWeather.Temperature + ' &degC');
        $('#mainCityPressure').html('Давление: ' + selectedCityCurrentWeather.Pressure + ' мм.рт.ст.');
        $('#mainCityWind').html('Скорость ветра: ' + selectedCityCurrentWeather.WindSpeed + ' м/c');
        $('#mainCityHumanity').html('Влажность: ' + selectedCityCurrentWeather.Humidity + ' %');
        $('#resultPanel').show();
        $('#sameCityPanel').show();

        sameAreaCitysForecast.forEach(function (city) {
            $('<input type="button"/>')
                .addClass("btn btn-primary btn-sm")
                .attr("value", city.CityName)
                .html(city.CityName)
                 .click(function () {
                    var button = $(this);
                    secondCityForecast = sameAreaCitysForecast.filter(function (val) { return val.CityName == button.val() })[0];

                    $('#secondCityName').html('Город: ' + secondCityForecast.CityName + ' (' + GetFormattedDate(new Date) + ')');
                    $('#secondCityTemp').html('Температура: ' + secondCityForecast.Weather[0].Temperature + ' &degC');
                    $('#secondCityPressure').html('Давление: ' + secondCityForecast.Weather[0].Pressure + ' мм.рт.ст.');
                    $('#secondCityWind').html('Скорость ветра: ' + secondCityForecast.Weather[0].WindSpeed + ' м/c');
                    $('#secondCityHumanity').html('Влажность: ' + secondCityForecast.Weather[0].Humidity + ' %');
                    $("#secondCityPanel").show();

                    AddSecondaryCityGraph(secondCityForecast.Weather, secondCityForecast.CityName);
                 })
                .appendTo($("#sameCitysButtonsArea")
               );
        });

        $('#googleGraphs').show();
        GenerateGraphsMainCity(selectedCityForecast.Weather, selectedCityCurrentWeather.CityName);
        
    });

    function GetFormattedDate(date)
    {
        return date.getDate() + '-' + date.getMonth() + '-' + date.getFullYear();
    }

    $(window).resize(function () {       
        $('#googleGraphs').css({ 'height': ($(window).height() - 160) + 'px' });     
    });

    $('#cbGraphsInterval').change(function () {
        GenerateGraphsMainCity(selectedCityForecast.Weather, selectedCityCurrentWeather.CityName);
        if (secondCityForecast) {
            AddSecondaryCityGraph(secondCityForecast.Weather, secondCityForecast.CityName);
        }
    });

    $('#btnRemoveSecondForecast').click(function () {
        $("#secondCityPanel").hide();
            RemoveSecondCityGraph();
    });

    citysStr.sort(function (a, b) { return a.name.localeCompare(b.name) }).forEach(function (city) {
        $('#cbCity').append($("<option></option>")
            .attr("value", city._id)
            .text(city.name));      
    });
});