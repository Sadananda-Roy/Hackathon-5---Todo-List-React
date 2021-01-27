import React, { useState, useEffect } from "react";
import "./../styles/App.css";
import Task from "./Task";
import Signup from "./Signup";

function App() {
	const [task, setTask] = useState("");
	const [taskList, setTaskList] = useState([]);
	const [loggedin, setLoggedin] = useState(false);
	const [error, setError] = useState("");
	const [userName, setUsername] = useState(undefined);

	const getusername = () => {
		return (
			fetch("http://localhost:8080/userinfo", { credentials: "include" })
				///credentials: "include" necessary when frontend and backend runnin on different hosts
				.then((r) => {
					if (r.ok) {
						return r.json();
					} else {
						setLoggedin(false);
						setUsername(undefined);
						return { success: false };
					}
				})
				.then((r) => {
					///if fetch was fulfilled
					if (r.success !== false) {
						setLoggedin(true);
						setUsername(r.userName);
						///rendering all the todos
						fetch("http://localhost:8080/todo", { credentials: "include" })
							.then((r) => r.json())
							.then((arr) => {
								// const sortedArr = arr.sort((a,b) => a.) //>incomplete (sort acc. creation time)
								//const allTasks = arr.map((item) => item.task); //note - gets the task for each item
								setTaskList(arr);
							});
					}
				})
		);
	};

	useEffect(() => {
		getusername();
	}, []);

	//>SignUp/SignIn
	const signInOrUp = (url, userName, password) => {
		fetch(url, {
			method: "POST",
			body: JSON.stringify({ userName, password }),
			headers: { "Content-Type": "application/json" },
			credentials: "include",
		})
			.then((r) => {
				if (r.ok) {
					return { success: true };
				} else {
					return r.json();
				}
			})
			.then((r) => {
				if (r.success === true) {
					return getusername();
				} else {
					setError(r.error);
				}
			});
	};

	const signinHandler = (userName, password) => {
		signInOrUp("http://localhost:8080/login", userName, password);
	};

	const signupHandler = (userName, password) => {
		signInOrUp("http://localhost:8080/signup", userName, password);
	};

	//>logout handler
	const logoutHandler = () => {
		return fetch("http://localhost:8080/logout", {
			credentials: "include",
		}).then((r) => {
			if (r.ok) {
				setLoggedin(false);
				setUsername(undefined);
			}
		});
	};

	return loggedin ? (
		<div id="main">
			<div className="user">
				<p>
					Username: <b>{userName}</b>
					<button onClick={logoutHandler}>Logout</button>
				</p>
			</div>
			<div className="inputrow">
				<textarea
					className="task"
					id="task"
					onChange={(e) => setTask(e.target.value)}
					value={task}
				></textarea>

				<button
					className="btn"
					id="btn"
					disabled={task.trim() === ""}
					onClick={() => {
						//>on clicking add
						if (task.trim() !== "") {
							fetch("http://localhost:8080/todo", {
								method: "POST",
								body: JSON.stringify({ task: task }),
								headers: { "Content-Type": "application/json" },
								credentials: "include",
							})
								.then((r) => r.json())
								.then((resp) => {
									console.log("add", resp);
									setTaskList([...taskList, resp]);
									setTask("");
								});
						}
					}}
				>
					Add
				</button>
			</div>
			<div className="tasks">
				{taskList.map((tsk, tskidx) => {
					return (
						<Task
							key={tsk._id}
							className="list"
							tsk={tsk}
							tskidx={tskidx}
							taskList={taskList}
							setTaskList={setTaskList}
						/>
					);
				})}
			</div>
		</div>
	) : (
		<Signup
			signinHandler={signinHandler}
			signupHandler={signupHandler}
			error={error}
		/>
	);
}
export default App;
