import { Link } from "react-router-dom";
import './assets/css/style.css';

function Home() {
  const handleLogout = () => {
    alert("Logout successful!");
    // Redirect or handle logout logic if needed
  };
  

  return (
    <div className="container">
      {/* Navbar */}
      <nav className="navbar">
        <h1>DocuAid 🔍</h1>
        <div>
          <Link to="/login" className="sign-in">Sign In</Link>
          <Link to="/register" className="sign-up">Sign Up</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="hero">
        <h1><i>Introducing DocuAid</i></h1>
        <p>Your AI-powered documentation assistant</p>
      </div>

      {/* Scrollable Section */}
      <div className="scrollable-section">
        <h2>Features</h2>
        <p>Explore the amazing features of DocuAid...</p>
        <div className="feature-list">
          <div className="feature">
            <h3>AI-powered Search</h3>
            <p>Find documentation in seconds with intelligent search.</p>
          </div>
          <div className="feature">
            <h3>Instant Suggestions</h3>
            <p>Get instant recommendations based on your query.</p>
          </div>
          <div className="feature">
            <h3>Multi-Language Support</h3>
            <p>Available in multiple languages for global users.</p>
          </div>
        </div>
      </div>

      {/* Contact Us Section */}
      <div className="contact-section">
        <h2>Contact Us</h2>
        <p>If you have any questions or feedback, feel free to reach out!</p>
      </div>
    </div>
  );
}

export default Home;
