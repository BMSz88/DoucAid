import { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./assets/css/login.css";
function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const result = await axios.post("http://localhost:3001/login", { email, password });

            if (result.data.redirect) {
                localStorage.setItem("token", result.data.token);
                navigate("/home"); // Redirect to home page
            } else {
                alert(result.data.message);
            }
        } catch (error) {
            console.error("❌ Login error:", error);
            alert("Login failed. Please try again.");
        }
    };

    return (
        <div className="d-flex justify-content-center align-items-center bg-secondary vh-100">
            <div className="bg-white p-3 rounded w-25">
                <h2 className="text-center">Login</h2>
                <form onSubmit={handleSubmit}>
                    <input
                        type="email"
                        placeholder="Enter email"
                        className="form-control mb-3"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Enter password"
                        className="form-control mb-3"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <button type="submit" className="btn btn-primary w-100">Login</button>
                </form>

                <p className="text-center mt-3">Or</p>
                <a href="http://localhost:3001/auth/google" className="google-btn">
                    <img 
                        src="https://developers.google.com/identity/images/btn_google_signin_light_normal_web.png" 
                        alt="Sign in with Google"
                    />
                </a>

                <p className="mt-3 text-center">Do not have an account?</p>
                <Link to="/register" className="btn btn-outline-secondary w-100">Sign Up</Link>
            </div>
        </div>
    );
}

export default Login;