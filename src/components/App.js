import React, { useState, useEffect } from "react";
import "./../styles/App.css";
<<<<<<< HEAD
import Task from "./Task";
import Signup from "./Signup";

function App() {
	const [task, setTask] = useState("");
	const [taskList, setTaskList] = useState([]);
	const [loggedin, setLoggedin] = useState(false);
	const [error, setError] = useState("");

	useEffect(() => {
		fetch("http://localhost:8080/todo", { credentials: "include" })
			.then((r) => r.json())
			.then((arr) => {
				// const sortedArr = arr.sort((a,b) => a.) //>incomplete (sort acc. creation time)
				//const allTasks = arr.map((item) => item.task); //note - gets the task for each item
				setTaskList(arr);
			});
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
				console.log("first then", r);
				if (r.ok) {
					return { success: true };
				} else {
					return r.json();
				}
			})
			.then((r) => {
				console.log("second json", r);
				if (r.success === true) {
					setLoggedin(true);
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

	return loggedin ? (
		<div id="main">
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
=======
import ListItem from "./ListItem";

function App() {
	const [items, setItems] = useState([]);
	const [newItem, setNewItem] = useState("");
	const addItem = () => {
		items.push(newItem);
		setItems([...items]);
		setNewItem("");

	};
	const newItemChanged = (evt) => {
		setNewItem(evt.target.value);
	};
	const deleteHandler = (itemIdx) => {
		items.splice(itemIdx, 1);
		setItems([...items]);
	}
	const editHandler = (editedValue, itemIdx) => {
		items[itemIdx]=editedValue;
		setItems([...items]);
	}
	return (
	<div id="main">
		<textarea 
			id="task" 
			onChange={newItemChanged} 
			placeholder="New Item" 
			value={newItem}
			></textarea>
		<button id="btn" onClick={addItem} disabled={newItem.trim().length===0}>
			Add Item
		</button>
		{items.map((item, idx) => (
			<ListItem 
				item = {item} 
				key={`${item}_${idx}`} 
				idx={idx}
				editHandler={editHandler} 
				deleteHandler={deleteHandler} 
			/>
			))}
	</div>
>>>>>>> 6316dc00fc6761211fbf477cdbb60eafbd3c2128
	);
}


export default App;
