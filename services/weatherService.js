const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();

const getWeather = async (location) => {
    try {
        const apiKey = process.env.WEATHER_API_KEY; 
        const response = await axios.get(`http://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${apiKey}&units=metric`);
        return response.data;
    } catch (error) {
        console.error('Error fetching weather data:', error);
        return null;
    }
};

module.exports = getWeather;
