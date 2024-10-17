import React from 'react';
import firebase from '../firebase';

function Login() {
  const handleGoogleSignIn = async () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    try {
      const result = await firebase.auth().signInWithPopup(provider);
      const user = result.user;
      const idToken = await user.getIdToken();
      
      // 백엔드에 사용자 정보 전송
      const response = await fetch('http://1.234.83.86:5000/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName
        })
      });

      if (!response.ok) {
        throw new Error('Failed to register user');
      }

    } catch (error) {
      console.error("Error during Google Sign In:", error);
    }
  };

  return (
    <div>
      <h1>로그인</h1>
      <button onClick={handleGoogleSignIn}>Google로 시작하기</button>
    </div>
  );
}

export default Login;