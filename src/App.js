// App.js (fixed)
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import Login from './components/Login';
import Signup from './components/Signup';
import UserDashboard from './components/UserDashboard';
import AdminDashboard from './components/AdminDashboard';
import About from './components/About';
import Reviews from './components/Reviews';
import Contact from './components/Contact';
import Navbar from './components/Navbar';
import './App.css';

// ScrollToTop component to handle scrolling to top on route change
const ScrollToTop = () => {
  const { pathname } = useLocation();
  
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }, [pathname]);
  
  return null;
};

// Loader component with image
const Loader = () => {
  return (
    <div className="loader-container">
      <div className="loader-content">
        <img 
          src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTx7wbYPF8m8yklzjlsGpMG-S3yEHP1fRoiTA&s" 
          alt="Loading..." 
          className="loader-image"
        />
        <p className="loader-text">Loading Salon Excellence...</p>
      </div>
    </div>
  );
};

function App() {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [loading, setLoading] = useState(true);
  const [homeData, setHomeData] = useState({
    stats: {
      happyCustomers: 0,
      expertStylists: 0,
      yearsExperience: 0,
      servicesOffered: 0
    },
    services: [
      {
        id: 1,
        name: "Hair Cutting & Styling",
        description: "Precision cuts and trendy styles by expert stylists",
        icon: "✂️",
        price: "From $30"
      },
      {
        id: 2,
        name: "Hair Coloring",
        description: "Professional coloring, highlights, and balayage",
        icon: "🎨",
        price: "From $50"
      },
      {
        id: 3,
        name: "Manicure & Pedicure",
        description: "Luxury nail care with premium products",
        icon: "💅",
        price: "From $25"
      },
      {
        id: 4,
        name: "Facial Treatments",
        description: "Rejuvenating facials for glowing skin",
        icon: "✨",
        price: "From $40"
      },
      {
        id: 5,
        name: "Bridal Makeup",
        description: "Special occasion makeup for your big day",
        icon: "👰",
        price: "From $80"
      },
      {
        id: 6,
        name: "Hair Treatments",
        description: "Deep conditioning and keratin treatments",
        icon: "💆",
        price: "From $35"
      }
    ],
    testimonials: [
      {
        id: 1,
        name: "Sarah Johnson",
        rating: 5,
        comment: "Best salon in town! The stylists are incredibly talented and professional.",
        image: "https://randomuser.me/api/portraits/women/1.jpg"
      },
      {
        id: 2,
        name: "Michael Chen",
        rating: 5,
        comment: "Great atmosphere and excellent service. My new go-to place for haircuts.",
        image: "https://randomuser.me/api/portraits/men/2.jpg"
      },
      {
        id: 3,
        name: "Emily Rodriguez",
        rating: 5,
        comment: "Love the results! The coloring work is absolutely amazing.",
        image: "https://randomuser.me/api/portraits/women/3.jpg"
      }
    ],
    features: [
      {
        id: 1,
        title: "Expert Stylists",
        description: "Our team consists of certified professionals with years of experience",
        icon: "👩‍🎨"
      },
      {
        id: 2,
        title: "Premium Products",
        description: "We use only high-quality, professional-grade products",
        icon: "🌟"
      },
      {
        id: 3,
        title: "Hygienic Environment",
        description: "Strict sanitation protocols for your safety",
        icon: "🧼"
      },
      {
        id: 4,
        title: "Easy Booking",
        description: "Book appointments online 24/7 with our simple system",
        icon: "📅"
      }
    ]
  });

  useEffect(() => {
    // Simulate initial loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);

    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      setIsAdmin(parsedUser.isAdmin === true);
    }

    // Animate stats counter
    const targetStats = {
      happyCustomers: 5000,
      expertStylists: 25,
      yearsExperience: 10,
      servicesOffered: 50
    };

    const duration = 2000; // 2 seconds
    const steps = 60;
    const increment = {
      happyCustomers: Math.ceil(targetStats.happyCustomers / steps),
      expertStylists: Math.ceil(targetStats.expertStylists / steps),
      yearsExperience: Math.ceil(targetStats.yearsExperience / steps),
      servicesOffered: Math.ceil(targetStats.servicesOffered / steps)
    };

    let currentStep = 0;
    const interval = setInterval(() => {
      if (currentStep < steps) {
        setHomeData(prev => ({
          ...prev,
          stats: {
            happyCustomers: Math.min(prev.stats.happyCustomers + increment.happyCustomers, targetStats.happyCustomers),
            expertStylists: Math.min(prev.stats.expertStylists + increment.expertStylists, targetStats.expertStylists),
            yearsExperience: Math.min(prev.stats.yearsExperience + increment.yearsExperience, targetStats.yearsExperience),
            servicesOffered: Math.min(prev.stats.servicesOffered + increment.servicesOffered, targetStats.servicesOffered)
          }
        }));
        currentStep++;
      } else {
        clearInterval(interval);
      }
    }, duration / steps);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    setIsAdmin(false);
  };

  const triggerRefresh = () => {
    setRefreshKey(prevKey => prevKey + 1);
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, index) => (
      <span key={index} className={`star ${index < rating ? 'filled' : ''}`}>★</span>
    ));
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <Router>
      <ScrollToTop />
      <div className="App">
        <Navbar user={user} isAdmin={isAdmin} onLogout={handleLogout} />
        
        <Routes>
          <Route path="/" element={
            <div className="home-page">
              {/* Hero Section */}
              <section className="hero-section">
                <div className="hero-content">
                  <h1 className="hero-title">Welcome to Salon Excellence</h1>
                  <p className="hero-subtitle">Experience the best in hair and beauty care</p>
                  <p className="hero-description">
                    Where luxury meets comfort. Our expert stylists are dedicated to 
                    bringing out your natural beauty with personalized care and attention.
                  </p>
                  {!user && (
                    <div className="hero-buttons">
                      <Link to="/login" className="btn btn-primary btn-large">Get Started</Link>
                      <Link to="/signup" className="btn btn-secondary btn-large">Join Now</Link>
                    </div>
                  )}
                  {user && !isAdmin && (
                    <div className="hero-buttons">
                      <Link to="/user" className="btn btn-primary btn-large">Go to Dashboard</Link>
                    </div>
                  )}
                  {user && isAdmin && (
                    <div className="hero-buttons">
                      <Link to="/admin" className="btn btn-primary btn-large">Go to Admin Dashboard</Link>
                    </div>
                  )}
                </div>
                <div className="hero-image">
                  <img src="https://images.unsplash.com/photo-1560066984-138dadb4c035?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80" 
                       alt="Salon interior" 
                       className="hero-img" />
                </div>
              </section>

              {/* Stats Section */}
              <section className="stats-section">
                <div className="stats-container">
                  <div className="stat-item">
                    <div className="stat-icon">😊</div>
                    <div className="stat-number">{homeData.stats.happyCustomers}+</div>
                    <div className="stat-label">Happy Customers</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-icon">💇</div>
                    <div className="stat-number">{homeData.stats.expertStylists}</div>
                    <div className="stat-label">Expert Stylists</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-icon">⭐</div>
                    <div className="stat-number">{homeData.stats.yearsExperience}+</div>
                    <div className="stat-label">Years Experience</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-icon">✨</div>
                    <div className="stat-number">{homeData.stats.servicesOffered}+</div>
                    <div className="stat-label">Services Offered</div>
                  </div>
                </div>
              </section>

              {/* Features Section */}
              <section className="features-section">
                <h2 className="section-title">Why Choose Us</h2>
                <div className="features-grid">
                  {homeData.features.map(feature => (
                    <div key={feature.id} className="feature-card">
                      <div className="feature-icon">{feature.icon}</div>
                      <h3 className="feature-title">{feature.title}</h3>
                      <p className="feature-description">{feature.description}</p>
                    </div>
                  ))}
                </div>
              </section>

              {/* Services Section */}
              <section className="services-section">
                <h2 className="section-title">Our Services</h2>
                <div className="services-grid">
                  {homeData.services.map(service => (
                    <div key={service.id} className="service-card">
                      <div className="service-icon">{service.icon}</div>
                      <h3 className="service-name">{service.name}</h3>
                      <p className="service-description">{service.description}</p>
                      <div className="service-price">{service.price}</div>
                      {user && !isAdmin && (
                        <Link to="/user" className="btn btn-primary btn-sm">Book Now</Link>
                      )}
                    </div>
                  ))}
                </div>
              </section>

              {/* Testimonials Section */}
              <section className="testimonials-section">
                <h2 className="section-title">What Our Clients Say</h2>
                <div className="testimonials-grid">
                  {homeData.testimonials.map(testimonial => (
                    <div key={testimonial.id} className="testimonial-card">
                      <div className="testimonial-header">
                        <img src={testimonial.image} alt={testimonial.name} className="testimonial-image" />
                        <div className="testimonial-info">
                          <h4 className="testimonial-name">{testimonial.name}</h4>
                          <div className="testimonial-rating">
                            {renderStars(testimonial.rating)}
                          </div>
                        </div>
                      </div>
                      <p className="testimonial-comment">"{testimonial.comment}"</p>
                    </div>
                  ))}
                </div>
              </section>

              {/* Call to Action Section */}
              <section className="cta-section">
                <div className="cta-content">
                  <h2 className="cta-title">Ready to Transform Your Look?</h2>
                  <p className="cta-description">
                    Book your appointment today and experience the Salon Excellence difference.
                  </p>
                  {!user ? (
                    <div className="cta-buttons">
                      <Link to="/signup" className="btn btn-primary btn-large">Sign Up Now</Link>
                      <Link to="/login" className="btn btn-secondary btn-large">Login</Link>
                    </div>
                  ) : (
                    <Link to={isAdmin ? "/admin" : "/user"} className="btn btn-primary btn-large">
                      Go to Dashboard
                    </Link>
                  )}
                </div>
              </section>
            </div>
          } />
          
          <Route path="/about" element={<About />} />
          <Route path="/reviews" element={<Reviews user={user} />} />
          <Route path="/contact" element={<Contact />} />
          
          <Route path="/login" element={
            !user ? <Login setUser={setUser} setIsAdmin={setIsAdmin} /> : <Navigate to={isAdmin ? "/admin" : "/user"} />
          } />
          
          <Route path="/signup" element={
            !user ? <Signup setUser={setUser} /> : <Navigate to={isAdmin ? "/admin" : "/user"} />
          } />
          
          <Route path="/user" element={
            user && !isAdmin ? (
              <UserDashboard 
                key={refreshKey}
                user={user} 
                onRefresh={triggerRefresh}
              />
            ) : (
              <Navigate to={isAdmin ? "/admin" : "/"} />
            )
          } />
          
          <Route path="/admin" element={
            user && isAdmin ? (
              <AdminDashboard 
                key={refreshKey}
                user={user} 
                onRefresh={triggerRefresh}
              />
            ) : (
              <Navigate to={user ? "/user" : "/"} />
            )
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;