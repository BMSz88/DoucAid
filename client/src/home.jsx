import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import './assets/css/style.css';

function Home() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="container">
      {/* Navbar */}
      <nav className={`navbar ${scrolled ? "scrolled" : ""}`}>
        <h1 className="fade-in">DocuAid 🔍</h1>
        <div>
          <Link to="/login" className="sign-in">Sign In</Link>
          <Link to="/register" className="sign-up">Sign Up</Link>
          <Link to="/home" className="chrome-btn">Add to Chrome</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="hero fade-in">
        <h1><i>Introducing DocuAid</i></h1>
        <p>Your AI-powered documentation assistant</p>
      </div>

      {/* Scrollable Section */}
      <div className="scrollable-section fade-in">
        <h2>Features</h2>
        <p>Explore the amazing features of DocuAid...</p>
        <div className="feature-list">
          <div className="feature-card">
            <h3>AI-powered Search</h3>
            <p>Find documentation in seconds with intelligent search.</p>
          </div>
          <div className="feature-card">
            <h3>Instant Suggestions</h3>
            <p>Get instant recommendations based on your query.</p>
          </div>
          <div className="feature-card">
            <h3>Multi-Language Support</h3>
            <p>Available in multiple languages for global users.</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="contact-section fade-in">
        <h2>Contact Us</h2>
        <p>If you have any questions or feedback, feel free to reach out!</p>
        <div className="footer-links">
            <Link to="/privacy">Privacy Policy</Link>
            <Link to="/terms">Terms of Service</Link>
            <Link to="/support">Support</Link>
          </div>
      </footer>
    </div>
  );
}

export default Home;
