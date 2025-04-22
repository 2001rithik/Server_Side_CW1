const fs = require('fs');
const path = require('path');
const ApiDao = require('../dao/apiDao');

class ApiService {
    async getAllCountries() {
        try {
            const apiData = await ApiDao.fetchAllCountries();
            return apiData.map(this.formatCountry);
        } catch (error) {
            console.error("API Error:", error.message);
           // return this.loadFromLocalFile();
        }
    }

    async getCountryByName(name) {
        try {
            const country = await ApiDao.fetchCountryByName(name);
            return this.formatCountry(country);
        } catch (apiError) {
            console.warn("Falling back to local file for:", name);
          //  return this.loadFromLocalFileByName(name);
        }
    }

    formatCountry(country) {
        return {
            name: country.name?.common || "N/A",
            capital: country.capital?.[0] || "N/A",
            currency: country.currencies 
                ? Object.values(country.currencies)[0]?.name || "N/A"
                : "N/A",
            languages: country.languages 
                ? Object.values(country.languages) 
                : ["N/A"],
            flag: country.flags?.png || "N/A"
        };
    }

    loadFromLocalFile() {
        const filePath = path.join(__dirname, '..', '..', 'countriesV3.1.json');
        const jsonData = fs.readFileSync(filePath, 'utf-8');
        const rawCountries = JSON.parse(jsonData);
        return rawCountries.map(this.formatCountry);
    }

    loadFromLocalFileByName(name) {
        const filePath = path.join(__dirname, '..', '..', 'countriesV3.1.json');
        const jsonData = fs.readFileSync(filePath, 'utf-8');
        const allCountries = JSON.parse(jsonData);
        const match = allCountries.find(c =>
            c.name?.common?.toLowerCase() === name.toLowerCase()
        );

        if (!match) {
            throw new Error('Country not found in local data');
        }

        return this.formatCountry(match);
    }
}

module.exports = new ApiService();
