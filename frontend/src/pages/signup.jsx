import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Signup = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !email || !password) {
      setError('Please fill in all fields');
      return;
    }
    try {
      const response = await axios.post('http://localhost:5000/signup', {
        username,
        email,
        password,
      });

      if (response.status === 200) {
        navigate('/hi');
        console.log('Signup successful:', response.data);
      }
    } catch (err) {
      if (err.response && err.response.data) {
        setError(err.response.data.message || 'Sign-up failed');
      } else {
        setError('An error occurred. Please try again.');
      }
    }
  };

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
            body {
              margin: 0;
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              background: linear-gradient(120deg, #e0eafc, #cfdef3);
            }

            .signup-container {
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
            }

            .signup-box {
              background-color: white;
              padding: 40px 30px;
              border-radius: 12px;
              box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
              width: 100%;
              max-width: 400px;
            }

            .signup-box h2 {
              text-align: center;
              margin-bottom: 20px;
              color: #333;
            }

            .form-group {
              margin-bottom: 20px;
            }

            .form-group label {
              display: block;
              font-weight: 600;
              margin-bottom: 8px;
              color: #555;
            }

            .form-group input {
              width: 100%;
              padding: 10px;
              border: 1px solid #ccc;
              border-radius: 8px;
              font-size: 14px;
            }

            .signup-button {
              width: 100%;
              padding: 12px;
              background-color: #007bff;
              color: white;
              border: none;
              border-radius: 8px;
              font-size: 16px;
              cursor: pointer;
              transition: background 0.3s ease;
            }

            .signup-button:hover {
              background-color: #0056b3;
            }

            .error-message {
              color: red;
              margin-bottom: 15px;
              text-align: center;
              font-size: 14px;
            }

            .login-link {
              text-align: center;
              margin-top: 20px;
            }

            .login-link a {
              color: #007bff;
              text-decoration: none;
              font-weight: 500;
            }

            .login-link a:hover {
              text-decoration: underline;
            }
          `,
        }}
      />
      <div className="signup-container">
        <div className="signup-box">
          <h2>Sign Up</h2>
          {error && <p className="error-message">{error}</p>}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="username">Username:</label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email:</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Password:</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="signup-button">Sign Up</button>
          </form>
          <p className="login-link">
            Already have an account? <Link to="/">Login</Link>
          </p>
        </div>
      </div>
    </>
  );
};

export default Signup;
