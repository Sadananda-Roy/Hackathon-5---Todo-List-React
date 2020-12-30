import React, { useState } from "react";
import "../styles/App.css";

function Task({ tsk, tskidx, taskList, setTaskList }) {
	const [edit, setEdit] = useState(false);
	const [task, setTask] = useState(tsk);

	const editbtn = () => {
		setEdit(!edit);
	};
	const deletebtn = (idx) => {
		console.log("delete", idx);
		console.log(idx);
		taskList.splice(idx, 1);
		setTaskList([...taskList]);
	};

	return (
		<>
			<div className="singleTsk">
				{`${tskidx + 1}. ${tsk}`}
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
						className="editarea"
						defaultValue={tsk}
						onChange={(e) => {
							document.getElementById("save").disabled =
								e.target.value === "" ? true : false;
						}}
					></textarea>
					<button
						className="save"
						id="save"
						onClick={() => {
							const editedTask = document.getElementById("editarea").value;
							if (editedTask !== "") {
								console.log("idx ", tskidx);
								setTask(editedTask);
								taskList.splice(tskidx, 1, editedTask);
								setTaskList([...taskList]);
								setEdit(false);
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
