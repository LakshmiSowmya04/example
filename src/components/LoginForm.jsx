import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://pyvqqsmvsdnpjmmbfpqj.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB5dnFxc212c2RucGptbWJmcHFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY1NjQyOTMsImV4cCI6MjA1MjE0MDI5M30.3uNQE8hSnLZTu7T2DtuKBs3P3kNNOXF4Pe7jL0Sn7lA'
);

const LoginForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
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

      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) throw error;

      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        navigate('/dashboard', { replace: true });
      } else {
        throw new Error('Authentication failed');
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit} className="login-form">
        <h2>Welcome Back</h2>
        <div className="form-group">
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleInputChange}
            className="form-input"
          />
        </div>
        <div className="form-group">
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleInputChange}
            className="form-input"
          />
        </div>
        {error && <div className="error-message">{error}</div>}
        <button type="submit" disabled={loading} className="login-button">
          {loading ? 'Logging in...' : 'Log In'}
        </button>
        <div className="signup-section">
  <p>Don't have an account?</p>
  <button 
    type="button" 
    className="signup-button"
    onClick={() => navigate('/signup')}
  >
    Sign Up
  </button>
</div>
      </form>
      <style>{`
        .login-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          background-color: #f5f5f5;
          padding: 20px;
        }

        .signup-section {
  margin-top: 1rem;
  text-align: center;
}

.signup-section p {
  color: #666;
  margin-bottom: 0.5rem;
}

.signup-button {
  background: transparent;
  color: #4a90e2;
  border: 1px solid #4a90e2;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.3s ease;
}

.signup-button:hover {
  background: #4a90e2;
  color: white;
}

        .login-form {
          background: white;
          padding: 2rem;
          border-radius: 10px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          width: 100%;
          max-width: 400px;
        }

        .login-form h2 {
          text-align: center;
          color: #333;
          margin-bottom: 1.5rem;
          font-size: 1.8rem;
        }

        .form-group {
          margin-bottom: 1.2rem;
        }

        .form-input {
          width: 100%;
          padding: 12px;
          border: 2px solid #e1e1e1;
          border-radius: 6px;
          font-size: 1rem;
          transition: border-color 0.3s ease;
          outline: none;
        }

        .form-input:focus {
          border-color: #4a90e2;
          box-shadow: 0 0 0 3px rgba(74, 144, 226, 0.1);
        }

        .error-message {
          color: #dc3545;
          font-size: 0.875rem;
          margin-bottom: 1rem;
          padding: 8px;
          background-color: rgba(220, 53, 69, 0.1);
          border-radius: 4px;
        }

        .login-button {
          width: 100%;
          padding: 12px;
          background-color: #4a90e2;
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 1rem;
          cursor: pointer;
          transition: background-color 0.3s ease;
        }

        .login-button:hover {
          background-color: #357abd;
        }

        .login-button:disabled {
          background-color: #cccccc;
          cursor: not-allowed;
        }

        @media (max-width: 480px) {
          .login-form {
            padding: 1.5rem;
          }

          .login-form h2 {
            font-size: 1.5rem;
          }
        }
      `}</style>
    </div>
  );
};

export default LoginForm;