import { useState } from 'react';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';

const faqs = [
  {
    question: 'What is PharmaSync?',
    answer: 'PharmaSync is a comprehensive pharmaceutical care web application designed specifically for pharmacists in Nigeria. It provides tools for medication management, patient profiles, drug interactions, inventory management, and clinical decision support to enhance pharmaceutical care and streamline pharmacy operations.'
  },
  {
    question: 'How secure is my pharmacy and patient data?',
    answer: 'PharmaSync takes data security very seriously. We implement industry-standard encryption, secure authentication, regular backups, and strict access controls. Our platform is compliant with relevant data protection regulations to ensure your pharmacy and patient data remains secure and confidential.'
  },
  {
    question: 'Can I access PharmaSync on mobile devices?',
    answer: 'Yes, PharmaSync is fully responsive and can be accessed on smartphones and tablets. This allows you to manage your pharmacy operations and access patient information on the go, providing flexibility in how you deliver pharmaceutical care.'
  },
  {
    question: 'Is training provided for new users?',
    answer: 'Absolutely! We provide comprehensive training for all new users. This includes video tutorials, documentation, and live training sessions. Our support team is also available to answer questions and provide guidance as you get started with PharmaSync.'
  },
  {
    question: 'How does the medication management system work?',
    answer: 'Our medication management system includes a comprehensive database of medications with detailed information on dosing, contraindications, side effects, and interactions. You can easily search for medications, check for potential interactions, and maintain accurate inventory records. The system also supports prescription processing and dispensing workflows.'
  },
  {
    question: 'Can PharmaSync integrate with other pharmacy systems?',
    answer: 'Yes, PharmaSync is designed with integration capabilities. We offer APIs that allow for integration with other pharmacy systems, including point-of-sale systems, accounting software, and electronic health records. This helps create a seamless workflow across your pharmacy operations.'
  },
  {
    question: 'What kind of support is available?',
    answer: 'We offer multiple levels of support, including email, chat, and phone support during business hours. Our dedicated support team consists of both technical experts and pharmacy professionals who understand your needs. We also provide regular system updates and maintenance to ensure optimal performance.'
  },
  {
    question: 'How much does PharmaSync cost?',
    answer: 'PharmaSync offers flexible pricing plans based on the size of your pharmacy and the features you need. We have options for independent pharmacies, small chains, and large organizations. Please contact our sales team for a customized quote that meets your specific requirements.'
  }
];

const FaqSection = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Find answers to common questions about PharmaSync and how it can benefit your pharmacy practice.
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <div 
                key={index} 
                className="bg-gray-50 rounded-lg overflow-hidden border border-gray-200"
              >
                <button
                  className="flex justify-between items-center w-full px-6 py-4 text-left focus:outline-none"
                  onClick={() => toggleFaq(index)}
                  aria-expanded={openIndex === index}
                >
                  <span className="text-lg font-medium text-gray-900">{faq.question}</span>
                  <span className="ml-6 flex-shrink-0 text-primary-600">
                    {openIndex === index ? <FaChevronUp /> : <FaChevronDown />}
                  </span>
                </button>
                <div 
                  className={`px-6 pb-4 ${openIndex === index ? 'block' : 'hidden'}`}
                >
                  <p className="text-gray-600">{faq.answer}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-6">
            Still have questions? We're here to help!
          </p>
          <a 
            href="#contact" 
            className="btn-primary inline-flex items-center"
          >
            Contact Us
            <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
};

export default FaqSection;
