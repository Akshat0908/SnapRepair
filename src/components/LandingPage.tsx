import { Wrench, Camera, Zap, Shield, ArrowRight, Star, CheckCircle, Clock, Users } from 'lucide-react';

type LandingPageProps = {
  onGetStarted: () => void;
};

export function LandingPage({ onGetStarted }: LandingPageProps) {
  const services = [
    { icon: Wrench, name: 'Plumbing', color: 'bg-blue-500' },
    { icon: Zap, name: 'Electrical', color: 'bg-yellow-500' },
    { icon: Shield, name: 'AC Repair', color: 'bg-green-500' },
    { icon: Camera, name: 'Appliances', color: 'bg-purple-500' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center">
                <Wrench className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-900">SnapRepair</span>
            </div>
            <button
              onClick={onGetStarted}
              className="bg-orange-500 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-orange-600 transition"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      <section className="bg-gradient-to-br from-orange-50 to-white py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-block bg-orange-100 text-orange-600 px-4 py-2 rounded-full text-sm font-semibold mb-6">
                AI-Powered Diagnostics
              </div>
              <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                Home Repairs Made Simple
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Snap a photo, get instant AI diagnosis, and connect with verified experts.
                Fix any household issue in minutes.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={onGetStarted}
                  className="bg-orange-500 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-orange-600 transition flex items-center justify-center gap-2"
                >
                  Book a Service
                  <ArrowRight className="w-5 h-5" />
                </button>
                <button className="bg-white text-gray-900 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-50 transition border-2 border-gray-200">
                  How It Works
                </button>
              </div>
              <div className="flex items-center gap-8 mt-10">
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    <div className="w-8 h-8 bg-blue-500 rounded-full border-2 border-white"></div>
                    <div className="w-8 h-8 bg-green-500 rounded-full border-2 border-white"></div>
                    <div className="w-8 h-8 bg-purple-500 rounded-full border-2 border-white"></div>
                  </div>
                  <span className="text-sm font-medium text-gray-600">2000+ Happy Customers</span>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-bold text-gray-900">4.8</span>
                  <span className="text-sm text-gray-600">(500+ reviews)</span>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <div className="aspect-video bg-gradient-to-br from-orange-100 to-orange-50 rounded-xl mb-6 flex items-center justify-center">
                  <Camera className="w-20 h-20 text-orange-500" />
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-lg">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Upload Photo</p>
                      <p className="text-sm text-gray-600">Quick & Easy</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-lg">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Zap className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">AI Analysis</p>
                      <p className="text-sm text-gray-600">Instant Results</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-lg">
                    <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                      <Users className="w-6 h-6 text-orange-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Expert Help</p>
                      <p className="text-sm text-gray-600">Verified Technicians</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Our Services
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Professional repair services for all your household needs
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service, index) => (
              <div
                key={index}
                className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-orange-500 hover:shadow-lg transition cursor-pointer"
              >
                <div className={`w-14 h-14 ${service.color} rounded-xl flex items-center justify-center mb-4`}>
                  <service.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{service.name}</h3>
                <p className="text-gray-600 text-sm">Professional {service.name.toLowerCase()} services</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Us
            </h2>
            <p className="text-lg text-gray-600">
              Fast, reliable, and affordable home repair services
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl p-8 shadow-sm">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Quick Response</h3>
              <p className="text-gray-600">
                Get instant AI diagnosis and connect with experts in minutes, not hours
              </p>
            </div>
            <div className="bg-white rounded-xl p-8 shadow-sm">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Verified Experts</h3>
              <p className="text-gray-600">
                All our technicians are certified, background-checked, and highly rated
              </p>
            </div>
            <div className="bg-white rounded-xl p-8 shadow-sm">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Guaranteed Work</h3>
              <p className="text-gray-600">
                100% satisfaction guarantee on all services with transparent pricing
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-lg text-gray-600">
              Get your repair done in three simple steps
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-500 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                1
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Submit Issue</h3>
              <p className="text-gray-600">
                Take a photo or video of your problem and describe what's wrong
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-500 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                2
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Get Diagnosis</h3>
              <p className="text-gray-600">
                Our AI analyzes the issue and provides instant troubleshooting steps
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-500 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                3
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Book Expert</h3>
              <p className="text-gray-600">
                Connect with a verified technician for remote or on-site support
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Pricing Plans
            </h2>
            <p className="text-lg text-gray-600">
              Choose the plan that works for you
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-white rounded-xl p-8 border-2 border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Free</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold text-gray-900">₹0</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-gray-600">AI Diagnosis</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-gray-600">Troubleshooting Steps</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-gray-600">Safety Warnings</span>
                </li>
              </ul>
              <button
                onClick={onGetStarted}
                className="w-full bg-gray-100 text-gray-900 px-6 py-3 rounded-lg font-semibold hover:bg-gray-200 transition"
              >
                Get Started
              </button>
            </div>

            <div className="bg-orange-500 text-white rounded-xl p-8 border-2 border-orange-500 shadow-xl transform scale-105">
              <div className="inline-block bg-white text-orange-500 px-3 py-1 rounded-full text-xs font-bold mb-4">
                POPULAR
              </div>
              <h3 className="text-xl font-bold mb-2">Remote Consult</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold">₹199</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  <span>Everything in Free</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  <span>Live Chat Support</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  <span>Video Consultation</span>
                </li>
              </ul>
              <button
                onClick={onGetStarted}
                className="w-full bg-white text-orange-500 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition"
              >
                Get Started
              </button>
            </div>

            <div className="bg-white rounded-xl p-8 border-2 border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 mb-2">On-Site Visit</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold text-gray-900">₹399+</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-gray-600">Everything in Remote</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-gray-600">Home Visit</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-gray-600">Hands-on Repair</span>
                </li>
              </ul>
              <button
                onClick={onGetStarted}
                className="w-full bg-gray-100 text-gray-900 px-6 py-3 rounded-lg font-semibold hover:bg-gray-200 transition"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-orange-500">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Fix Your Home Issues?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Join thousands of happy customers who trust SnapRepair
          </p>
          <button
            onClick={onGetStarted}
            className="bg-white text-orange-500 px-10 py-4 rounded-lg font-bold text-lg hover:bg-gray-50 transition inline-flex items-center gap-2"
          >
            Book Your Service Now
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                  <Wrench className="w-5 h-5 text-white" />
                </div>
                <span className="text-lg font-bold">SnapRepair</span>
              </div>
              <p className="text-gray-400 text-sm">
                Your trusted partner for home repairs and maintenance
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Services</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition">Plumbing</a></li>
                <li><a href="#" className="hover:text-white transition">Electrical</a></li>
                <li><a href="#" className="hover:text-white transition">AC Repair</a></li>
                <li><a href="#" className="hover:text-white transition">Appliances</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition">About Us</a></li>
                <li><a href="#" className="hover:text-white transition">Contact</a></li>
                <li><a href="#" className="hover:text-white transition">Careers</a></li>
                <li><a href="#" className="hover:text-white transition">Blog</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition">Refund Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2025 SnapRepair. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
