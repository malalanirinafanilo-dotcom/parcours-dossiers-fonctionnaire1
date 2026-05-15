import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  BarChart3, 
  Zap, 
  Users, 
  TrendingUp, 
  Shield,
  CheckCircle,
  ArrowRight,
  Menu,
  X,
  Globe,
  Clock,
  FileText,
  Star,
  ChevronRight,
  Mail,
  MapPin,
  Phone
} from 'lucide-react';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [websiteUrl, setWebsiteUrl] = useState('');

  const handleAnalyze = () => {
    if (websiteUrl.trim()) {
      navigate('/login');
    } else {
      alert('Veuillez entrer une URL de site web');
    }
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setMobileMenuOpen(false);
  };

  const features = [
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: 'Analyse SEO Complète',
      description: 'Analyse approfondie de votre site web avec recommandations personnalisées',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: 'Performance Optimisée',
      description: 'Améliorez la vitesse et les performances de votre site pour un meilleur référencement',
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: 'Suivi des Progrès',
      description: 'Visualisez l\'évolution de votre score SEO au fil du temps',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: 'Sécurité & Confidentialité',
      description: 'Vos données sont sécurisées et restent confidentielles',
      color: 'from-orange-500 to-red-500'
    }
  ];

  const stats = [
    { value: '10K+', label: 'Sites Analysés', icon: <Globe className="w-5 h-5" /> },
    { value: '98%', label: 'Satisfaction Client', icon: <Star className="w-5 h-5" /> },
    { value: '24/7', label: 'Support Disponible', icon: <Clock className="w-5 h-5" /> },
    { value: '500+', label: 'Études de Cas', icon: <FileText className="w-5 h-5" /> }
  ];

  const testimonials = [
    {
      name: 'Jean Rakoto',
      role: 'Digital Manager',
      content: 'Une plateforme exceptionnelle qui a transformé notre stratégie SEO. Les analyses sont précises et les recommandations directement applicables.',
      rating: 5
    },
    {
      name: 'Marie Rasoa',
      role: 'SEO Consultant',
      content: 'L\'outil le plus complet que j\'ai utilisé. L\'interface est intuitive et les résultats sont immédiats.',
      rating: 5
    },
    {
      name: 'Paul Rabe',
      role: 'Entrepreneur',
      content: 'Grâce à cette analyse, j\'ai pu doubler le trafic de mon site en 3 mois. Je recommande vivement !',
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-md z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => scrollToSection('hero')}>
              <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">S</span>
              </div>
              <span className="font-bold text-xl bg-gradient-to-r from-green-600 to-green-500 bg-clip-text text-transparent">
                SEOTime
              </span>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-8">
              <button onClick={() => scrollToSection('hero')} className="text-gray-600 hover:text-green-600 transition-colors">Accueil</button>
              <button onClick={() => scrollToSection('features')} className="text-gray-600 hover:text-green-600 transition-colors">Fonctionnalités</button>
              <button onClick={() => scrollToSection('whatis')} className="text-gray-600 hover:text-green-600 transition-colors">Qu'est-ce que le SEO?</button>
              <button onClick={() => scrollToSection('casestudies')} className="text-gray-600 hover:text-green-600 transition-colors">Études de cas</button>
              <button onClick={() => scrollToSection('blog')} className="text-gray-600 hover:text-green-600 transition-colors">Blog</button>
              <button onClick={() => scrollToSection('contact')} className="text-gray-600 hover:text-green-600 transition-colors">Contact</button>
            </div>

            {/* CTA Button */}
            <div className="hidden md:block">
              <button
                onClick={() => navigate('/login')}
                className="bg-gradient-to-r from-green-600 to-green-500 text-white px-5 py-2 rounded-xl font-medium hover:shadow-lg hover:shadow-green-200 transition-all hover:scale-105"
              >
                Analyse SEO Gratuite
              </button>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 py-4 px-4 animate-slide-down">
            <div className="flex flex-col gap-3">
              <button onClick={() => scrollToSection('hero')} className="text-gray-600 hover:text-green-600 transition-colors py-2">Accueil</button>
              <button onClick={() => scrollToSection('features')} className="text-gray-600 hover:text-green-600 transition-colors py-2">Fonctionnalités</button>
              <button onClick={() => scrollToSection('whatis')} className="text-gray-600 hover:text-green-600 transition-colors py-2">Qu'est-ce que le SEO?</button>
              <button onClick={() => scrollToSection('casestudies')} className="text-gray-600 hover:text-green-600 transition-colors py-2">Études de cas</button>
              <button onClick={() => scrollToSection('blog')} className="text-gray-600 hover:text-green-600 transition-colors py-2">Blog</button>
              <button onClick={() => scrollToSection('contact')} className="text-gray-600 hover:text-green-600 transition-colors py-2">Contact</button>
              <button
                onClick={() => navigate('/login')}
                className="bg-gradient-to-r from-green-600 to-green-500 text-white px-5 py-2 rounded-xl font-medium mt-2"
              >
                Analyse SEO Gratuite
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section id="hero" className="pt-24 pb-16 md:pt-32 md:pb-24 bg-gradient-to-br from-green-600 via-green-500 to-emerald-600 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 animate-fade-in">
              Let's Analyze Your Website SEO
            </h1>
            <p className="text-xl text-green-100 mb-10 animate-slide-up">
              Now you can customize your SEO service according to your need
            </p>

            {/* Search Box */}
            <div className="bg-white rounded-2xl shadow-2xl p-2 max-w-2xl mx-auto animate-scale-in">
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  placeholder="Add your website url"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  className="flex-1 px-5 py-3 text-gray-700 placeholder-gray-400 focus:outline-none rounded-xl"
                />
                <button
                  onClick={handleAnalyze}
                  className="bg-gradient-to-r from-green-600 to-green-500 text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg transition-all hover:scale-105 flex items-center justify-center gap-2"
                >
                  <Search size={18} />
                  Analysis
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16">
              {stats.map((stat, index) => (
                <div key={index} className="text-center animate-slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
                  <div className="flex items-center justify-center text-green-200 mb-2">
                    {stat.icon}
                  </div>
                  <div className="text-2xl md:text-3xl font-bold text-white">{stat.value}</div>
                  <div className="text-sm text-green-200">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 md:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Owners: Promote your site on Google searches
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Discover our powerful tools to boost your online presence
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-6 shadow-soft hover:shadow-elevated transition-all hover:-translate-y-1 animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${feature.color} flex items-center justify-center text-white mb-4 shadow-lg`}>
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What is SEO Section */}
      <section id="whatis" className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                What is SEO?
              </h2>
              <div className="w-20 h-1 bg-gradient-to-r from-green-500 to-green-600 rounded-full mb-6"></div>
              <p className="text-lg text-gray-600 mb-6">
                Search Engine Optimization (SEO) is the practice of optimizing your website to 
                increase its visibility when people search for products or services related to 
                your business on Google, Bing, and other search engines.
              </p>
              <p className="text-gray-600 mb-8">
                The better visibility your pages have in search results, the more likely you are 
                to garner attention and attract prospective and existing customers to your business.
              </p>
              <button
                onClick={() => navigate('/login')}
                className="inline-flex items-center gap-2 text-green-600 font-medium hover:text-green-700 transition-colors group"
              >
                Learn more about SEO
                <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
            <div className="relative animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-3xl p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">+143%</div>
                    <div className="text-sm text-gray-600">Average traffic increase</div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-gray-700">
                    <CheckCircle size={20} className="text-green-500 flex-shrink-0" />
                    <span>Better visibility in search results</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-700">
                    <CheckCircle size={20} className="text-green-500 flex-shrink-0" />
                    <span>Increased organic traffic</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-700">
                    <CheckCircle size={20} className="text-green-500 flex-shrink-0" />
                    <span>Higher conversion rates</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-700">
                    <CheckCircle size={20} className="text-green-500 flex-shrink-0" />
                    <span>Better user experience</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Case Studies Section */}
      <section id="casestudies" className="py-16 md:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Success Stories
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              See how our clients achieved remarkable results with our SEO solutions
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-6 shadow-soft hover:shadow-elevated transition-all animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} size={16} className="fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4 italic">"{testimonial.content}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center text-white font-semibold">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-500">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Blog Section */}
      <section id="blog" className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Latest from our blog
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Stay updated with the latest SEO trends and strategies
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((_, index) => (
              <div key={index} className="group cursor-pointer animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="bg-gray-100 rounded-2xl h-48 mb-4 overflow-hidden">
                  <div className="w-full h-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white text-4xl">
                    📝
                  </div>
                </div>
                <div className="text-sm text-green-600 mb-2">SEO Tips • {new Date().toLocaleDateString('fr-FR')}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-green-600 transition-colors">
                  {index === 0 && '10 SEO Strategies That Actually Work in 2024'}
                  {index === 1 && 'How to Optimize Your Content for Featured Snippets'}
                  {index === 2 && 'The Ultimate Guide to Local SEO Success'}
                </h3>
                <p className="text-gray-600">
                  Discover proven strategies to improve your search engine rankings and drive more organic traffic...
                </p>
                <button className="mt-4 text-green-600 font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                  Read more
                  <ArrowRight size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-20 bg-gradient-to-r from-green-600 to-green-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to boost your SEO?
          </h2>
          <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied customers who have improved their search engine rankings
          </p>
          <button
            onClick={() => navigate('/login')}
            className="bg-white text-green-600 px-8 py-3 rounded-xl font-semibold hover:shadow-lg transition-all hover:scale-105 inline-flex items-center gap-2"
          >
            Get Started Free
            <ArrowRight size={18} />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">S</span>
                </div>
                <span className="font-bold text-xl text-white">SEOTime</span>
              </div>
              <p className="text-gray-400 text-sm mb-4">
                Your trusted partner for SEO analysis and optimization
              </p>
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-green-600 transition-colors cursor-pointer">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
                </div>
                <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-green-600 transition-colors cursor-pointer">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z"/></svg>
                </div>
                <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-green-600 transition-colors cursor-pointer">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zM5.838 12c0-3.402 2.76-6.162 6.162-6.162s6.162 2.76 6.162 6.162-2.76 6.162-6.162 6.162-6.162-2.76-6.162-6.162zM12 16c-2.209 0-4-1.791-4-4s1.791-4 4-4 4 1.791 4 4-1.791 4-4 4zm4.406-10.845c.796 0 1.441.645 1.441 1.441s-.645 1.441-1.441 1.441-1.441-.645-1.441-1.441.645-1.441 1.441-1.441z"/></svg>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-4">Quick Links</h3>
              <ul className="space-y-2 text-gray-400">
                <li><button onClick={() => scrollToSection('hero')} className="hover:text-white transition-colors">Home</button></li>
                <li><button onClick={() => scrollToSection('features')} className="hover:text-white transition-colors">Features</button></li>
                <li><button onClick={() => scrollToSection('whatis')} className="hover:text-white transition-colors">What is SEO?</button></li>
                <li><button onClick={() => scrollToSection('casestudies')} className="hover:text-white transition-colors">Case Studies</button></li>
                <li><button onClick={() => scrollToSection('blog')} className="hover:text-white transition-colors">Blog</button></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-4">Resources</h3>
              <ul className="space-y-2 text-gray-400">
                <li><button className="hover:text-white transition-colors">SEO Guide</button></li>
                <li><button className="hover:text-white transition-colors">Keyword Tool</button></li>
                <li><button className="hover:text-white transition-colors">Backlink Checker</button></li>
                <li><button className="hover:text-white transition-colors">Site Audit</button></li>
                <li><button className="hover:text-white transition-colors">Help Center</button></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-4">Contact</h3>
              <ul className="space-y-2 text-gray-400">
                <li className="flex items-center gap-2">
                  <Mail size={16} />
                  <span>contact@seotime.com</span>
                </li>
                <li className="flex items-center gap-2">
                  <Phone size={16} />
                  <span>+261 34 12 345 67</span>
                </li>
                <li className="flex items-center gap-2">
                  <MapPin size={16} />
                  <span>Antananarivo, Madagascar</span>
                </li>
              </ul>
              <div className="mt-4">
                <div className="flex gap-2">
                  <input
                    type="email"
                    placeholder="Your email"
                    className="flex-1 px-4 py-2 bg-gray-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  <button className="bg-green-600 px-4 py-2 rounded-lg hover:bg-green-500 transition-colors">
                    Subscribe
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Get the latest SEO tips in your inbox
                </p>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-500 text-sm">
            <p>&copy; 2024 SEOTime. All rights reserved. Designed for Madagascar Ministry of Education.</p>
            <div className="flex justify-center gap-6 mt-2">
              <button className="hover:text-white transition-colors">Privacy Policy</button>
              <button className="hover:text-white transition-colors">Terms of Service</button>
              <button className="hover:text-white transition-colors">Cookie Policy</button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;