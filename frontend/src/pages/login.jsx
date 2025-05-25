import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/lognin', {
        username,
        password,
      });
      console.log('Login successful', response.data);
      navigate('/product');
    } catch (err) {
      if (err.response && err.response.data) {
        setError(err.response.data.message || 'Login failed');
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
              background: linear-gradient(120deg, #f0f0f0, #e2e2e2);
            }

            .login-container {
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
            }

            .login-box {
              background-color: white;
              padding: 40px 30px;
              border-radius: 12px;
              box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
              width: 100%;
              max-width: 400px;
            }

            .login-box h2 {
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

            .login-button {
              width: 100%;
              padding: 12px;
              background-color: #4b79a1;
              color: white;
              border: none;
              border-radius: 8px;
              font-size: 16px;
              cursor: pointer;
              transition: background 0.3s ease;
            }

            .login-button:hover {
              background-color: #355570;
            }

            .error-message {
              color: red;
              margin-bottom: 15px;
              text-align: center;
              font-size: 14px;
            }

            .signup-link {
              text-align: center;
              margin-top: 20px;
            }

            .signup-link a {
              color: #4b79a1;
              text-decoration: none;
              font-weight: 500;
            }

            .signup-link a:hover {
              text-decoration: underline;
            }
          `,
        }}
      />
      <div className="login-container">
        <div className="login-box">
          <h2>Login</h2>
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
                autoComplete="off"
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
            <button type="submit" className="login-button">Login</button>
          </form>
          <p className="signup-link">
            Don't have an account? <Link to="/hii">Sign Up</Link>
          </p>
        </div>
      </div>
    </>
  );
};

export default Login;
