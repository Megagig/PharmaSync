import { Link } from 'react-router-dom';
import Button from '@/components/common/Button/Button';

const HeroSection = () => {
  return (
    <section className="relative pt-24 pb-16 md:pt-32 md:pb-24 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-50 to-secondary-50 z-0"></div>
      
      {/* Decorative circles */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-primary-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute top-0 right-0 w-72 h-72 bg-secondary-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-0 left-1/2 w-72 h-72 bg-primary-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col lg:flex-row items-center">
          {/* Hero content */}
          <div className="w-full lg:w-1/2 text-center lg:text-left mb-12 lg:mb-0">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
              Transforming Pharmaceutical Care in Nigeria
            </h1>
            <p className="text-xl text-gray-700 mb-8 max-w-2xl mx-auto lg:mx-0">
              PharmaSync is a comprehensive platform designed to empower pharmacists with tools for medication management, patient care, and business operations.
            </p>
            <div className="flex flex-col sm:flex-row justify-center lg:justify-start space-y-4 sm:space-y-0 sm:space-x-4">
              <Link to="/register">
                <Button variant="primary" size="lg">
                  Get Started
                </Button>
              </Link>
              <a href="#features">
                <Button variant="outline" size="lg">
                  Learn More
                </Button>
              </a>
            </div>
          </div>
          
          {/* Hero image */}
          <div className="w-full lg:w-1/2">
            <div className="relative">
              {/* Main image */}
              <div className="rounded-lg shadow-xl overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80" 
                  alt="Pharmacist using PharmaSync" 
                  className="w-full h-auto object-cover"
                />
              </div>
              
              {/* Floating card 1 */}
              <div className="absolute -top-6 -left-6 md:top-8 md:-left-12 bg-white p-4 rounded-lg shadow-lg max-w-xs hidden sm:block">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-primary-100 p-2 rounded-full">
                    <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">Medication Management</p>
                    <p className="text-xs text-gray-500">Streamlined and efficient</p>
                  </div>
                </div>
              </div>
              
              {/* Floating card 2 */}
              <div className="absolute -bottom-6 -right-6 md:bottom-8 md:-right-12 bg-white p-4 rounded-lg shadow-lg max-w-xs hidden sm:block">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-secondary-100 p-2 rounded-full">
                    <svg className="w-6 h-6 text-secondary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">Patient-Centered Care</p>
                    <p className="text-xs text-gray-500">Comprehensive profiles</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 text-center">
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-4xl font-bold text-primary-600 mb-2">500+</p>
            <p className="text-gray-600">Pharmacies Using PharmaSync</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-4xl font-bold text-primary-600 mb-2">50,000+</p>
            <p className="text-gray-600">Patients Managed</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-4xl font-bold text-primary-600 mb-2">99.9%</p>
            <p className="text-gray-600">System Uptime</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
