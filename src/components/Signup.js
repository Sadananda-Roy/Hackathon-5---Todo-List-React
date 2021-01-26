import React, { useState } from "react";
import "./../styles/App.css";

function Signup({ signinHandler, signupHandler, error }) {
	const [userName, setUsername] = useState("");
	const [password, setPassword] = useState("");
	return (
		<div className="signup_container">
			<h1>Todo</h1>
			<input
				className="signup_elem"
				type="text"
				placeholder="Enter your username"
				value={userName}
				onChange={(e) => setUsername(e.target.value)}
			></input>
			<input
				className="signup_elem"
				type="password"
				placeholder="Enter password"
				value={password}
				onChange={(e) => setPassword(e.target.value)}
			></input>
			<span>{error}</span>
			<button
				className="signup_elem"
				onClick={() => signinHandler(userName, password)}
			>
				Sign In
			</button>
			<button
				className="signup_elem"
				onClick={() => signupHandler(userName, password)}
			>
				Sign Up
			</button>
		</div>
	);
}

export default Signup;
