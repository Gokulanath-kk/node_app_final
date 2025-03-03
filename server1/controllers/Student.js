
module.exports = (con) => {
    const router = require("express").Router();

    router.get("/StudentData", (req, res) => {
        con.query("SELECT * FROM student;", (err, results) => {
          if (err) return res.status(500).send(err);
          res.send(results);
        });
      });


      router.get("/viewStudentData/:id"  , (req , res) => {
        const studentId = req.params.id
        const viewStudent =  "SELECT * FROM student where student_id = ? ";
        con.query(viewStudent , [studentId ] , (err , result) => {
          if(err) {
            return res.status(500).json({message : "the server is crashed"})
          }
          console.log(result);
          
          return res.status(200).json(result)
          
        })
      })


      router.post("/register", (req, res) => {
        const { name, email, mobile, year, department, cwq_id ,password , college } = req.body;
        console.log(req.body);
      
        if (!name || !email || !mobile || !year || !department || !cwq_id || !password || !college ) {
          return res.status(400).send("All fields are required");
        }
      
        const checkQuery = "SELECT * FROM student WHERE email = ? OR mobile = ?";
        con.query(checkQuery, [email, mobile], (err, results) => {
          if (err) {
            console.error("Error checking student data: ", err);
            return res.status(500).send(err);
          }
      
          if (results.length > 0) {
            const existingFields = results.map(row => (row.email === email ? "email" : "mobile")).join(" and ");
            return res.status(404).send({ message: `The ${existingFields} is already registered , use new ${existingFields}` });
          }
      
          const query = "INSERT INTO student (name, email, mobile, year, department, cwq_id , password , college) VALUES (?, ?, ?, ?, ?, ? , ? , ?)";
          con.query(query, [name, email, mobile, year, department, cwq_id , password ,college], (err, result) => {
            if (err) {
              console.error("Error inserting student data: ", err);
              return res.status(500).send(err);
            }
            res.status(201).send({ message: "Student data inserted successfully", id: result.insertId });
          });
        });
      });

      router.post("/studentLogin", async (req, res) => {
        try {
            const { email, password, category_code } = req.body;
    
           
            if (!email || !password || !category_code) {
                return res.status(400).json({ message: "All fields are required." });
            }
    
            const [courseResult] = await con.promise().query("SELECT * FROM coursewithquiz WHERE category_code = ?", [category_code]);
       
    
            if (courseResult.length === 0) {
                return res.status(404).json({ message: "Invalid course code" });
            }
    
            const [studentResult] = await con.promise().query(
                "SELECT * FROM student WHERE password = ? AND email = ?",
                [password, email]
            );
    
            if (studentResult.length === 0) {
                return res.status(404).json({ message: "Student not found. Please register or provide valid credentials." });
            }

            res.status(200).json(studentResult);
        } catch (error) {
            console.error("Error during login:", error.message, error.stack);
            res.status(500).json({ message: "Internal server error" });
        }
    });
    
    
    
      
      

    return router ;
}