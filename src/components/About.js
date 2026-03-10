// components/About.js
import React from 'react';

const About = () => {
  return (
    <div className="about-page">
      <div className="about-header">
        <h1>About Salon Excellence</h1>
        <p>Where Beauty Meets Excellence</p>
      </div>

      <div className="about-story">
        <div className="story-content">
          <h2>Our Story</h2>
          <p>
            Founded in 2020, Salon Excellence has been at the forefront of hair and beauty care 
            in New York City. What started as a small salon with just 3 chairs has grown into 
            a premier destination for those seeking exceptional beauty services.
          </p>
          <p>
            Our journey began with a simple mission: to provide top-quality salon services in 
            a warm, welcoming environment. Today, we're proud to serve hundreds of satisfied 
            clients, offering everything from classic cuts to the latest trends in hair styling 
            and coloring.
          </p>
        </div>
        <div className="story-image">
          <img 
            src="https://images.unsplash.com/photo-1560066984-138dadb4c035?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" 
            alt="Salon Interior"
          />
        </div>
      </div>

      <div className="about-mission">
        <div className="mission-image">
          <img 
            src="https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" 
            alt="Our Team"
          />
        </div>
        <div className="mission-content">
          <h2>Our Mission</h2>
          <p>
            At Salon Excellence, we believe that everyone deserves to feel beautiful and confident. 
            Our mission is to provide exceptional beauty services that not only meet but exceed 
            our clients' expectations.
          </p>
          <ul className="mission-list">
            <li>✓ Deliver personalized service tailored to each client's unique needs</li>
            <li>✓ Use only the highest quality products for lasting results</li>
            <li>✓ Create a relaxing and welcoming atmosphere for all our guests</li>
            <li>✓ Stay current with the latest trends and techniques in the industry</li>
            <li>✓ Build lasting relationships with our clients through trust and excellence</li>
          </ul>
        </div>
      </div>

      <div className="about-values">
        <h2>Our Core Values</h2>
        <div className="values-grid">
          <div className="value-card">
            <div className="value-icon">✨</div>
            <h3>Excellence</h3>
            <p>We strive for perfection in every service we provide, ensuring our clients leave feeling their absolute best.</p>
          </div>
          <div className="value-card">
            <div className="value-icon">🤝</div>
            <h3>Integrity</h3>
            <p>We believe in honest communication, fair pricing, and building trust with every client interaction.</p>
          </div>
          <div className="value-card">
            <div className="value-icon">💫</div>
            <h3>Innovation</h3>
            <p>We continuously educate ourselves on the latest trends and techniques to bring you the best in beauty.</p>
          </div>
          <div className="value-card">
            <div className="value-icon">❤️</div>
            <h3>Passion</h3>
            <p>We love what we do, and it shows in the quality of our work and the smiles on our clients' faces.</p>
          </div>
        </div>
      </div>

      <div className="about-team">
        <h2>Meet Our Expert Team</h2>
        <div className="team-grid">
          <div className="team-card">
            <img 
              src="https://images.unsplash.com/photo-1580618672591-eb180b1a973f?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" 
              alt="Sarah Johnson - Master Stylist"
            />
            <h3>Sarah Johnson</h3>
            <p className="team-role">Master Stylist</p>
            <p className="team-bio">10+ years of experience in precision cutting and coloring</p>
          </div>
          <div className="team-card">
            <img 
              src="https://images.unsplash.com/photo-1556157382-97eda2d62296?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" 
              alt="Michael Chen - Color Specialist"
            />
            <h3>Michael Chen</h3>
            <p className="team-role">Color Specialist</p>
            <p className="team-bio">Expert in balayage, ombre, and creative color techniques</p>
          </div>
          <div className="team-card">
            <img 
              src="https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" 
              alt="Emma Davis - Stylist"
            />
            <h3>Emma Davis</h3>
            <p className="team-role">Senior Stylist</p>
            <p className="team-bio">Specializes in bridal styling and special occasion looks</p>
          </div>
          <div className="team-card">
            <img 
              src="https://images.unsplash.com/photo-1577219491135-ce391730fb2c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" 
              alt="David Martinez - Texture Specialist"
            />
            <h3>David Martinez</h3>
            <p className="team-role">Texture Specialist</p>
            <p className="team-bio">Expert in curly hair and natural texture enhancement</p>
          </div>
        </div>
      </div>

      <div className="about-stats">
        <div className="stat-box">
          <div className="stat-number">1000+</div>
          <div className="stat-label">Happy Clients</div>
        </div>
        <div className="stat-box">
          <div className="stat-number">5+</div>
          <div className="stat-label">Years Experience</div>
        </div>
        <div className="stat-box">
          <div className="stat-number">4.9</div>
          <div className="stat-label">Average Rating</div>
        </div>
        <div className="stat-box">
          <div className="stat-number">24/7</div>
          <div className="stat-label">Online Booking</div>
        </div>
      </div>

      <div className="about-cta">
        <h2>Ready to Experience Excellence?</h2>
        <p>Book your appointment today and let us help you look and feel your best.</p>
        <a href="/signup" className="btn btn-primary btn-large">Book Now</a>
      </div>
    </div>
  );
};

export default About;