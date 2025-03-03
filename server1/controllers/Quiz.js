const express = require('express');
const app = express();

module.exports = (con) => {

  app.get('/QuizData', async (req, res) => {
    const query = "SELECT * FROM quiz where is_deleted = false;";
    con.query(query, (err, result) => {
      if (err) {
        return res.status(500).json({ message: "Error fetching quizzes", error: err });
      }
      res.status(200).json(result);
    });
  });

  app.get('/category/:id', async (req, res) => {
    
    const id = req.params.id;
    const query = "SELECT * FROM quiz where category_id = ?;";
    con.query(query, [id] ,(err, result) => {
      if (err) {
        return res.status(500).json({ message: "Error fetching category", error: err });
      }
      res.status(200).json(result);
      
    });
  });


  app.delete('/deleteQuizes', async (req, res) => {
    try {
        const quizIds = req.body.quizIds; 
        
        if (!Array.isArray(quizIds) || quizIds.length === 0) {
            return res.status(400).json({ message: "Invalid input: quizIds must be a non-empty array" });
        }
 
        const placeholders = quizIds.map(() => '?').join(',');
        const query = `DELETE FROM quiz WHERE quiz_id IN (${placeholders})`;

        con.query(query, quizIds, (err, result) => {
            if (err) {
                console.error("Error deleting quizzes:", err);
                return res.status(500).json({ message: "Error deleting quizzes", error: err });
            }
            
            res.status(200).json({ 
                message: `Successfully deleted ${result.affectedRows} quizzes`,
                affectedRows: result.affectedRows 
            });
        });
    } catch (error) {
        console.error("Server error:", error);
        res.status(500).json({ message: "Server error", error: error });
    }
});




  app.get('/ViewQuiz/:id', async (req, res) => {
    const id = req.params.id;

    if (!id || isNaN(id)) {
      return res.status(400).json({ message: "Invalid quiz ID" });
    }

    const query = "SELECT * FROM quiz WHERE quiz_id = ?";

    con.query(query, [id], (err, result) => {
      if (err) {
        console.error("Error fetching quizzes:", err);
        return res.status(500).json({ message: "Error fetching quizzes", error: err });
      }

      if (result.length === 0) {
        return res.status(404).json({ message: "Quiz not found" });
      }

      res.status(200).json(result);
    });
  });

  app.get('/countQuiz/:id', async (req, res) => {
    const id = req.params.id;

    if (!id || isNaN(id)) {
      return res.status(400).json({ message: "Invalid course_id " });
    }

    const query = `SELECT COUNT(*) AS total_quiz
                    FROM quiz
                    WHERE course_id = ?;
                    `;

    con.query(query, [id], (err, result) => {
      if (err) {
        console.error("Error fetching quizzes:", err);
        return res.status(500).json({ message: "Error fetching total_quizzes", error: err });
      }

      if (result.length === 0) {
        return res.status(404).json({ message: "toatal quiz not found" });
      }

      res.status(200).json({ total_quiz: result[0].total_quiz });
    });
  });


  app.get('/coursequiz/:id', async (req, res) => {
    const id = req.params.id
    const query = "SELECT * FROM quiz where course_id = ? ;";
    con.query(query, [id],(err, result) => {
      if (err) {
        return res.status(500).json({ message: "Error fetching quizzes", error: err });
      }
      res.status(200).json(result);
    });
  });

  app.get('/quizzes/:id', async (req, res) => {
    const quiz_id = req.params.id;
    const query = "SELECT * FROM quiz WHERE quiz_id = ?";
    con.query(query, [quiz_id], (err, result) => {
      if (err) {
        return res.status(500).json({ message: "Error fetching quiz", error: err });
      }
      res.status(200).json(result);
    });
  });

  app.post("/addQuiz", (req, res) => {
    const {
      course_id,
      category_id,
      quiz_name,
      quiz_question,
      quiz_options,
      quiz_correct_answer,
      quiz_description,
      quiz_type
    } = req.body;

    if (!course_id || !category_id || !quiz_name || !quiz_question || !quiz_options || !quiz_correct_answer || !quiz_type) {

      return res.status(400).json({ message: "All required fields must be provided" });
    }

    let options, correctAnswers;
    try {
      options = JSON.parse(quiz_options);
      correctAnswers = JSON.parse(quiz_correct_answer);
    } catch (error) {
      return res.status(400).json({ message: "Invalid option format", error: error.message });
    }

    if (!Array.isArray(options) || options.length < 2) {
      return res.status(400).json({ message: "At least two options are required" });
    }

    if (!Array.isArray(correctAnswers) || correctAnswers.length < 1) {
      return res.status(400).json({ message: "At least one correct answer is required" });
    }

    const AddQuizQuery = `
        INSERT INTO quiz(
      course_id,
      category_id,
      quiz_name,
      quiz_question,
      quiz_options,
      quiz_correct_answer,
      quiz_description,
      quiz_type
    )
    VALUES(?, ?, ?, ?, ?, ?, ? , ?);
    `;

    con.query(
      AddQuizQuery,
      [
        course_id,
        category_id,
        quiz_name,
        quiz_question,
        quiz_options,      // Store as JSON string
        quiz_correct_answer, // Store as JSON string
        quiz_description,
        quiz_type
      ],
      (err, result) => {
        if (err) {
          console.error("Error adding quiz:", err);
          return res.status(500).json({
            message: "Internal server error",
            error: err.message
          });
        }

        return res.status(200).json({
          message: "Quiz added successfully.",
          quiz_id: result.insertId
        });
      }
    );
  });


  app.post("/addQuizExcel", (req, res) => {
    const { course_id, quizzes, category_id } = req.body;
  
    console.log(req.body);
    
  
    if (!course_id || !Array.isArray(quizzes) || quizzes.length === 0) {
      return res.status(400).json({ message: "Course ID and quiz data are required." });
    }
  
    const AddQuizQuery = `
      INSERT INTO quiz (
        course_id,
        category_id,
        quiz_name,
        quiz_question,
        quiz_options,
        quiz_correct_answer,
        quiz_description,
        quiz_type
      ) VALUES ?;
    `;
    
    const values = [];
    const errors = [];
    try {
      quizzes.forEach((quiz, index) => {
        const {
          quiz_name,
          quiz_question,
          quiz_options,
          quiz_correct_answer,
          quiz_description,
          quiz_type,
        } = quiz;

        const quizId = index + 1;
  
        if (
          !quiz_name ||
          !quiz_question ||
          !quiz_options ||
          !quiz_correct_answer ||
          !quiz_type
        ) {
          errors.push({ quizId, error: "All required fields must be provided." });
          return;
        }
  
        const options = Array.isArray(quiz_options)
          ? quiz_options
          : JSON.parse(quiz_options);
  
        const correctAnswers = Array.isArray(quiz_correct_answer)
          ? quiz_correct_answer
          : JSON.parse(quiz_correct_answer);
  
        if (!Array.isArray(options) || options.length < 2) {
          errors.push({ quizId, error: "Each quiz must have at least two options." });
          return;
        }
  
        if (!Array.isArray(correctAnswers) || correctAnswers.length < 1) {
          errors.push({ quizId, error: "Each quiz must have at least one correct answer." });
          return;
        }
  
        values.push([
          course_id,
          category_id,
          quiz_name,
           quiz_question ,
          JSON.stringify(options),
          JSON.stringify(correctAnswers),
          quiz_description || null,
          quiz_type,
        ]);
      });
  
      if (errors.length > 0) {
        return res.status(400).json({ message: "Invalid quiz data.", errors });
      }
    } catch (error) {
      return res.status(400).json({ message: "Invalid quiz data.", error: error.message });
    }
  
    con.query(AddQuizQuery, [values], (err, result) => {
      if (err) {
        console.error("Error adding quizzes:", err);
        return res.status(500).json({
          message: "Internal server error while adding quizzes.",
          error: err.message,
        });
      }
  
      return res.status(200).json({
        message: "Quizzes added successfully.",
        insertedCount: result.affectedRows,
      });
    });
  });
  
  


  app.put("/updateQuiz/:quiz_id", (req, res) => {
    const { quiz_id } = req.params;
    let { course_id, category_id , quiz_name, quiz_question, quiz_options, quiz_correct_answer, quiz_description, quiz_type } = req.body;


    try {
      quiz_option = typeof quiz_options === "string" ? JSON.parse(quiz_options) : quiz_options;
      quiz_correct_answer = typeof quiz_correct_answer === "string" ? JSON.parse(quiz_correct_answer) : quiz_correct_answer;
    } catch (err) {
      return res.status(400).json({ message: "Invalid JSON format in quiz_options or quiz_correct_answer" });
    }

    if (!course_id || !quiz_name || !quiz_question || !quiz_options || !quiz_correct_answer || !quiz_description || !quiz_type) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const UpdateQuizQuery = `
    UPDATE quiz
    SET course_id = ?, category_id = ? , quiz_name = ?, quiz_question = ?, quiz_options = ?, quiz_correct_answer = ?, quiz_description = ?, quiz_type = ?
      WHERE quiz_id = ?;
    `;

    con.query(UpdateQuizQuery, [
      course_id,
      category_id,
      quiz_name,
      quiz_question,
      JSON.stringify(quiz_options), 
      JSON.stringify(quiz_correct_answer), 
      quiz_description,
      quiz_type,
      quiz_id,
    ], (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "Internal server error" });
      } else if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Quiz not found" });
      } else {
        return res.status(200).json({ message: "Quiz updated successfully" });
      }
    });
  });



  app.delete("/deleteQuiz/:id", (req, res) => {
    const id = req.params.id;

    const deletequiz = `DELETE FROM quiz WHERE quiz_id = ?; `;
    con.query(deletequiz, [id], (err, result) => {
      if (err) {
        return res.status(500).json({ message: "Internal server error. Quiz not deleted." });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Quiz not found. Nothing to delete." });
      }
      return res.status(200).json({ message: "Quiz deleted successfully." });
    });
  });



  app.get('/topicwithquizes', async (req, res) => {
    const topicQuery = "SELECT * FROM course";
    
  
    con.query(topicQuery, async (err, topics) => {
        if (err) {
            return res.status(500).json({ error: "An error occurred while getting topics." });
        }
        
        if (topics.length === 0) {
            return res.status(404).json({ message: "No topics found." });
        }
        try {
            const topicsWithQuiz = await Promise.all(topics.map(async (topic) => {
                const Getquiz = "SELECT * FROM quiz WHERE course_id = ?";
                const quizes = await new Promise((resolve, reject) => {
                    con.query(Getquiz, [topic.course_id], (err, quizResult) => {
                        if (err) reject(err);
                        else resolve(quizResult);
                    });
                });
                return {
                    ...topic,
                    quizes
                };
            }));
            res.status(200).json({ topics: topicsWithQuiz });
        } catch (error) {
            res.status(500).json({ error: "An error occurred while getting quizes." });
        }
    });
  });


  // app.delete('/quizzes/:id', async (req, res) => {
  //   const quiz_id = req.params.id;
  //   const query = "UPDATE quiz SET is_deleted = true WHERE quiz_id = ?;";
  //   con.query(query, [quiz_id], (err, result) => {
  //     if (err) {
  //       return res.status(500).json({ message: "Error deleting quiz", error: err });
  //     }

  //   });
  // });



  return app;

}