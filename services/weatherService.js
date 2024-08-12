const axios = require('axios');

const getWeather = async (location) => {
    try {
        const apiKey = 'YOUR_API_KEY'; // Replace with your actual API key
        const response = await axios.get(`http://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${apiKey}&units=metric`);
        return response.data;
    } catch (error) {
        console.error('Error fetching weather data:', error);
        return null;
    }
};

module.exports = getWeather;
