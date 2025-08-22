var UNITS   = "metric";

var form = document.getElementById("searchForm");
var input = document.getElementById("cityInput");
var statusEl = document.getElementById("status");

var resultBox = document.getElementById("result");
var cityEl = document.getElementById("cityName");
var tempEl = document.getElementById("temp");
var descEl = document.getElementById("desc");
var iconEl = document.getElementById("icon");

var forecastBox = document.getElementById("forecast");
var forecastList = document.getElementById("forecastList");

function setStatus(msg, isError){ statusEl.textContent = msg; statusEl.className = isError ? "error" : "muted"; }
function unit(){ return UNITS === "imperial" ? "°F" : "°C"; }
function cap(s){ return s ? s.charAt(0).toUpperCase() + s.slice(1) : ""; }
function dayLabel(ymd){
  var p = ymd.split("-"), d = new Date(p[0], p[1]-1, p[2]), names = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
  return names[d.getDay()] + " • " + ymd;
}

function renderCurrent(d){
  var city = d.name + (d.sys && d.sys.country ? ", " + d.sys.country : "");
  cityEl.textContent = city;
  tempEl.textContent = Math.round(d.main.temp) + unit();

  var desc = (d.weather && d.weather[0] && d.weather[0].description) ? d.weather[0].description : "";
  descEl.textContent = cap(desc);

  var ic = (d.weather && d.weather[0] && d.weather[0].icon) ? d.weather[0].icon : "01d";
  iconEl.src = "https://openweathermap.org/img/wn/" + ic + "@2x.png";
  iconEl.alt = desc || "weather";

  resultBox.hidden = false;
}

function renderForecast(fc){
  var list = (fc && fc.list) ? fc.list : [];
  var byDay = {};

  for (var i=0; i<list.length; i++){
    var it = list[i];
    if (!it.dt_txt) continue;
    var ymd = it.dt_txt.split(" ")[0];
    var mn = Math.round(it.main.temp_min), mx = Math.round(it.main.temp_max);
    if (!byDay[ymd]) byDay[ymd] = { min: mn, max: mx, icon: "01d", desc: "", noonSeen: false };
    if (mn < byDay[ymd].min) byDay[ymd].min = mn;
    if (mx > byDay[ymd].max) byDay[ymd].max = mx;

    if (it.dt_txt.indexOf("12:00:00") !== -1 || (!byDay[ymd].noonSeen && !byDay[ymd].desc)) {
      byDay[ymd].icon = (it.weather && it.weather[0] && it.weather[0].icon) ? it.weather[0].icon : byDay[ymd].icon;
      byDay[ymd].desc = (it.weather && it.weather[0] && it.weather[0].description) ? it.weather[0].description : byDay[ymd].desc;
      if (it.dt_txt.indexOf("12:00:00") !== -1) byDay[ymd].noonSeen = true;
    }
  }

  var dates = Object.keys(byDay).sort().slice(0,5);
  if (!dates.length){ forecastBox.hidden = true; return; }

  var u = unit(), html = "";
  for (var j=0; j<dates.length; j++){
    var ds = dates[j], d = byDay[ds], desc = cap(d.desc);
    html += '<div class="day">'
          +   '<div class="day-left">'
          +     '<img src="https://openweathermap.org/img/wn/' + d.icon + '.png" alt="' + desc + '" width="32" height="32" />'
          +     '<div><div class="day-name">' + dayLabel(ds) + '</div><div class="muted">' + desc + '</div></div>'
          +   '</div>'
          +   '<div class="day-right"><span class="max">' + d.max + u + '</span> <span class="min">/ ' + d.min + u + '</span></div>'
          + '</div>';
  }
  forecastList.innerHTML = html;
  forecastBox.hidden = false;
}

function getWeather(city){
  if (!API_KEY ){ setStatus("Add your OpenWeatherMap API key ", true); return; }
  if (!city){ setStatus("Please enter a city.", true); return; }

  setStatus("Loading…", false);
  resultBox.hidden = true; forecastBox.hidden = true;

  var curURL = "https://api.openweathermap.org/data/2.5/weather?q=" + encodeURIComponent(city)
             + "&appid=" + API_KEY + "&units=" + UNITS;

  fetch(curURL)
    .then(function(res){ if(!res.ok){ if(res.status===401) throw new Error("Invalid API key (401)."); if(res.status===404) throw new Error("City not found (404)."); throw new Error("Error " + res.status); } return res.json(); })
    .then(function(cur){
      renderCurrent(cur);
      var fcURL = "https://api.openweathermap.org/data/2.5/forecast?lat=" + cur.coord.lat + "&lon=" + cur.coord.lon
                + "&appid=" + API_KEY + "&units=" + UNITS;
      return fetch(fcURL);
    })
    .then(function(res2){ if(!res2.ok) throw new Error("Forecast error " + res2.status); return res2.json(); })
    .then(function(fc){ renderForecast(fc); setStatus("Done", false); })
    .catch(function(err){ setStatus(err.message || "Something went wrong.", true); });
}

form.addEventListener("submit", function(e){ e.preventDefault(); getWeather(input.value.trim()); });

var API_KEY = "66746946cf06a3391cb13a63e61e1c5c";
