// const soap = require('soap');
// const moment = require('moment');
// const mysql = require('mysql2');

// class EMRService {
//   constructor(emrKey, emrSecret, emrWsdlUrl, emrDbConfig) {
//     this.emrKey = emrKey;
//     this.emrSecret = emrSecret;
//     this.emrWsdlUrl = emrWsdlUrl; 

//     // Connect to EMR Database
//     this.db = mysql.createConnection(emrDbConfig);
//   }

//   async pushPatientDetails(yosiPatientId, emrPatientId, emrPracticeId, emrApptId, patientDetails, providerId, emrPushCapsFlag) {
//     const userData = {};

//     // Retrieve patient data from YOSI database
//     for (let value of patientDetails) {
//       let query = "";
//       if (value.yosiTableName !== 'patient_custom_page_answer') {
//         query = `SELECT ${value.yosiFieldName} FROM ${value.yosiTableName} WHERE id = ? AND delete_flag = 'N'`;
//       }

//       if (query) {
//         const [rows] = await this.db.execute(query, [yosiPatientId]);
//         if (rows.length > 0) {
//           const fieldValue = rows[0][value.yosiFieldName] ? this.decode(rows[0][value.yosiFieldName]) : "";
//           if (fieldValue) {
//             userData[value.emrKey] = fieldValue;
//           }
//         }
//       }
//     }

//     // Retrieve phone numbers and other details from EMR database
//     const query = `SELECT work_phone, home_phone, middle_name, nick_name FROM emr_patient WHERE patient_id = ?`;
//     const [phoneDetails] = await this.db.execute(query, [emrPatientId]);
    
//     let homePhone = phoneDetails[0]?.home_phone || '';
//     let workPhone = phoneDetails[0]?.work_phone || '';
//     let middleName = this.decode(phoneDetails[0]?.middle_name || '');
//     let nickName = this.decode(phoneDetails[0]?.nick_name || '');

//     // Determine the sex based on gender
//     let sex = '';
//     if (userData['gender'] === 'M' || userData['gender'] === 'Male') {
//       sex = 'Male';
//     } else if (userData['gender'] === 'F' || userData['gender'] === 'Female') {
//       sex = 'Female';
//     }

//     // Prepare data for SOAP request
//     const sendParams = {
//       parameters: {
//         patient: {
//           address: {
//             address1: userData['street1'],
//             address2: userData['street2'],
//             postalCode: userData['zip'],
//             city: userData['city'],
//             stateProvince: userData['state']
//           },
//           dob: moment(userData['dob']).format('MM/DD/YYYY'),
//           email: userData['email'].toLowerCase(),
//           firstName: userData['firstName'].toUpperCase(),
//           lastName: userData['lastName'].toUpperCase(),
//           middleName: middleName.toUpperCase(),
//           nickName: nickName.toUpperCase(),
//           gender: sex,
//           cellPhone: this.formatPhoneNumber(userData['cellphone']),
//           homePhone: this.formatPhoneNumber(homePhone),
//           workPhone: this.formatPhoneNumber(workPhone),
//           patientId: emrPatientId,
//           primaryLocationId: emrPracticeId,
//           primaryProviderId: providerId
//         },
//         userId: this.emrKey
//       }
//     };

//     if (emrPushCapsFlag === 'Y') {
//       sendParams.parameters.patient.firstName = sendParams.parameters.patient.firstName.toUpperCase();
//       sendParams.parameters.patient.lastName = sendParams.parameters.patient.lastName.toUpperCase();
//     } else {
//       sendParams.parameters.patient.firstName = this.capitalize(sendParams.parameters.patient.firstName);
//       sendParams.parameters.patient.lastName = this.capitalize(sendParams.parameters.patient.lastName);
//     }

//     // Call the SOAP service
//     try {
//       const client = await soap.createClientAsync(this.emrWsdlUrl);
//       const result = await client.updatePatientAsync(sendParams);
      
//       const apptParams = {
//         parameters: {
//           appointmentId: emrApptId,
//           userId: this.emrKey
//         }
//       };
//       const apptResult = await client.confirmAppointmentAsync(apptParams);

//       return {
//         send_data: sendParams,
//         patient_details: result,
//         appt_details: apptResult
//       };
//     } catch (err) {
//       console.error('Error with SOAP request:', err);
//       throw err;
//     }
//   }

//   // Helper methods
//   decode(encodedStr) {
//     return Buffer.from(encodedStr, 'base64').toString('utf-8');
//   }

//   formatPhoneNumber(phoneNumber) {
//     return phoneNumber.replace(/\D/g, '');  // Removes all non-numeric characters
//   }

//   capitalize(str) {
//     return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
//   }
// }

// // Usage
// const emrService = new EMRService('yourEmrKey', 'yourEmrSecret', 'yourEmrWsdlUrl', {
//   host: 'localhost',
//   user: 'Partner-252-ZmUh',
//   password: 'jW3Lh9xWf8W5',
//   database: 'emr_db'
// });

// async function run() {
//   try {
//     const response = await emrService.pushPatientDetails(
//       'yosiPatientId', 
//       'emrPatientId', 
//       'emrPracticeId', 
//       'emrApptId', 
//       'patientDetails', 
//       'providerId', 
//       'Y'
//     );
//     console.log(response);
//   } catch (err) {
//     console.error('Error:', err);
//   }
// }

