import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://pyvqqsmvsdnpjmmbfpqj.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB5dnFxc212c2RucGptbWJmcHFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY1NjQyOTMsImV4cCI6MjA1MjE0MDI5M30.3uNQE8hSnLZTu7T2DtuKBs3P3kNNOXF4Pe7jL0Sn7lA'
);

const SignupForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
    setLoading(true);

    try {
      if (!formData.email || !formData.password) {
        throw new Error('Please fill in all fields');
      }

      if (formData.password.length < 6) {
        throw new Error('Password must be at least 6 characters long');
      }

      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            name: formData.name,
          }
        }
      });

      if (error) throw error;

      alert('Check your email for the confirmation link!');
      navigate('/login');
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-container">
      <form onSubmit={handleSubmit} className="signup-form">
        <h2>Create Account</h2>
        <p className="welcome-text">Join us to get started with your journey</p>
        
        <div className="form-group">
          <label htmlFor="name">Name</label>
          <input
            id="name"
            type="text"
            name="name"
            placeholder="Enter your name"
            value={formData.name}
            onChange={handleInputChange}
            className="form-input"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            name="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleInputChange}
            className="form-input"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            name="password"
            placeholder="Choose a password"
            value={formData.password}
            onChange={handleInputChange}
            className="form-input"
          />
          <span className="password-hint">Must be at least 6 characters</span>
        </div>

        {error && <div className="error-message">{error}</div>}
        
        <button type="submit" disabled={loading} className="signup-button">
          {loading ? 'Creating Account...' : 'Create Account'}
        </button>

        <p className="login-link">
          Already have an account? <a href="/login">Log in</a>
        </p>
      </form>
      <style>{`
        .signup-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          background-color: #f5f5f5;
          padding: 20px;
        }

        .signup-form {
          background: white;
          padding: 2.5rem;
          border-radius: 12px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08);
          width: 100%;
          max-width: 450px;
        }

        .signup-form h2 {
          text-align: center;
          color: #2c3e50;
          margin-bottom: 0.5rem;
          font-size: 2rem;
          font-weight: 600;
        }

        .welcome-text {
          text-align: center;
          color: #666;
          margin-bottom: 2rem;
          font-size: 0.95rem;
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          color: #2c3e50;
          font-size: 0.95rem;
          font-weight: 500;
        }

        .form-input {
          width: 100%;
          padding: 12px 16px;
          border: 2px solid #e1e1e1;
          border-radius: 8px;
          font-size: 1rem;
          transition: all 0.3s ease;
          outline: none;
          background-color: #f8f9fa;
        }

        .form-input:focus {
          border-color: #4a90e2;
          background-color: white;
          box-shadow: 0 0 0 3px rgba(74, 144, 226, 0.1);
        }

        .password-hint {
          display: block;
          font-size: 0.8rem;
          color: #666;
          margin-top: 0.5rem;
        }

        .error-message {
          color: #dc3545;
          font-size: 0.875rem;
          margin-bottom: 1rem;
          padding: 10px;
          background-color: rgba(220, 53, 69, 0.1);
          border-radius: 6px;
          text-align: center;
        }

        .signup-button {
          width: 100%;
          padding: 14px;
          background-color: #4a90e2;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .signup-button:hover {
          background-color: #357abd;
          transform: translateY(-1px);
        }

        .signup-button:disabled {
          background-color: #cccccc;
          cursor: not-allowed;
          transform: none;
        }

        .login-link {
          text-align: center;
          margin-top: 1.5rem;
          color: #666;
          font-size: 0.95rem;
        }

        .login-link a {
          color: #4a90e2;
          text-decoration: none;
          font-weight: 500;
        }

        .login-link a:hover {
          text-decoration: underline;
        }

        @media (max-width: 480px) {
          .signup-form {
            padding: 1.5rem;
          }

          .signup-form h2 {
            font-size: 1.75rem;
          }

          .form-input {
            padding: 10px 14px;
          }
        }
      `}</style>
    </div>
  );
};

export default SignupForm;