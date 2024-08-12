const request = require('supertest');
const app = require('../server');

describe('USSD Routes', () => {
    it('should return the main menu', async () => {
        const res = await request(app)
            .post('/ussd')
            .send({ text: '' });
        expect(res.text).toContain('Karibu kwenye mfumo wa taarifa za hali ya hewa');
    });

    it('should handle setting the location', async () => {
        const res = await request(app)
            .post('/ussd')
            .send({ text: '2*Dar es Salaam' });
        expect(res.text).toContain('Eneo lako limewekwa kwa Dar es Salaam');
    });

    it('should return weather for the location', async () => {
        // Mock user location and weather data
        const res = await request(app)
            .post('/ussd')
            .send({ text: '1', phoneNumber: '254701234567' });
        expect(res.text).toContain('Hali ya hewa kwa Dar es Salaam');
    });
});
