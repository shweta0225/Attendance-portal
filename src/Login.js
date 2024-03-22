import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Please enter both username and password');
    } else {
      setError('');
      try {
        const response = await fetch('http://localhost:5000/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ username, password }),
        });

        if (!response.ok) {
          throw new Error('Failed to login. Please try again.');
        }

        navigate(`/attendance?username=${encodeURIComponent(username)}`);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError(error.message || 'Failed to login. Please try again.');
      }
    }
  };

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="max-w-md w-full p-8 border border-gray-300 rounded shadow-lg">
        <h2 className="text-2xl font-bold mb-4 text-center">Log in</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
            />
          </div>
          <div className="mb-4">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
            />
          </div>
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          <button
            type="submit"
            className="w-full  bg-blue-500 text-white p-2 rounded hover:bg-blue-600 focus:outline-none focus:bg-blue-600"
          >
            Log in
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
