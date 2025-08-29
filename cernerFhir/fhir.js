const axios = require("axios");

const url =
" https://fhir-open.cerner.com/r4/ec2458f2-1e24-41c8-b71b-0e701af7583d/Appointment?patient=12724066&date=ge2020-01-01T22:22:16.270Z";
(async () => {
  try {
    // Fetch data from the API
    const response = await axios.get(url, {
      headers: {
        Accept: "application/fhir+json",
      },
      timeout: 10000, // 10 seconds
    });

    console.log("Raw Response Data:", response.data);

    // Process the response
    const appointments = response.data.entry.map((entry) => {
      const resource = entry.resource;
      return {
        id: resource.id, // Appointment ID
        status: resource.status, // Status (e.g., booked)
      };
    });

    console.log("Processed Appointments:", appointments);
  } catch (error) {
    // Handle errors (e.g., 504 Gateway Timeout)
    console.error("Error:", error.message);
  }
})();
