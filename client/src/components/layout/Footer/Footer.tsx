const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-200 py-4">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-2 md:mb-0">
            <p className="text-sm text-gray-500">
              &copy; {currentYear} PharmaSync. All rights reserved.
            </p>
          </div>
          <div className="flex space-x-4">
            <a
              href="#terms"
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Terms of Service
            </a>
            <a
              href="#privacy"
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Privacy Policy
            </a>
            <a
              href="#contact"
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Contact Us
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
