const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const session = require("express-session");

const app = express();
app.use(express.json());
const cors = require("cors");
app.use(cors({ credentials: true, origin: "http://localhost:8081" }));
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

//note function to check null or undefined
const nullOrUnd = (val) => val === null || val === undefined;
const salt = 9;

//> - API requests
//>signup
app.post("/signup", async (req, res) => {
	const { userName, password } = req.body;
	//note - in the model find a user with same name
	const existingUser = await userModel.findOne({ userName });
	//note - null or undefined means not found
	if (nullOrUnd(existingUser)) {
		//note - we can create a new user
		const hashedPw = bcrypt.hashSync(password, salt);
		const newUser = new userModel({ userName, password: hashedPw });
		await newUser.save();
		req.session.userId = newUser._id;
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
	console.log("get all", req.session.userId);
	const allTodos = await todoModel.find({ userId: req.session.userId });
	res.status(201).send(allTodos);
});
//>post a new todo
app.post("/todo", authMw, async (req, res) => {
	console.log("session", req.session.userId);
	const todo = req.body;
	todo.completed = false;
	console.log("get all", req.session.userId);
	todo.userId = req.session.userId;
	const newTodo = new todoModel(todo);
	await newTodo.save();
	res.status(201).send(newTodo);
});
//>PUT - edit an existing todo
app.put("/todo/:todoId", authMw, async (req, res) => {
	const { task } = req.body;
	const todoId = req.params.todoId;
	try {
		const existingTodo = await todoModel.findOne({
			userId: req.session.userId,
			_id: todoId,
		});
		if (nullOrUnd(existingTodo)) {
			res.sendStatus(404);
		} else {
			existingTodo.task = task;
			await existingTodo.save();
			res.status(201).send(existingTodo);
		}
	} catch (e) {
		res.sendStatus(401);
	}
});
//>delete a todo
app.delete("/todo/:todoId", authMw, async (req, res) => {
	const todoId = req.params.todoId;
	console.log("delete session", req.session.userId);
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

app.get("/userinfo", authMw, async (req, res) => {
	const user = await userModel.findById(req.session.userId);
	res.send({ userName: user.userName });
});

app.listen(8080, () => {
	console.log("app listening on port 8080");
});
