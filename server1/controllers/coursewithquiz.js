const express = require('express');
const router = express();

module.exports = (con) => {

    router.get("/coursedeatails", (req, res) => {
        const getcoursedeatails = 'SELECT * FROM coursewithquiz'; 
    
        con.query(getcoursedeatails, (err, result) => {
            if (err) {
                console.error("Error fetching course details:", err);
                return res.status(500).json({ message: "Internal server error", error: err });
            }
            res.status(200).json(result);
        });
    });

    router.get("/view/:id", (req, res) => {
        const { id } = req.params;  
        const getCourseDetails = 'SELECT * FROM coursewithquiz WHERE cwq_id = ?'; 
        
        con.query(getCourseDetails, [id], (err, result) => {  
            if (err) {
                console.error("Error fetching course details:", err);
                return res.status(500).json({ message: "Internal server error", error: err });
            }
            res.status(200).json(result); 
        });
    });
    


    router.post("/add", async (req, res) => {
        const { course_id, category_id, course_college_name, no_of_questions, questions_type , category_code } = req.body;
      
        const insertData = `
          INSERT INTO coursewithquiz (course_id, category_id, course_college_name, no_of_questions, questions_type , category_code)
          VALUES (?, ?, ?, ?, ? , ?)`;
      
        const values = [course_id, category_id, course_college_name, no_of_questions, questions_type , category_code];
      
        con.query(insertData, values, (err, result) => {
          if (err) {
            console.error("Error inserting data into MySQL:", err);
            return res.status(500).json({ error: "Failed to add course." });
          }
       
          res.status(200).json({ message: "Course added successfully!" });
        });
      });


      router.put("/update/:id", async (req, res) => {
        const { id } = req.params; 
        const { course_id, category_id, course_college_name, no_of_questions, questions_type , category_code } = req.body;
      console.log(req.body , req.params.id);
      
        const updateData = `
          UPDATE coursewithquiz
          SET course_id = ?, category_id = ?, course_college_name = ?, no_of_questions = ?, questions_type = ? , category_code = ?
          WHERE cwq_id = ?
        `;
      
        const values = [course_id, category_id, course_college_name, no_of_questions, questions_type, category_code,id];
      
        con.query(updateData, values, (err, result) => {
          if (err) {
            console.error("Error updating data in MySQL:", err.message);
            return res.status(500).json({ error: "Failed to update course." });
          }
      
          if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Course not found." });
          }
      
          res.status(200).json({ message: "Course updated successfully!" });
        });
      });
      

      router.delete("/delete/:id", (req, res) => {
        const { id } = req.params;
    
        const deleteQuery = 'DELETE FROM coursewithquiz WHERE cwq_id = ?';
    
        con.query(deleteQuery, [id], (err, result) => {
            if (err) {
                console.error("Error deleting course details:", err);
                return res.status(500).json({ message: "Internal server error", error: err });
            }
    
            if (result.affectedRows === 0) {
                return res.status(404).json({ message: "Course not found or already deleted." });
            }
    
            res.status(200).json({ message: "Course deleted successfully!" });
        });
    });
    


    

    return router
}