// run();

// const soap = require('soap');  // Correct import for strong-soap

// // Function to get booked appointments from the SOAP service
// function getBookedAppointment(practiceData, callback) {
//     const { 
//         practice_id, 
//         emr_practice_id, 
//         start_date, 
//         end_date, 
//         emr_key, 
//         emr_secret, 
//         emr_wsdl_url 
//     } = practiceData;
 
//     // Prepare the date format (convert to 'mm/dd/yyyy')
//     const formattedStartDate = new Date(start_date).toLocaleDateString('en-US');
//     const formattedEndDate = end_date ? new Date(end_date).toLocaleDateString('en-US') : new Date().toLocaleDateString('en-US');

//     // Construct SOAP request parameters
//     const sendParams = {
//         searchRequest: {
//             officeId: emr_practice_id,
//             startDate: `${formattedStartDate} 12:00 AM`,
//             endDate: `${formattedEndDate} 12:00 AM`,
//         },
//         userId: emr_key,
//         password:emr_secret
//     };
//     // console.log(sendParams); 
    

//     // Use the provided WSDL URL
//     const url = emr_wsdl_url || 'https://candidate.revolutionehr.com/ws/services/partner?wsdl';  // Default URL if not provided

//     // Create SOAP client
//     soap.createClient(url, function (err, client) {
//         if (err) {
//             console.error('SOAP Client creation error:', err);
//             return callback(err);
//         }
//         // console.log('SOAP Client created successfully:', client);

        

//         // Make the SOAP call to the 'searchAppointmentsWithDetail' method
//         client.searchAppointmentsWithDetail(sendParams, function (err, result) {
//             if (err) {
            
//                 return callback(err);
//             }

//             // Process the response and format it as needed
//             const response = result;
           

//             const appointmentList = response && response.appointmentList;

//             if (!appointmentList || appointmentList.length === 0) {
//                 return callback(null, []);
//             }

//             const appointments = Array.isArray(appointmentList) ? appointmentList : [appointmentList];

//             // Map the appointments to match your desired format
//             const formattedAppointments = appointments.map((row) => {
//                 const patientInfo = row.patient || {};
//                 const appointmentId = row.appointmentId || '';

//                 // Extract gender and format
//                 let sex = '';
//                 if (patientInfo.gender) {
//                     sex = patientInfo.gender === 'male' ? 'M' : patientInfo.gender === 'female' ? 'F' : patientInfo.gender;
//                 }

//                 const patientData = {
//                     practice_id,
//                     userId: emr_key,
//                     password: emr_secret,
//                     emr_practice_id,
//                     appointment_id: appointmentId,
//                     first_name: patientInfo.firstName ? patientInfo.firstName.toUpperCase() : '',
//                     last_name: patientInfo.lastName ? patientInfo.lastName.toUpperCase() : '',
//                     full_name: patientInfo.firstName && patientInfo.lastName ? `${patientInfo.firstName} ${patientInfo.lastName}` : '',
//                     email: patientInfo.email || '',
//                     phone: patientInfo.cellPhone || '',
//                     gender: sex,
//                     dob: patientInfo.dob ? new Date(patientInfo.dob).toISOString().split('T')[0] : '',
//                     address: patientInfo.address || '',
//                 };

//                 return patientData;
//             });

//             // Callback with formatted appointment data
//             callback(null, formattedAppointments);
//         });
//     });
// }

// // Example usage
// const practiceData = {
//     practice_id: '266710',
//     emr_practice_id: '16120',
//     start_date: '2024-12-01',
//     end_date: '2024-12-10',
//     emr_key: 'Partner-252-ZmUh',
//     emr_secret: 'jW3Lh9xWf8W5',
//     emr_wsdl_url: 'https://candidate.revolutionehr.com/ws/services/partner?wsdl',
// };

// getBookedAppointment(practiceData, (err, appointments) => {
//     if (err) {
//         console.error('Error:', err);
//     } else {
//         console.log('Appointments:', appointments);
//     }
// });



const soap = require('soap');

const url = 'https://candidate.revolutionehr.com/ws/services/partner?wsdl';



soap.createClient(url, (err, client) => {
    if (err) return console.error(err);

    const wsSecurity = new soap.WSSecurity('Partner-252-ZmUh', 'jW3Lh9xWf8W5');
    client.setSecurity(wsSecurity);

    const param1 = {
        searchRequest: {
            officeId: "2006",
            // startDate: '12/01/2025 12:00 AM',
            // endDate: '1/03/2025 12:00 AM',
            // activeOnly: true,              
            // dob: "06/27/1993",           
            // firstName: "Michael",             
            // lastName: "Testpatient",              
            // pageNumber: "1",                 
            // pageSize: "100",                 
            // phone: "5034008675", 
            // updatedSince:"27/05/2024 12:00 AM",
          
        },
        userId: 'Partner-252-ZmUh'
    };
    // console.log("Sending Request with Parameters:", param1);

    client.searchPatients(param1, (err, result) => {
        if (err) return console.error("SOAP API Error:", err);

        if (result && result.patientList) {
            const patients = result.patientList;
            console.log("Patients Found:", patients);

          
        } else {
            console.log("No patients found.");
        }
    })
})