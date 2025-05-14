import { FaCheckCircle } from 'react-icons/fa';

const AboutSection = () => {
  return (
    <section id="about" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center">
          {/* Image column */}
          <div className="w-full lg:w-1/2 mb-12 lg:mb-0">
            <div className="relative">
              <div className="absolute inset-0 bg-primary-200 rounded-lg transform translate-x-4 translate-y-4"></div>
              <img 
                src="https://images.unsplash.com/photo-1563453392212-326f5e854473?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80" 
                alt="PharmaSync Team" 
                className="relative z-10 rounded-lg shadow-lg w-full h-auto"
              />
            </div>
          </div>
          
          {/* Content column */}
          <div className="w-full lg:w-1/2 lg:pl-16">
            <div className="text-sm font-semibold text-primary-600 uppercase tracking-wide mb-2">
              About Us
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Empowering Pharmacists Across Nigeria
            </h2>
            <p className="text-lg text-gray-600 mb-6">
              PharmaSync was founded with a mission to transform pharmaceutical care in Nigeria by providing pharmacists with modern, efficient tools to enhance patient care and streamline business operations.
            </p>
            <p className="text-lg text-gray-600 mb-8">
              Our team consists of experienced pharmacists, healthcare IT specialists, and software engineers who understand the unique challenges faced by Nigerian pharmacists. We're committed to continuous improvement and innovation to meet the evolving needs of the pharmacy profession.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {[
                'Founded in 2022',
                'Serving 500+ pharmacies',
                'Local support team',
                'Regular updates',
                'Data security focus',
                'Regulatory compliant',
              ].map((item, index) => (
                <div key={index} className="flex items-center">
                  <FaCheckCircle className="text-primary-600 mr-2 flex-shrink-0" />
                  <span className="text-gray-700">{item}</span>
                </div>
              ))}
            </div>
            
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <button className="btn-primary">
                Our Story
              </button>
              <button className="btn-outline">
                Meet The Team
              </button>
            </div>
          </div>
        </div>
        
        {/* Values section */}
        <div className="mt-20">
          <div className="text-center mb-12">
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              Our Core Values
            </h3>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              These principles guide everything we do at PharmaSync, from product development to customer support.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: 'Patient-Centered',
                description: 'We prioritize solutions that improve patient outcomes and enhance the quality of pharmaceutical care.',
                icon: (
                  <svg className="w-12 h-12 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                ),
              },
              {
                title: 'Innovation',
                description: 'We continuously seek new ways to improve our platform and address the evolving needs of pharmacists.',
                icon: (
                  <svg className="w-12 h-12 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                ),
              },
              {
                title: 'Integrity',
                description: 'We maintain the highest standards of honesty, transparency, and ethical conduct in all our operations.',
                icon: (
                  <svg className="w-12 h-12 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                ),
              },
            ].map((value, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md p-6 text-center">
                <div className="flex justify-center mb-4">
                  {value.icon}
                </div>
                <h4 className="text-xl font-semibold text-gray-900 mb-3">
                  {value.title}
                </h4>
                <p className="text-gray-600">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
