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
    try {
        let { sessionId, serviceCode, phoneNumber, text } = req.body;

        let response = '';
        if (text === '') {
            response = `CON Karibu kwenye mfumo wa taarifa za hali ya hewa.
1. Pata taarifa za hali ya hewa
2. Badilisha eneo
3. Badilisha mipangilio ya tahadhari
4. Kusaidia`;
        } else if (text === '1') {
            let user = await User.findOne({ phoneNumber });
            if (user && user.location) {
                const weather = await getWeather(user.location);
                if (weather) {
                    response = `END Hali ya hewa kwa ${user.location}: ${weather.weather[0].description}, joto: ${weather.main.temp}°C.`;
                } else {
                    response = `END Samahani, hatuwezi kupata taarifa za hali ya hewa kwa sasa.`;
                }
            } else {
                response = `END Tafadhali weka eneo lako kwanza.`;
            }
        } else if (text === '2') {
            response = `CON Weka jina la eneo lako:`;
        } else if (text.startsWith('2*')) {
            let location = text.split('*')[1];
            let user = await User.findOne({ phoneNumber });
            if (user) {
                user.location = location;
            } else {
                user = new User({ phoneNumber, location });
            }
            await user.save();
            response = `END Eneo lako limewekwa kwa ${location}.`;
        } else if (text === '3') {
            response = `CON Chagua mipangilio ya tahadhari:
1. Tahadhari za kila siku
2. Tahadhari za hali mbaya tu`;
        } else if (text === '3*1') {
            response = `END Umechagua tahadhari za kila siku.`;
        } else if (text === '3*2') {
            response = `END Umechagua tahadhari za hali mbaya tu.`;
        } else {
            response = `END Chaguo halipo sahihi.`;
        }

        res.send(response);
    } catch (error) {
        console.error('Error processing USSD request:', error);
        res.send('END Tatizo limejitokeza, tafadhali jaribu tena baadaye.');
    }
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
