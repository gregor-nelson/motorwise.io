// helpData.js - Separate data file to reduce component size

export const FAQ_ITEMS = [
    {
      id: 'mot-valid',
      category: 'Using the service',
      question: 'How can I check if my vehicle\'s MOT is valid?',
      answer: 'Enter your vehicle registration number in the search box on the homepage. The system will display the current MOT status, including the expiry date. If your MOT has expired, you should not drive the vehicle except to a pre-booked MOT test appointment. The MOT status is updated daily from the DVSA database.'
    },
    {
      id: 'vehicle-info',
      category: 'Using the service',
      question: 'What information does the service provide about a vehicle?',
      answer: 'The service provides official DVLA vehicle details (make, model, year, engine size, fuel type), current tax status, MOT history including test results, advisory notices, failures, and mileage readings at each test. For premium reports, additional information such as emissions data, risk assessments and technical bulletins is available.'
    },
    {
      id: 'missing-vehicle',
      category: 'Using the service',
      question: 'Why might a vehicle not appear in the system?',
      answer: 'A vehicle may not appear if it\'s exempt from MOT testing (such as vehicles manufactured before 1960), recently registered and not yet tested, or registered in Northern Ireland or outside Great Britain. The database is updated daily with the latest information from the DVSA and DVLA.'
    },
    {
      id: 'premium-reports',
      category: 'Premium services',
      question: 'What additional information is included in premium reports?',
      answer: 'Premium reports provide a detailed technical analysis derived from the vehicle\'s MOT history and manufacturer data. They include comprehensive risk assessments of major systems (suspension, brakes, corrosion, engine), identification of recurring issues and failure patterns, correlation with manufacturer technical bulletins, repair time estimates, emissions compliance assessment, and advanced mileage verification.'
    },
    {
      id: 'report-cost',
      category: 'Premium services',
      question: 'How much does a premium report cost?',
      answer: 'Premium reports are available for £9.99 per vehicle. We also offer business packages for motor traders and dealerships with volume discounts available. Payment can be made securely via credit/debit card or PayPal. VAT receipts are provided for all transactions.'
    },
    {
      id: 'data-updates',
      category: 'Data and privacy',
      question: 'How up-to-date is the information?',
      answer: 'The MOT history and vehicle details are updated daily from the DVSA and DVLA databases. Tax information is typically updated within 5 working days of any changes. All data is sourced directly from official government records to ensure maximum accuracy and reliability.'
    },
    {
      id: 'data-privacy',
      category: 'Data and privacy',
      question: 'How is my data protected when using this service?',
      answer: 'We adhere strictly to the UK General Data Protection Regulation (UK GDPR) and the Data Protection Act 2018. Your personal information is encrypted during transmission and storage. We only collect the information necessary to provide the service, and we do not share your data with third parties without your explicit consent. For full details, please refer to our Privacy Policy.'
    },
    {
      id: 'browser-compatibility',
      category: 'Technical questions',
      question: 'Which browsers are supported?',
      answer: 'This service is compatible with all modern browsers including Google Chrome, Mozilla Firefox, Microsoft Edge, and Safari (versions released within the last 3 years). For the best experience and security, we recommend using the latest version of your preferred browser. The service is also fully functional on mobile devices and tablets.'
    },
    {
      id: 'service-unavailable',
      category: 'Technical questions',
      question: 'What should I do if the service is unavailable?',
      answer: 'If you experience technical difficulties accessing the service, please first check your internet connection and try refreshing the page. If problems persist, we recommend clearing your browser cache and cookies or trying a different browser. Our service undergoes maintenance typically between 2am and 4am GMT on Sundays, during which time it may be temporarily unavailable. If you continue to experience issues, please contact our support team.'
    }
  ];
  
  export const GLOSSARY_ITEMS = [
    {
      term: 'Advisory notice',
      definition: 'Information provided by an MOT tester about items that are beginning to deteriorate but are not yet serious enough to cause the vehicle to fail its MOT test.'
    },
    {
      term: 'Clean Air Zone (CAZ)',
      definition: 'Areas in cities where targeted action is being taken to improve air quality by discouraging the most polluting vehicles from entering the zone. Different vehicles may be charged differently based on their emissions standards.'
    },
    {
      term: 'DVLA',
      definition: 'Driver and Vehicle Licensing Agency. The UK government organisation responsible for maintaining a database of drivers and vehicles in Great Britain, and issuing driving licences.'
    },
    {
      term: 'DVSA',
      definition: 'Driver and Vehicle Standards Agency. The UK government organisation responsible for setting, testing and enforcing driver and vehicle standards in Great Britain, including the MOT scheme.'
    },
    {
      term: 'DVA',
      definition: 'Driver and Vehicle Agency. The organisation responsible for driver and vehicle testing in Northern Ireland.'
    },
    {
      term: 'Euro emissions standards',
      definition: 'European standards that define acceptable limits for exhaust emissions of new vehicles sold in the EU and EEA member states. Currently range from Euro 1 (oldest) to Euro 6 (newest) for most vehicle types.'
    },
    {
      term: 'Major defect',
      definition: 'An MOT failure category indicating that a defect may affect the vehicle\'s safety, put other road users at risk or have an impact on the environment. The vehicle must be repaired immediately.'
    },
    {
      term: 'Minor defect',
      definition: 'An MOT category indicating that a defect has no significant effect on the safety of the vehicle or impact on the environment. The vehicle still passes the MOT, but the defect should be repaired as soon as possible.'
    },
    {
      term: 'MOT',
      definition: 'Ministry of Transport test. A mandatory annual test for vehicle safety, roadworthiness and exhaust emissions required for most vehicles used on public roads in Great Britain that are over three years old.'
    },
    {
      term: 'MOT certificate',
      definition: 'The document issued when a vehicle passes its MOT test, valid for one year.'
    },
    {
      term: 'VIN',
      definition: 'Vehicle Identification Number. A unique code assigned to each vehicle by the manufacturer. It serves as the vehicle\'s fingerprint, as no two vehicles have the same VIN.'
    },
    {
      term: 'V5C',
      definition: 'Vehicle Registration Certificate. Also known as the car log book, this document records the registered keeper of a vehicle, not necessarily the legal owner.'
    }
  ];
  
  export const GUIDE_STEPS = [
    {
      number: 1,
      title: 'Enter vehicle registration',
      description: 'Input the vehicle registration number in the search box on the homepage. Enter the registration exactly as it appears on the vehicle, without spaces.'
    },
    {
      number: 2,
      title: 'Review vehicle details',
      description: 'Verify that the returned vehicle make, model, and other details match the vehicle you are enquiring about.'
    },
    {
      number: 3,
      title: 'Check MOT status',
      description: 'The system will display the current MOT status, including the expiry date and any advisory notices from previous tests.'
    },
    {
      number: 4,
      title: 'View full history',
      description: 'For a comprehensive view, select "View full MOT history" to see all previous test results, failures, and advisory notices.'
    },
    {
      number: 5,
      title: 'Optional: Purchase premium report',
      description: 'For detailed analysis including risk assessments and manufacturer bulletins, you can purchase a premium report.'
    }
  ];