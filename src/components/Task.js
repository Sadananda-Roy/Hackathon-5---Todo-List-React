import React, { useState, useEffect } from "react";
import "../styles/App.css";

function Task({ tsk, tskidx, taskList, setTaskList }) {
	const [edit, setEdit] = useState(false);
	const [task, setTask] = useState(tsk);

	const editbtn = () => {
		setEdit(!edit);
	};
	const deletebtn = (idx) => {
		//>on clicking delete
		const idToDelete = taskList[tskidx]._id;
		fetch(`http://localhost:8080/todo/${idToDelete}`, {
			method: "DELETE",
			credentials: "include",
		}).then((r) => {
			taskList.splice(idx, 1);
			setTaskList([...taskList]);
		});
	};

	return (
		<>
			<div className="singleTsk" key={tsk._id}>
				<span>{`${tskidx + 1}. ${tsk.task}`}</span>

				<div className="btns">
					<button className="edit" onClick={(e) => editbtn()}>
						Edit
					</button>
					<button className="delete" onClick={() => deletebtn(tskidx)}>
						Delete
					</button>
				</div>
			</div>
			{edit === true ? (
				<div className="editbox">
					<textarea
						id="editarea"
						className="editTask"
						defaultValue={tsk.task}
						onChange={(e) => {
							document.getElementById("save").disabled =
								e.target.value.trim() !== "" ? false : true;
						}}
					></textarea>
					<button
						className="saveTask "
						id="save"
						onClick={() => {
							//>Edit an existing task
							const editedTask = document.getElementById("editarea").value;
							if (editedTask !== "") {
								const idToEdit = taskList[tskidx]._id;
								fetch(`http://localhost:8080/todo/${idToEdit}`, {
									method: "PUT",
									body: JSON.stringify({ task: editedTask }),
									headers: { "Content-Type": "application/json" },
									credentials: "include",
								})
									.then((r) => r.json())
									.then((resp) => {
										setTask(editedTask);
										taskList.splice(tskidx, 1, resp);
										setTaskList([...taskList]);
										setEdit(false);
									});
							}
						}}
					>
						Save
					</button>
				</div>
			) : null}
		</>
	);
}

export default Task;
