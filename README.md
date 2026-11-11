# Weather App

A small weather page in plain HTML, CSS and JavaScript. Type a city and it shows the
current temperature and conditions, plus a five-day forecast (daily high/low), using the
[OpenWeatherMap](https://openweathermap.org/api) API. No framework and no build step.

## Running it

1. Get a free API key from [OpenWeatherMap](https://home.openweathermap.org/api_keys).
   New keys can take a little while to start working.
2. Paste it into `API_KEY` at the top of `script.js`.
3. Open `index.html` in a browser.

The key ends up in the page's JavaScript, so anyone who opens the page can read it. Use a
free-tier key you don't mind exposing.

To show temperatures in °F, set `UNITS` to `"imperial"` in `script.js`.

## Files

| File | What it does |
| --- | --- |
| `index.html` | Search form, current-weather card and forecast card |
| `script.js` | Calls the `/weather` endpoint for the city, then `/forecast` with its coordinates, and groups the 3-hour forecast into days |
| `style.css` | Layout and styling |
