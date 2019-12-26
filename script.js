var localization = {
    currentLanguage: "en",
    'en': {
        dayNames: ["Sun", "Sat", "Fri", "Thu", "Wed", "Tue", "Mon"],
        monthNames: ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"],
        currentTemperature: "Current temperature:"
    },
    'ru': {
        dayNames: ["Вс", "Сб", "Пт", "Чт", "Ср", "Вт", "Пн"],
        monthNames: ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
        "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"],
        currentTemperature: "Текущая температура:"
    },
    'be': {
        dayNames: ["Нд", "Сб", "Пт", "Чц", "Ср", "Ау", "Пн"],
        monthNames: ["Студзень", "Люты", "Сакавік", "Красавік", "Май", "Чэрвень",
        "Ліпень", "Аўгуст", "Верасень", "Кастрычнік", "Лістапад", "Cнежань"],
        currentTemperature: "Цяперашняя тэмпература:"
    },    
    getLocalization: function() {
        switch(this.currentLanguage) {
            case "en": {
                return this.en
            }
            case "ru": {
                return this.ru
            }
            case "be": {
                return this.be
            }
            default: {
                return this.en;
            }
        }
    }
}

let temperatureValues = {
    isFahrenheit: false
}

// background image download function
async function downloadBackground() {
    let searchQuery = document.getElementsByClassName('search-query')[0].value.trim();
    let urlImage = `https://api.unsplash.com/photos/random?orientation=landscape&per_page=1&query=town&${searchQuery}&client_id=e34189ae187e8dc5d9267764526130431bca2accce797c8784643857a532d8fd`;

    let response = await fetch(urlImage);
    if (response.ok) {
        let answer = await response.json();

        let bodyElement = document.getElementsByTagName("body")[0];
        bodyElement.setAttribute("style", "background-image: url('" + answer.urls.full + "')");
    } else {
        alert("Ошибка HTTP: " + response.status);
    }

    determineСurrentTemperature(searchQuery);
}

// Function to determine the current date and time
function clock() {
    let localize = localization.getLocalization();

    let now = new Date();
    let dayNames = localize.dayNames;
    let d = new Date();
    let month_num = d.getMonth()
    let day = d.getDate();
    let hours = d.getHours();
    let minutes = d.getMinutes();

    let month = localize.monthNames;

    if (day <= 9) day = "0" + day;
    if (hours <= 9) hours = "0" + hours;
    if (minutes <= 9) minutes = "0" + minutes;

    let date_time = dayNames[now.getDay()] + " " + day + " " + month[month_num] + " " + hours + ":" + minutes;
    if (document.layers) {
        document.layers.doc_time.document.write(date_time);
        document.layers.doc_time.document.close();
    }
    else document.getElementById("doc_time").innerHTML = date_time;
    setTimeout("clock()", 1000);

    updateDayTitles(dayNames, now.getDay());
}

//location function
function geoFindMe() {
    let mapMe = document.getElementById("map");

    if (!navigator.geolocation) {
        mapMe.Text = "<p>Geolocation is not supported by your browser</p>";
        return;
    }

    async function success(position) {
        let latitude = position.coords.latitude;
        let longitude = position.coords.longitude;

        async function location() {
            let regionURL = "https://ipinfo.io?token=673bde2b3e36b6";
            let response = await fetch(regionURL);
            let answer = await response.json();
            if (response.ok) {
                let town = answer.city;
                if (town) {
                    determineСurrentTemperature(town);
                }
            }
        }

        mapMe.innerHTML = "Longitude is " + longitude + " Latitude is " + latitude;

        mapboxgl.accessToken = "pk.eyJ1Ijoia2l0YXJiaXQiLCJhIjoiY2s0MTgyMnFlMDEwYzNvbnExamc3bHgwZyJ9.nvfsyZ4PQNOUEY_yrSBoEg";
        let map = new mapboxgl.Map({
            container: 'map',
            center: [longitude, latitude],
            zoom: 10,
            style: "mapbox://styles/mapbox/satellite-streets-v11"
        });
        location();
    }
    function error() {
        mapMe.innerText = "Unable to retrieve your location";
    }
    navigator.geolocation.getCurrentPosition(success, error);
}

