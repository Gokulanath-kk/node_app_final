const express = require("express")
const router = express()

module.exports = (con) => {




router.get("/trashedquiz" , async (req , res) => {
    const  trashed_quiz = "select * from quiz where is_deleted = true;";
    con.query(trashed_quiz , (err , result ) =>{
        if(err) {
            res.status(500).json({ message : "the server softdeleted data was not shown"})
        }
        else {
            return res.status(200).json(result)
        }
    })
})


//delete 
router.delete("/trashdeletequiz/:id" , async (req , res) => {
    const id = req.params.id;
    console.log(req.params.id);
    
    const  trashed_quiz = "UPDATE quiz SET is_deleted = true where quiz_id = ?;";
    con.query(trashed_quiz , id, (err , result ) =>{
        if(err) {
            res.status(500).json({ message : "the server softdeleted data was not shown"})
        }
        else {
            return res.status(200).json(result)
        }
    })
})


router.delete("/undoTrash/:id" , async (req , res) => {
    const id = req.params.id;
    console.log(req.params.id);
    
    const  trashed_quiz = "UPDATE quiz SET is_deleted = false where quiz_id = ?;";
    con.query(trashed_quiz , id, (err , result ) =>{
        if(err) {
            res.status(500).json({ message : "the server softdeleted data was not shown"})
        }
        else {
            return res.status(200).json(result)
        }
    })
})

    //allsoftdelete
  router.delete('/softdeletedallquiz', async (req, res) => {
    try {
        const quizIds = req.body.quizIds; 
        
        if (!Array.isArray(quizIds) || quizIds.length === 0) {
            return res.status(400).json({ message: "Invalid input: quizIds must be a non-empty array" });
        }
 
        const placeholders = quizIds.map(() => '?').join(',');
        const query = `UPDATE quiz SET is_deleted = true WHERE quiz_id IN (${placeholders})`;

        con.query(query, quizIds, (err, result) => {
            if (err) {
                console.error("Error soft deleting quizzes:", err);
                return res.status(500).json({ message: "Error soft deleting quizzes", error: err });
            }
            
            res.status(200).json({ 
                message: `Successfully soft deleted ${result.affectedRows} quizzes`,
                affectedRows: result.affectedRows 
            });
        });
    } catch (error) {
        console.error("Server error:", error);
        res.status(500).json({ message: "Server error", error: error });
    }
});


//All ReStore Options

  router.delete('/restoreAllQuiz', async (req, res) => {
    try {
        const quizIds = req.body.quizIds; 
        
        if (!Array.isArray(quizIds) || quizIds.length === 0) {
            return res.status(400).json({ message: "Invalid input: quizIds must be a non-empty array" });
        }
 
        const placeholders = quizIds.map(() => '?').join(',');
        const query = `UPDATE quiz SET is_deleted = false WHERE quiz_id IN (${placeholders})`;

        con.query(query, quizIds, (err, result) => {
            if (err) {
                console.error("Error soft deleting quizzes:", err);
                return res.status(500).json({ message: "Error soft deleting quizzes", error: err });
            }
            
            res.status(200).json({ 
                message: `Successfully soft deleted ${result.affectedRows} quizzes`,
                affectedRows: result.affectedRows 
            });
        });
    } catch (error) {
        console.error("Server error:", error);
        res.status(500).json({ message: "Server error", error: error });
    }
});

    return router
}