import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Announcement } from '../types';
import '../styles/landing.css';

export const LandingPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(false);

  const heroSlides = [
    {
      image:
        'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200&h=500&fit=crop',
      title: 'Improving Service Delivery in Kisii County',
      description: 'Report county issues and track them in real-time',
    },
    {
      image:
        'https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&h=500&fit=crop',
      title: 'Transparent Government',
      description: 'Your voice matters - report and track every issue',
    },
    {
      image:
        'https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&h=500&fit=crop',
      title: 'Building Better Communities',
      description: 'Together we create a responsive and accountable county',
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const response = await api.getAnnouncements({ limit: 6 });
      setAnnouncements(response.data.announcements);
    } catch (error) {
      console.error('Failed to fetch announcements:', error);
    } finally {
      setLoading(false);
    }
  };

  const faqs = [
    {
      question: 'How do I report an issue?',
      answer:
        'Simply sign up for an account, log in, and click the "Report an Issue" button. You\'ll fill out a form with issue details and location details using our interactive map.',
    },
    {
      question: 'Do I need an account to report?',
      answer:
        'Yes, you need to create a free account to report issues. This helps us track your reports and send you updates about their status.',
    },
    {
      question: 'How long does it take to resolve an issue?',
      answer:
        'Resolution time varies depending on the issue type and complexity. You can track your issue status in real-time from your dashboard.',
    },
    {
      question: 'Can I track my report?',
      answer:
        'Yes! Once you report an issue, you can track its status from your citizen dashboard. You\'ll receive email notifications for every status update.',
    },
    {
      question: 'Who handles reported issues?',
      answer:
        'Issues are assigned to relevant departments and field officers based on their category. Admin reviews and verifies all reports before assignment.',
    },
    {
      question: 'Can I provide feedback on resolved issues?',
      answer:
        'Yes! Once your issue is marked as resolved, you can rate the service and provide feedback to help us improve.',
    },
  ];

  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);

  return (
    <div className="landing-page">
      {/* Hero Section with Carousel */}
      <section className="hero-section">
        <div className="carousel-container">
          {heroSlides.map((slide, index) => (
            <div
              key={index}
              className={`carousel-slide ${index === currentSlide ? 'active' : ''}`}
              style={{ backgroundImage: `url(${slide.image})` }}
            >
              <div className="carousel-overlay">
                <div className="carousel-content">
                  <h1>{slide.title}</h1>
                  <p>{slide.description}</p>
                </div>
              </div>
            </div>
          ))}

          {/* Carousel Controls */}
          <div className="carousel-controls">
            <button
              className="carousel-btn prev"
              onClick={() => setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length)}
            >
              &#10094;
            </button>
            <button
              className="carousel-btn next"
              onClick={() => setCurrentSlide((prev) => (prev + 1) % heroSlides.length)}
            >
              &#10095;
            </button>
          </div>

          {/* Carousel Indicators */}
          <div className="carousel-indicators">
            {heroSlides.map((_, index) => (
              <button
                key={index}
                className={`indicator ${index === currentSlide ? 'active' : ''}`}
                onClick={() => setCurrentSlide(index)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Trending Announcements */}
      <section className="announcements-section">
        <div className="container">
          <h2>Latest Announcements</h2>
          <p className="section-subtitle">
            Stay updated with the latest announcements from Kisii County Government
          </p>

          {loading ? (
            <div className="text-center" style={{ padding: '40px 0' }}>
              <div className="spinner"></div>
            </div>
          ) : announcements.length > 0 ? (
            <div className="announcements-grid">
              {announcements.map((announcement) => (
                <div key={announcement._id} className="announcement-card">
                  {announcement.image && (
                    <img src={announcement.image} alt={announcement.title} />
                  )}
                  <div className="announcement-content">
                    <h3>{announcement.title}</h3>
                    <p>{announcement.description}</p>
                    <div className="announcement-meta">
                      <span className="author">{announcement.author.firstName} {announcement.author.lastName}</span>
                      <span className="date">
                        {new Date(announcement.publishedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <Link to={`/announcements/${announcement._id}`} className="read-more">
                      Read More →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted">No announcements yet</p>
          )}
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>Report a County Issue in Real Time</h2>
            <p>
              Have you noticed a problem affecting your community? Roads, water supply, waste
              management, or lighting issues? Report them now and track the progress in real-time.
            </p>
            <div className="cta-buttons">
              {!isAuthenticated ? (
                <>
                  <Link to="/register" className="btn btn-primary">
                    Sign Up to Report
                  </Link>
                  <Link to="/login" className="btn btn-secondary">
                    Already have an account? Log In
                  </Link>
                </>
              ) : (
                <Link to="/report-issue" className="btn btn-primary">
                  Report an Issue
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="faq-section">
        <div className="container">
          <h2>Frequently Asked Questions</h2>
          <p className="section-subtitle">
            Find answers to common questions about our issue reporting system
          </p>

          <div className="faq-container">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className={`faq-item ${expandedFAQ === index ? 'expanded' : ''}`}
              >
                <button
                  className="faq-question"
                  onClick={() => setExpandedFAQ(expandedFAQ === index ? null : index)}
                >
                  <span>{faq.question}</span>
                  <span className="faq-icon">{expandedFAQ === index ? '−' : '+'}</span>
                </button>
                {expandedFAQ === index && (
                  <div className="faq-answer">{faq.answer}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-column">
              <h4>About Us</h4>
              <p>
                E-County Kisii is a digital platform enabling citizens to report and track
                public service issues in Kisii County.
              </p>
            </div>

            <div className="footer-column">
              <h4>Quick Links</h4>
              <ul>
                <li>
                  <Link to="/">Home</Link>
                </li>
                <li>
                  <Link to="/announcements">Announcements</Link>
                </li>
                <li>
                  <Link to="/about">About</Link>
                </li>
                <li>
                  <Link to="/contact">Contact</Link>
                </li>
              </ul>
            </div>

            <div className="footer-column">
              <h4>Contact</h4>
              <p>
                <i className="fas fa-phone"></i> +254 (0) xxx xxx xxx
              </p>
              <p>
                <i className="fas fa-envelope"></i> info@ecounty-kisii.gov.ke
              </p>
              <p>
                <i className="fas fa-map-marker-alt"></i> Kisii County Headquarters
              </p>
            </div>

            <div className="footer-column">
              <h4>Follow Us</h4>
              <div className="social-links">
                <a href="#" className="social-link">
                  <i className="fab fa-facebook"></i>
                </a>
                <a href="#" className="social-link">
                  <i className="fab fa-twitter"></i>
                </a>
                <a href="#" className="social-link">
                  <i className="fab fa-linkedin"></i>
                </a>
              </div>
            </div>
          </div>

          <div className="footer-bottom">
            <p>&copy; 2024 Kisii County Government. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