async function determineСurrentTemperature(city) {
    var language = document.getElementsByName("language")[0].value;
    if (!language) {
        language = "en";
    }
    let temperatureURL = "https://api.openweathermap.org/data/2.5/forecast?q=" + city + "&lang=" + language + "&units=metric&APPID=9b890d72da297efdd003c1b70eb2d06a";
    let response = await fetch(temperatureURL);
    if (response.ok) {
        let answer = await response.json();
        let currentTemperature = answer.list[0];
        let currentDayTime = new Date(currentTemperature.dt_txt);

        document.getElementsByClassName("summary")[0].innerText = currentTemperature.main.temp;

        var startDate = new Date(currentDayTime);
        startDate.setDate(startDate.getDate() + 1);
        startDate.setHours(00,00);

        var endDate = new Date(currentDayTime);
        endDate.setDate(endDate.getDate() + 3);
        endDate.setHours(23,59);

        var futureWeatherValues = answer.list.filter(function (item) {
            var currentDate = new Date(item.dt_txt);
            if ((currentDate >= startDate && currentDate <= endDate)
            && (currentDate.getHours() == 12 || currentDate.getHours() == 18)) {
                return item
            }                
        });

        let firstDay = document.getElementsByClassName("first-day")[0];
        firstDay.getElementsByClassName("day-temperature")[0].innerText = futureWeatherValues[0].main.temp;
        firstDay.getElementsByClassName("night-temperature")[0].innerText = futureWeatherValues[1].main.temp;

        let secondDay = document.getElementsByClassName("second-day")[0];
        secondDay.getElementsByClassName("day-temperature")[0].innerText = futureWeatherValues[2].main.temp;
        secondDay.getElementsByClassName("night-temperature")[0].innerText = futureWeatherValues[3].main.temp;

        let thirdDay = document.getElementsByClassName("third-day")[0];
        thirdDay.getElementsByClassName("day-temperature")[0].innerText = futureWeatherValues[4].main.temp;
        thirdDay.getElementsByClassName("night-temperature")[0].innerText = futureWeatherValues[5].main.temp;
    
        if (temperatureValues.isFahrenheit) {
            toFarenheitConverter();
        }

        document.getElementsByClassName("town")[0].innerText = answer.city.name;
        document.getElementsByClassName("country")[0].innerText = answer.city.country;
    }
}

function localizePage(language) {
    localization.currentLanguage = language;
    clock();
    var locilizeItem = localization.getLocalization();
    document.getElementsByClassName("current-temperature-text")[0].innerText = locilizeItem.currentTemperature;

}   
let convertTemperature = function(value) {
    if (value == "fahrenheit" && !temperatureValues.isFahrenheit) {
        toFarenheitConverter();
        temperatureValues.isFahrenheit = true;
        return;
    }
    if (value == "сelsius" && temperatureValues.isFahrenheit) {
        toСelsiusConverter();
        temperatureValues.isFahrenheit = false;
        return;
    }
}
let toFarenheitConverter = function () {
    function toFarenheitConvertValue(сelsius) {
        return (сelsius * 1.8 + 32).toFixed(2);
    }
    
    let dayClassNames = ["first-day", "second-day", "third-day"];

    dayClassNames.forEach(function(className){
        let day = document.getElementsByClassName(className)[0];
        let dayTemp = day.getElementsByClassName("day-temperature")[0];
        let nightTemp = day.getElementsByClassName("night-temperature")[0];
    
        dayTemp.innerText = toFarenheitConvertValue(dayTemp.innerText); 
        nightTemp.innerText = toFarenheitConvertValue(nightTemp.innerText); 
    });
}
let toСelsiusConverter = function () {
    function toСelsiusConvertValue(сelsius) {
        return ((сelsius - 32) / 1.8).toFixed(2);
    }
    
    let dayClassNames = ["first-day", "second-day", "third-day"];

    dayClassNames.forEach(function(className){
        let day = document.getElementsByClassName(className)[0];
        let dayTemp = day.getElementsByClassName("day-temperature")[0];
        let nightTemp = day.getElementsByClassName("night-temperature")[0];
    
        dayTemp.innerText = toСelsiusConvertValue(dayTemp.innerText); 
        nightTemp.innerText = toСelsiusConvertValue(nightTemp.innerText); 
    });
}

function updateDayTitles(dayNames, currentDayIndex) {
    let day = dayNames[currentDayIndex];
    let firstDayIndex = verifyIndex(dayNames.length, currentDayIndex - 1);
    let secondDayIndex = verifyIndex(dayNames.length, currentDayIndex - 2);
    let thirdDayIndex = verifyIndex(dayNames.length, currentDayIndex - 3);

    let firstDay = document.getElementsByClassName("first-day")[0];
    firstDay.getElementsByClassName("day-name")[0].innerText = dayNames[firstDayIndex];

    let secondDay = document.getElementsByClassName("second-day")[0];
    secondDay.getElementsByClassName("day-name")[0].innerText = dayNames[secondDayIndex];

    let thirdDay = document.getElementsByClassName("third-day")[0];
    thirdDay.getElementsByClassName("day-name")[0].innerText = dayNames[thirdDayIndex];

    function verifyIndex(length, resultIndex) {
        if (resultIndex > length - 1) {
            return resultIndex % length;
        }
        if (resultIndex < 0) {
            return length + resultIndex;
        }
        return resultIndex;
    }
}

clock();
geoFindMe();
localizePage(localization.currentLanguage);