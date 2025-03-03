const express = require('express');
const sql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');
require("dotenv").config()


const port = 3001;

const app = express();
app.use(cors());

app.use(bodyParser.json());

const con = require('./config/db.js');


// const con = sql.createConnection({
//   host: "103.191.208.137",
//   port: "3306",
//   user: "czierpdr_quiz_master",
//   password: "Xplore@2211",
//   database: "czierpdr_quiz_master"
// });

// const bcrypt = require('bcryptjs');
// const hashedPassword = bcrypt.hashSync('Xplore@123', 10);
// console.log(hashedPassword);


const courses = require("./controllers/Courses.js")(con);
app.use("/courses", courses);

const catagory = require("./controllers/Catagory.js")(con);
app.use("/catagory", catagory);

const quiz = require("./controllers/Quiz.js")(con);
app.use("/quiz", quiz);

const student = require("./controllers/Student.js")(con);
app.use("/student", student);

const quizprogress = require("./controllers/QuizProgressTracking.js")(con)
app.use("/quizprogress", quizprogress)

const review = require("./controllers/Review.js")(con)
app.use("/reviews" , review)

const admin = require("./controllers/Admin.js")(con);
app.use("/admin", admin);


const newcourse = require("./controllers/coursewithquiz.js")(con);
app.use("/newcourse", newcourse);

const softdelete = require("./controllers/Trash.js")(con);
app.use("/trash", softdelete);


app.listen(port, () => {
  console.log(`Express server is running on port ${port}...`);

});
  