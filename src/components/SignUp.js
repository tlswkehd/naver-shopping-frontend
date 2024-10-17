import React, { useState } from 'react';
import { auth } from '../firebase';
import axios from 'axios';

const SignUp = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [error, setError] = useState(null);

    const handleSignUp = async (e) => {
        e.preventDefault();
        try {
            const userCredential = await auth.createUserWithEmailAndPassword(email, password);
            const user = userCredential.user;

            await axios.post('http://localhost:5000/signup', {
                email,
                password,
                displayName,
                uid: user.uid
            });

            console.log("User registered successfully");
            // 회원가입 성공 후 처리 로직 (예: 홈페이지로 리다이렉션)
        } catch (error) {
            setError(error.message);
        }
    };

    return (
        <form onSubmit={handleSignUp}>
            <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                required
            />
            <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
            />
            <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Display Name"
                required
            />
            <button type="submit">Sign Up</button>
            {error && <p>{error}</p>}
        </form>
    );
};

export default SignUp;