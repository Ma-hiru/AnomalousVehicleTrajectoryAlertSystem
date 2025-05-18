import { getLocation } from "@/utils/getLocation";
import axios from "axios";
import AppSettings from "@/settings";


const enum API {
  LOCAL_WEATHER = "https://devapi.qweather.com/v7/weather/now",
  LOCAL_CITY = "https://geoapi.qweather.com/v2/city/lookup",
}

const getLocalWeatherData = async (city: string): Promise<WeatherType> => {
  const res = await axios.get(`${API.LOCAL_WEATHER}?location=${city}&lang=zh&unit=m`, {
    headers: {
      "X-QW-Api-Key": AppSettings.WEATHER_KEY
    }
  });
  return res.data;
};
const getCityLocation = async (city: string = "北京"): Promise<CityType> => {
  const res = await axios.get(`${API.LOCAL_CITY}?location=${city}`, {
    headers: {
      "X-QW-Api-Key": AppSettings.WEATHER_KEY
    }
  });
  return res.data;
};


export const getWeather = async (): Promise<WeatherData | null> => {
  const location = await getLocation();
  if (!location) return null;
  const { longitude, latitude } = location.coords;
  const city: CityType = await getCityLocation(`${longitude.toFixed(2)},${latitude.toFixed(2)}`);
  const weather: WeatherType = await getLocalWeatherData(
    city.location[0].id
  );
  const cityName = city.location[0].name;
  const temp = weather.now.temp;
  const icon = weather.now.icon;
  const weatherData = weather.now.text;
  return {
    city,
    weather,
    cityName,
    weatherData,
    temp,
    icon
  } satisfies WeatherData;
};
