import React, { useState } from 'react'
import "../auth.form.scss";
import { useNavigate, Link } from 'react-router';
import { useAuth } from "../hooks/useAuth.js";

function Login() {
    const navigate = useNavigate();
    const { loading, handleLogin } = useAuth(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await handleLogin({ email, password });
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
                <h1>Login</h1>
                <form onSubmit={handleSubmit}>
                    <div className='input-group'>
                        <label htmlFor="email">Email</label>
                        <input
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            type="email" id="email" name="email" placeholder='Enter your email'
                        />
                    </div>
                    <div className='input-group'>
                        <label htmlFor="password">Password</label>
                        <input
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            type="password" id="password" name="password" placeholder='Enter your password'
                        />
                    </div>
                    <button className='button primary-button' type="submit">Login</button>
                </form>
                <p>Don't have an account? <Link to="/register">Register</Link></p>
            </div>
        </main>
    )
}

export default Login