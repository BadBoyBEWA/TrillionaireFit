import SocialFollow from '@/components/social/SocialFollow';

export function Footer() {
  return (
    <footer className="border-t border-zinc-200 bg-gray-50">
      <div className="container-responsive py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="md:col-span-2">
            <h3 className="text-lg font-semibold text-gray-900 font-luxury-display mb-4">
              Trillionaire Fit
            </h3>
            <p className="text-gray-600 font-luxury-elegant mb-4">
              Your premier destination for luxury fashion and exclusive designer pieces. 
              Discover the finest collection of men's and women's clothing.
            </p>
            <SocialFollow />
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 font-luxury-heading mb-4">
              Quick Links
            </h4>
            <nav className="space-y-2">
              <a className="block text-gray-600 hover:text-gray-900 transition-colors font-luxury-elegant" href="/">
                Home
              </a>
              <a className="block text-gray-600 hover:text-gray-900 transition-colors font-luxury-elegant" href="/men">
                Men's Collection
              </a>
              {/* <a className="block text-gray-600 hover:text-gray-900 transition-colors font-luxury-elegant" href="/women">
                Women's Collection
              </a> */}
              <a className="block text-gray-600 hover:text-gray-900 transition-colors font-luxury-elegant" href="/new-in">
                New Arrivals
              </a>
              <a className="block text-gray-600 hover:text-gray-900 transition-colors font-luxury-elegant" href="/sale">
                Sale
              </a>
            </nav>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 font-luxury-heading mb-4">
              Customer Service
            </h4>
            <nav className="space-y-2">
              <a className="block text-gray-600 hover:text-gray-900 transition-colors font-luxury-elegant" href="/about">
                About Us
              </a>
              <a className="block text-gray-600 hover:text-gray-900 transition-colors font-luxury-elegant" href="#">
                Contact
              </a>
              <a className="block text-gray-600 hover:text-gray-900 transition-colors font-luxury-elegant" href="#">
                Shipping Info
              </a>
              <a className="block text-gray-600 hover:text-gray-900 transition-colors font-luxury-elegant" href="#">
                Returns
              </a>
              <a className="block text-gray-600 hover:text-gray-900 transition-colors font-luxury-elegant" href="#">
                Size Guide
              </a>
            </nav>
          </div>
        </div>

        <div className="border-t border-gray-200 mt-8 pt-8 flex flex-col md:flex-row md:items-center md:justify-between">
          <p className="text-sm text-gray-600 font-luxury-elegant">
          © {new Date().getFullYear()} Trillionaire Fit. All rights reserved.
        </p>
          <nav className="flex items-center gap-6 mt-4 md:mt-0">
            <a className="text-gray-600 hover:text-gray-900 transition-colors font-luxury-elegant" href="#">
              Privacy Policy
            </a>
            <a className="text-gray-600 hover:text-gray-900 transition-colors font-luxury-elegant" href="#">
              Terms of Service
            </a>
            <a className="text-gray-600 hover:text-gray-900 transition-colors font-luxury-elegant" href="#">
              Cookie Policy
            </a>
        </nav>
        </div>
      </div>
    </footer>
  );
}
