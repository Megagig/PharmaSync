import { useState } from 'react';

const testimonials = [
  {
    id: 1,
    content: "PharmaSync has completely transformed how we manage our pharmacy. The medication management system is intuitive, and the inventory tracking has saved us countless hours and reduced errors significantly.",
    author: "Dr. Adebayo Johnson",
    role: "Chief Pharmacist",
    company: "HealthPlus Pharmacy",
    image: "https://randomuser.me/api/portraits/men/32.jpg"
  },
  {
    id: 2,
    content: "As a busy community pharmacist, I needed a system that could keep up with our high volume of prescriptions while maintaining accuracy. PharmaSync delivers exactly that, plus the patient management features have helped us provide more personalized care.",
    author: "Pharm. Ngozi Okafor",
    role: "Owner",
    company: "Wellness Community Pharmacy",
    image: "https://randomuser.me/api/portraits/women/44.jpg"
  },
  {
    id: 3,
    content: "The drug interaction checker in PharmaSync has been a game-changer for our practice. It's caught several potential interactions that might have been missed, improving patient safety. The support team is also incredibly responsive.",
    author: "Pharm. Ibrahim Musa",
    role: "Hospital Pharmacist",
    company: "Lagos University Teaching Hospital",
    image: "https://randomuser.me/api/portraits/men/67.jpg"
  },
  {
    id: 4,
    content: "We've been using PharmaSync for over a year now, and it has streamlined our operations tremendously. The inventory management system has reduced our stockouts by 60%, and the reporting features give us valuable insights into our business performance.",
    author: "Pharm. Chioma Eze",
    role: "Managing Director",
    company: "MedPlus Pharmacy Chain",
    image: "https://randomuser.me/api/portraits/women/28.jpg"
  },
  {
    id: 5,
    content: "The clinical decision support tools in PharmaSync have elevated the level of care we provide to our patients. It's like having a clinical pharmacist consultant at your fingertips. Highly recommended for any pharmacy serious about pharmaceutical care.",
    author: "Dr. Oluwaseun Adeyemi",
    role: "Clinical Pharmacist",
    company: "Premier Medical Center",
    image: "https://randomuser.me/api/portraits/men/15.jpg"
  }
];

const TestimonialsSection = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  const nextTestimonial = () => {
    setActiveIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setActiveIndex((prevIndex) => (prevIndex - 1 + testimonials.length) % testimonials.length);
  };

  const goToTestimonial = (index: number) => {
    setActiveIndex(index);
  };

  return (
    <section className="py-20 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            What Our Users Say
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Hear from pharmacists who have transformed their practice with PharmaSync.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="relative bg-white rounded-xl shadow-lg p-8 md:p-12">
            {/* Quote icon */}
            <div className="absolute top-0 left-0 transform -translate-x-4 -translate-y-4">
              <svg className="w-16 h-16 text-primary-100" fill="currentColor" viewBox="0 0 32 32" aria-hidden="true">
                <path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.8 3.456-8.256 9.12-8.256 15.36 0 5.088 3.072 8.064 6.624 8.064 3.264 0 5.856-2.688 5.856-5.856 0-3.168-2.304-5.472-5.184-5.472-.576 0-1.248.096-1.44.192.48-3.264 3.456-7.104 6.528-9.024L25.864 4z" />
              </svg>
            </div>

            {/* Testimonial content */}
            <div className="relative">
              <p className="text-xl md:text-2xl text-gray-700 italic mb-8">
                "{testimonials[activeIndex].content}"
              </p>
              
              <div className="flex items-center">
                <img 
                  src={testimonials[activeIndex].image} 
                  alt={testimonials[activeIndex].author}
                  className="w-12 h-12 rounded-full object-cover mr-4"
                />
                <div>
                  <p className="font-semibold text-gray-900">{testimonials[activeIndex].author}</p>
                  <p className="text-gray-600">{testimonials[activeIndex].role}, {testimonials[activeIndex].company}</p>
                </div>
              </div>
            </div>

            {/* Navigation arrows */}
            <div className="absolute top-1/2 left-0 transform -translate-y-1/2 -translate-x-6">
              <button 
                onClick={prevTestimonial}
                className="w-12 h-12 rounded-full bg-white shadow-md flex items-center justify-center text-gray-600 hover:text-primary-600 focus:outline-none"
                aria-label="Previous testimonial"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            </div>
            
            <div className="absolute top-1/2 right-0 transform -translate-y-1/2 translate-x-6">
              <button 
                onClick={nextTestimonial}
                className="w-12 h-12 rounded-full bg-white shadow-md flex items-center justify-center text-gray-600 hover:text-primary-600 focus:outline-none"
                aria-label="Next testimonial"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>

          {/* Dots navigation */}
          <div className="flex justify-center mt-8 space-x-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => goToTestimonial(index)}
                className={`w-3 h-3 rounded-full focus:outline-none ${
                  index === activeIndex ? 'bg-primary-600' : 'bg-gray-300'
                }`}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="text-4xl font-bold text-primary-600 mb-2">98%</div>
            <p className="text-gray-700">Customer Satisfaction</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="text-4xl font-bold text-primary-600 mb-2">30%</div>
            <p className="text-gray-700">Increase in Efficiency</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="text-4xl font-bold text-primary-600 mb-2">45%</div>
            <p className="text-gray-700">Reduction in Errors</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
