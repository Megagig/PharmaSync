import { FaPills, FaUserMd, FaExchangeAlt, FaChartLine, FaClipboardList, FaBell } from 'react-icons/fa';

const features = [
  {
    icon: <FaPills className="w-6 h-6" />,
    title: 'Medication Management',
    description: 'Comprehensive medication database with drug information, interactions, and inventory tracking.',
    color: 'primary',
  },
  {
    icon: <FaUserMd className="w-6 h-6" />,
    title: 'Patient Profiles',
    description: 'Detailed patient records with medical history, allergies, and medication adherence tracking.',
    color: 'secondary',
  },
  {
    icon: <FaExchangeAlt className="w-6 h-6" />,
    title: 'Drug Interactions',
    description: 'Real-time drug interaction checking to prevent adverse events and ensure patient safety.',
    color: 'primary',
  },
  {
    icon: <FaChartLine className="w-6 h-6" />,
    title: 'Inventory Management',
    description: 'Track stock levels, expiry dates, and automate reordering for efficient inventory control.',
    color: 'secondary',
  },
  {
    icon: <FaClipboardList className="w-6 h-6" />,
    title: 'Prescription Management',
    description: 'Digital prescription processing with validation checks and dispensing records.',
    color: 'primary',
  },
  {
    icon: <FaBell className="w-6 h-6" />,
    title: 'Clinical Decision Support',
    description: 'Evidence-based recommendations and alerts to support clinical decision-making.',
    color: 'secondary',
  },
];

const FeaturesSection = () => {
  return (
    <section id="features" className="py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Powerful Features for Modern Pharmacists
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            PharmaSync provides a comprehensive suite of tools designed specifically for the needs of Nigerian pharmacists.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="bg-white rounded-lg shadow-md p-6 border border-gray-100 hover:shadow-lg transition-shadow duration-300"
            >
              <div className={`inline-flex items-center justify-center p-3 rounded-full mb-5 ${
                feature.color === 'primary' 
                  ? 'bg-primary-100 text-primary-600' 
                  : 'bg-secondary-100 text-secondary-600'
              }`}>
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-600">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <div className="inline-block p-1 bg-gray-100 rounded-full">
            <div className="flex space-x-1">
              <button className="px-4 py-2 text-sm font-medium rounded-full bg-primary-600 text-white">
                All Features
              </button>
              <button className="px-4 py-2 text-sm font-medium rounded-full text-gray-700 hover:bg-gray-200">
                For Pharmacists
              </button>
              <button className="px-4 py-2 text-sm font-medium rounded-full text-gray-700 hover:bg-gray-200">
                For Business
              </button>
            </div>
          </div>
        </div>

        {/* Feature highlight */}
        <div className="mt-20">
          <div className="bg-gradient-to-r from-primary-50 to-secondary-50 rounded-2xl p-8 md:p-12">
            <div className="flex flex-col md:flex-row items-center">
              <div className="w-full md:w-1/2 mb-8 md:mb-0 md:pr-8">
                <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                  Streamlined Prescription Management
                </h3>
                <p className="text-gray-700 mb-6">
                  Our prescription management system allows you to process prescriptions quickly and accurately, with built-in checks for drug interactions, allergies, and dosage verification.
                </p>
                <ul className="space-y-3">
                  {[
                    'Digital prescription records',
                    'Automatic interaction checking',
                    'Dosage calculation assistance',
                    'Patient medication history',
                    'Refill management',
                  ].map((item, index) => (
                    <li key={index} className="flex items-start">
                      <svg className="w-5 h-5 text-primary-600 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="w-full md:w-1/2">
                <img 
                  src="https://images.unsplash.com/photo-1587854692152-cbe660dbde88?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2069&q=80" 
                  alt="Prescription Management" 
                  className="rounded-lg shadow-lg w-full h-auto"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
