const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const xssClean = require('xss-clean');
const hpp = require('hpp');

// Load environment variables from .env file
dotenv.config();

const User = require('./models/User');
const getWeather = require('./services/weatherService');

// Initialize Express App
const app = express();

// Security Middleware
app.use(helmet());
app.use(cors());
app.use(xssClean());
app.use(hpp());

// Rate limiting to prevent brute-force attacks
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many requests from this IP, please try again after 15 minutes',
});
app.use(limiter);

// Body Parser Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log('MongoDB connection error:', err));

// Basic Route
app.get('/', (req, res) => {
    res.send('Welcome to Mavuno Forecast!');
});

app.post('/ussd', async (req, res) => {
    app.post('/ussd', async (req, res) => {
        try {
            let { sessionId, serviceCode, phoneNumber, text } = req.body;

            let user = await User.findOne({ phoneNumber });
            let response = '';

            if (!user) {
                if (text === '') {
                    response = `CON Welcome to Mavuno Forecast.
    1. English
    2. Kiswahili`;
                } else if (text === '1' || text === '2') {
                    const selectedLanguage = text === '1' ? 'English' : 'Kiswahili';
                    user = new User({
                        phoneNumber: phoneNumber,
                        language: selectedLanguage,
                    });
                    await user.save();
                    response = selectedLanguage === 'English' 
                        ? `CON Please enter your first name:` 
                        : `CON Tafadhali ingiza jina lako la kwanza:`;
                } else {
                    // Save first name and welcome the user
                    user.firstName = text;
                    await user.save();
                    response = user.language === 'English'
                        ? `END Thank you, ${user.firstName}. Your details have been saved.`
                        : `END Asante, ${user.firstName}. Maelezo yako yamehifadhiwa.`;
                }
            } else {
                if (text === '') {
                    response = user.language === 'English'
                        ? `CON Welcome to Mavuno Forecast.
    1. Get weather update
    2. Change location
    3. Change alert preferences
    4. Help`
                        : `CON Karibu kwenye mfumo wa taarifa za hali ya hewa.
    1. Pata taarifa za hali ya hewa
    2. Badilisha eneo
    3. Badilisha mipangilio ya tahadhari
    4. Kusaidia`;
                } else if (text === '1') {
                    if (user.location) {
                        const weather = await getWeather(user.location);
                        if (weather) {
                            response = user.language === 'English'
                                ? `END The weather in ${user.location}: ${weather.weather[0].description}, temperature: ${weather.main.temp}°C.`
                                : `END Hali ya hewa kwa ${user.location}: ${weather.weather[0].description}, joto: ${weather.main.temp}°C.`;
                        } else {
                            response = user.language === 'English'
                                ? `END Sorry, we couldn't retrieve the weather information at the moment.`
                                : `END Samahani, hatuwezi kupata taarifa za hali ya hewa kwa sasa.`;
                        }
                    } else {
                        response = user.language === 'English'
                            ? `END Please set your location first.`
                            : `END Tafadhali weka eneo lako kwanza.`;
                    }
                } else if (text === '2') {
                    response = user.language === 'English'
                        ? `CON Please enter your location:`
                        : `CON Weka jina la eneo lako:`;
                } else if (text.startsWith('2*')) {
                    let location = text.split('*')[1];
                    user.location = location;
                    await user.save();
                    response = user.language === 'English'
                        ? `END Your location has been set to ${location}.`
                        : `END Eneo lako limewekwa kwa ${location}.`;
                } else if (text === '3') {
                    response = user.language === 'English'
                        ? `CON Choose alert preferences:
    1. Daily Alerts
    2. Severe Weather Only`
                        : `CON Chagua mipangilio ya tahadhari:
    1. Tahadhari za kila siku
    2. Tahadhari za hali mbaya tu`;
                } else if (text === '3*1') {
                    user.alertPreferences = { daily: true, severeWeatherOnly: false };
                    await user.save();
                    response = user.language === 'English'
                        ? `END You have selected daily alerts.`
                        : `END Umechagua tahadhari za kila siku.`;
                } else if (text === '3*2') {
                    user.alertPreferences = { daily: false, severeWeatherOnly: true };
                    await user.save();
                    response = user.language === 'English'
                        ? `END You have selected severe weather alerts only.`
                        : `END Umechagua tahadhari za hali mbaya tu.`;
                } else {
                    response = user.language === 'English'
                        ? `END Invalid option.`
                        : `END Chaguo halipo sahihi.`;
                }
            }

            res.send(response);
        } catch (error) {
            console.error('Error processing USSD request:', error);
            res.send('END An error occurred, please try again later.');
        }
    });
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
})
.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use. Please use a different port.`);
        process.exit(1);
    } else {
        throw err;
    }
});
