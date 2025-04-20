import axios from "axios";
const plateToVin = async (state, license) => {  
    const plateToVinKey = import.meta.env.VITE_PLATE_TO_VIN_KEY;
    console.log(state, license)
   
    try {
        const res = await axios({
            method: 'post',
            url: 'https://platetovin.com/api/convert',
            headers: {
                'Authorization': plateToVinKey,
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            data: {
                state: state,
                plate: license,
            },
        });

        if (res.status === 200) {
            console.log(res.data);
            if (res.data.success) {
                const vehicle = {
                    state: state,
                    plate: license,
                    vin: res.data.vin.vin,
                    year: res.data.vin.year,
                    make: res.data.vin.make,
                    model: res.data.vin.model,
                    engine: res.data.vin.engine,
                    transmission: res.data.vin.transmission,
                }
                return vehicle;  
            } 
        } 
    } catch (error) {
        console.error('Error fetching data:', error);
    }
};

/**
 * Decodes a Vehicle Identification Number (VIN) using the NHTSA API
 * @param {string} vin - The Vehicle Identification Number to decode
 * @returns {Promise} - Resolves with the decoded vehicle data in specified format
 */
async function decodeVIN(vin) {
    try {
      // Validate VIN format (basic check)
      if (!vin || typeof vin !== 'string' || vin.length !== 17) {
        throw new Error('Invalid VIN: Must be a 17-character string');
      }
  
      // Build the API URL
      const apiUrl = `https://vpic.nhtsa.dot.gov/api/vehicles/decodevin/${vin}?format=json`;
      
      console.log(`Fetching data for VIN: ${vin}`);
      
      // Make the API request
      const response = await fetch(apiUrl);
      
      // Check if the request was successful
      if (!response.ok) {
        throw new Error(`API request failed with status: ${response.status}`);
      }
      
      // Parse the JSON response
      const data = await response.json();
      
      console.log(`Received data with ${data.Results.length} result items`);
      
      // Extract the required fields from the results
      // NHTSA API returns an array of objects with Variable and Value properties
      const results = data.Results;
      const findValue = (variableName) => {
        const item = results.find(item => item.Variable === variableName);
        return item ? item.Value : '';
      };
      
      // Create the vehicle object in the requested format
      const vehicle = {
        vin: vin,
        year: findValue('Model Year'),
        make: findValue('Make'),
        model: findValue('Model'),
        engine: findValue('Displacement (L)') + 'L ' + findValue('Engine Configuration'),
        transmission: findValue('Transmission Style'),
      };
      
      console.log('Decoded vehicle:', vehicle);
      
      return vehicle;
    } catch (error) {
      console.error(`Error decoding VIN: ${error.message}`);
      throw error; // Re-throw to allow caller to handle the error
    }
  }
  
  // Example usage:
  // decodeVIN('1FTFW1ET5DFC10312')
  //   .then(vehicle => {
  //     console.log('Vehicle Information:', vehicle);
  //   })
  //   .catch(error => {
  //     console.error('Failed to decode VIN:', error.message);
  //   });

export {
    plateToVin,
    decodeVIN
}