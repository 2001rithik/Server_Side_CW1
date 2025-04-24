const axios = require('axios');

class ApiDao {
    static async fetchAllCountries() {
        const response = await axios.get('https://restcountries.com/v3.1/all');
        return response.data;
    }

    static async fetchCountryByName(name) {
        const response = await axios.get(`https://restcountries.com/v3.1/name/${encodeURIComponent(name)}`);
        return response.data[0]; // First match
    }
}

module.exports = ApiDao;
