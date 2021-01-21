import React, { useState } from "react";
import "./../styles/App.css";
import Task from "./Task";

function App() {
	const [task, setTask] = useState("");
	const [taskList, setTaskList] = useState([]);
	return (
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
						if (task.trim() !== "") {
							setTaskList([...taskList, task]);
							setTask("");
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
	);
}

export default App;
