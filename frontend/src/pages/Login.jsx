import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const LoginSignup = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const endpoint = isLogin ? '/api/login' : '/api/signup';
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    const result = await response.json();

    if (response.ok) {
      alert(isLogin ? 'Login Successful!' : 'Signup Successful!');
      if (isLogin) {
        localStorage.setItem('token', result.token);
        localStorage.setItem('username', username);
        navigate('/');
      } else {
        setIsLogin(true);
      }
    } else {
      alert(result.message);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md w-90">
        <h2 className="text-2xl font-bold mb-6 text-center">{isLogin ? 'Login' : 'Signup'}</h2>

        <label className="block mb-4">Username:
          <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full p-2 border rounded mt-2" required />
        </label>

        <label className="block mb-4">Password:
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-2 border rounded mt-2" required />
        </label>

        <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600">
          {isLogin ? 'Login' : 'Signup'}
        </button>

        <p className="mt-4 text-center">
          {isLogin ? 'Don\'t have an account?' : 'Already have an account?'}
          <button type="button" onClick={() => setIsLogin(!isLogin)} className="text-blue-500 ml-1 hover:underline">
            {isLogin ? 'Signup' : 'Login'}
          </button>
        </p>
      </form>
    </div>
  );
};

export default LoginSignup;