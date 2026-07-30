import React, { useState } from 'react'
import "../auth.form.scss";
import { useNavigate, Link } from 'react-router';
import { useAuth } from '../hooks/useAuth';


function Register() {
  const navigate = useNavigate();
  const { handleRegister } = useAuth();
  const { loading } = useAuth(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await handleRegister({ username, email, password });
      navigate("/home");
    } catch (error) {
      console.log(error);
    }
  }
  // if (loading) {
  //     return (
  //         <main><h1>Loading..</h1></main>
  //     );
  // }
  return (
    <main className="auth-main">
      <div className="form-container">
        <h1>Register</h1>
        <form onSubmit={handleSubmit}>
          <div className='input-group'>
            <label htmlFor="name">Full Name</label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              type="text" id="name" name="name" placeholder='Enter your full name' />
          </div>

          <div className='input-group'>
            <label htmlFor="email">Email</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email" id="email" name="email" placeholder='Enter your email' />
          </div>

          <div className='input-group'>
            <label htmlFor="password">Password</label>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password" id="password" name="password" placeholder='Create a password' />
          </div>

          {/* <div className='input-group'>
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input type="password" id="confirmPassword" name="confirmPassword" placeholder='Re-enter your password' />
          </div> */}

          <button className='button primary-button' type="submit">Register</button>
        </form>
        <p>Already have an account? <Link to="/login">Login</Link></p>
      </div>
    </main>
  )
}

export default Register