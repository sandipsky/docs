// Weather codes used by Open-Meteo (the `weather_code` field).
// These are WMO codes: an international standard, set by the World Meteorological Organization.
// Full list: https://open-meteo.com/en/docs (search the page for "WMO Weather interpretation codes")
//
// This file is only data: no logic. Import it where you need it:
//   import { weatherCodes } from "./weather-codes.js";
//   weatherCodes[3]  // { description: "Overcast", emoji: "☁️" }

export const weatherCodes = {
  0: { description: "Clear sky", emoji: "☀️" },
  1: { description: "Mainly clear", emoji: "🌤️" },
  2: { description: "Partly cloudy", emoji: "⛅" },
  3: { description: "Overcast", emoji: "☁️" },
  45: { description: "Fog", emoji: "🌫️" },
  48: { description: "Freezing fog", emoji: "🌫️" },
  51: { description: "Light drizzle", emoji: "🌦️" },
  53: { description: "Drizzle", emoji: "🌦️" },
  55: { description: "Heavy drizzle", emoji: "🌧️" },
  56: { description: "Light freezing drizzle", emoji: "🌧️" },
  57: { description: "Heavy freezing drizzle", emoji: "🌧️" },
  61: { description: "Light rain", emoji: "🌦️" },
  63: { description: "Rain", emoji: "🌧️" },
  65: { description: "Heavy rain", emoji: "🌧️" },
  66: { description: "Light freezing rain", emoji: "🌧️" },
  67: { description: "Heavy freezing rain", emoji: "🌧️" },
  71: { description: "Light snow", emoji: "🌨️" },
  73: { description: "Snow", emoji: "🌨️" },
  75: { description: "Heavy snow", emoji: "❄️" },
  77: { description: "Snow grains", emoji: "🌨️" },
  80: { description: "Light showers", emoji: "🌦️" },
  81: { description: "Showers", emoji: "🌧️" },
  82: { description: "Heavy showers", emoji: "⛈️" },
  85: { description: "Light snow showers", emoji: "🌨️" },
  86: { description: "Heavy snow showers", emoji: "❄️" },
  95: { description: "Thunderstorm", emoji: "⛈️" },
  96: { description: "Thunderstorm with light hail", emoji: "⛈️" },
  97: { description: "Heavy thunderstorm", emoji: "⛈️" },
  99: { description: "Thunderstorm with heavy hail", emoji: "⛈️" },
};
