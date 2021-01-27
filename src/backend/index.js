const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const session = require("express-session");

const app = express();
app.use(express.json());
const cors = require("cors");
app.use(
	cors({
		///because the frontend and backend are running on different servers
		credentials: true,
		///frontend path
		origin: "http://localhost:8081",
	})
);
app.use(
	session({
		secret: "session_secret",
	})
);

const db = mongoose.createConnection("mongodb://localhost:27017/To-do", {
	useNewUrlParser: true,
	useUnifiedTopology: true,
});
db.on("connected", () => {
	console.log("connected to database.");
});

//> defining the schema
const userSchema = new mongoose.Schema({
	userName: String,
	password: String,
});
const todoSchema = new mongoose.Schema({
	task: String,
	completed: Boolean,
	userId: mongoose.Schema.Types.ObjectId,
});
const userModel = db.model("user", userSchema);
const todoModel = db.model("todo", todoSchema);

/// function to check null or undefined
const nullOrUnd = (val) => val === null || val === undefined;
const salt = 9;

//> API requests
//>signup
app.post("/signup", async (req, res) => {
	const { userName, password } = req.body;
	/// - in the model find a user with same name
	const existingUser = await userModel.findOne({ userName });
	/// - null or undefined means not found
	if (nullOrUnd(existingUser)) {
		/// - we can create a new user
		const hashedPw = bcrypt.hashSync(password, salt);
		const newUser = new userModel({ userName, password: hashedPw });
		await newUser.save();
		req.session.userId = newUser._id;
		/// storing the current user id in session
		///storing it in during login or signup
		res.status(201).send({ success: "Signed up" });
	} else {
		res.status(401).send({ error: "Username already exists" });
	}
});
//>login
app.post("/login", async (req, res) => {
	const { userName, password } = req.body;
	const existingUser = await userModel.findOne({ userName });
	if (nullOrUnd(existingUser)) {
		res.status(404).send({ error: "Username not found" });
	} else {
		const hashedPw = existingUser.password;
		if (bcrypt.compareSync(password, hashedPw)) {
			req.session.userId = existingUser._id;
			res.status(201).send({ success: "Signed in" });
		} else {
			res.status(401).send({ error: "Password incorrect" });
		}
	}
});
//>authentication middleware
const authMw = async (req, res, next) => {
	if (nullOrUnd(req.session) || nullOrUnd(req.session.userId)) {
		res.status(401).send({ error: "Not logged in" });
	} else {
		next();
	}
};
//> get all todos
app.get("/todo", authMw, async (req, res) => {
	///finding all todos where the userId is same as the current userId
	const allTodos = await todoModel.find({ userId: req.session.userId });
	res.status(201).send(allTodos);
});
//>post a new todo
app.post("/todo", authMw, async (req, res) => {
	///req.body will only have the task inside it
	///we have to make the remaining properties
	const todo = req.body;
	todo.completed = false;
	todo.userId = req.session.userId;
	///this userId is used to filter the todos (search all todos with this userId and display)
	const newTodo = new todoModel(todo);
	await newTodo.save();
	res.status(201).send(newTodo);
});
//>PUT - edit an existing todo
app.put("/todo/:todoId", authMw, async (req, res) => {
	///directly storing the task value from req.body obj in task (Destructuring)
	const { task } = req.body;
	const todoId = req.params.todoId;
	try {
		///finding the exact todo that is being referred to
		///needs to have same todoId as the query param
		///needs to have same userId as contained in the current session
		const existingTodo = await todoModel.findOne({
			userId: req.session.userId,
			_id: todoId,
		});
		///if no such todo exists
		if (nullOrUnd(existingTodo)) {
			res.sendStatus(404);
		} else {
			///updating
			existingTodo.task = task;
			await existingTodo.save();
			res.status(201).send(existingTodo);
		}
	} catch (e) {
		///searching elements  by _id may return exceptions that can only be handled through catch
		res.sendStatus(401);
	}
});
//>delete a todo
app.delete("/todo/:todoId", authMw, async (req, res) => {
	const todoId = req.params.todoId;
	try {
		await todoModel.deleteOne({ userId: req.session.userId, _id: todoId });
		res.sendStatus(200);
	} catch (e) {
		res.sendStatus(404);
	}
});
//>logout
app.get("/logout", (req, res) => {
	if (!nullOrUnd(req.session)) {
		req.session.destroy(() => {
			res.sendStatus(200);
		});
	} else {
		res.sendStatus(200);
	}
});
//>getting the name of the current user
app.get("/userinfo", authMw, async (req, res) => {
	///as req.session.userId can never be manipulated it means that the id will never be invalid
	///So we can omit using try-catch block
	const user = await userModel.findById(req.session.userId);
	res.send({ userName: user.userName });
});

app.listen(8080, () => {
	console.log("app listening on port 8080");
});
