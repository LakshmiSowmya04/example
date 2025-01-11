import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const SignupForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
  
    // Basic validation
    if (!formData.name || !formData.email || !formData.password) {
      setError('Please fill in all fields');
      return;
    }
  
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }
  
    try {
      const response = await fetch('http://localhost:5000/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          name: formData.name
        }),
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }
  
      // Registration successful
      console.log('Registration successful:', data);
      // Clear form
      setFormData({
        name: '',
        email: '',
        password: ''
      });
      // Redirect to login
      navigate('/login', { 
        state: { message: 'Registration successful! Please login.' }
      });
  
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-box">
        <h2>Sign Up</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input
              id="name"
              name="name"
              type="text"
              placeholder="Enter your name"
              value={formData.name}
              onChange={handleInputChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleInputChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="Create a password"
              value={formData.password}
              onChange={handleInputChange}
            />
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <button type="submit" className="signup-submit-button">
            Create Account
          </button>
        </form>

        <div className="login-section">
          <p>Already have an account?</p>
          <button
            className="login-button"
            onClick={() => navigate('/login')}
          >
            Login
          </button>
        </div>
      </div>

      <style jsx>{`
        .signup-container {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          background-color: #f5f5f5;
          padding: 20px;
        }

        .signup-box {
          background: white;
          padding: 2rem;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          width: 100%;
          max-width: 400px;
        }

        h2 {
          text-align: center;
          margin-bottom: 1.5rem;
          color: #333;
        }

        .form-group {
          margin-bottom: 1rem;
        }

        label {
          display: block;
          margin-bottom: 0.5rem;
          color: #666;
        }

        input {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #ddd;
          border-radius: 4px;
          margin-bottom: 0.5rem;
        }

        input:focus {
          outline: none;
          border-color: #0070f3;
        }

        .error-message {
          color: #dc2626;
          margin-bottom: 1rem;
          padding: 0.5rem;
          background-color: #fef2f2;
          border-radius: 4px;
        }

        .signup-submit-button {
          width: 100%;
          padding: 0.75rem;
          background-color: #0070f3;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-weight: 500;
        }

        .signup-submit-button:hover {
          background-color: #0051cc;
        }

        .login-section {
          text-align: center;
          margin-top: 1.5rem;
        }

        .login-button {
          width: 100%;
          padding: 0.75rem;
          background-color: white;
          color: #0070f3;
          border: 1px solid #0070f3;
          border-radius: 4px;
          cursor: pointer;
          margin-top: 0.5rem;
        }

        .login-button:hover {
          background-color: #f3f4f6;
        }
      `}</style>
    </div>
  );
};

export default SignupForm;