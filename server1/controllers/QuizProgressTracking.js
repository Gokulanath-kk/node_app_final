const express = require('express');
const router = express()

module.exports = (con) => {

      
    router.post("/updateProgress", async (req, res) => {
        const { results } = req.body;
    
        console.log(results, '.....1.results............');
    
        if (!Array.isArray(results) || results.length === 0) {
            return res.status(400).json({ error: "No results provided" });
        }
    
        try {
            const summary = {
                success: [],
                deleted: [],
                errors: []
            };
    
            console.log(summary, '......2.summary........');
    
            // Get unique student_id and category_id from results
            const firstResult = results[0];
            const { student_id, category_id } = firstResult;
    
            // Delete existing records for this student and category
            try {
                const deleteQuery = `
                    DELETE FROM quiz_progress 
                    WHERE student_id = ? AND category_id = ?
                `;
                const [deleteResult] = await con.promise().query(deleteQuery, [student_id, category_id]);
                
                if (deleteResult.affectedRows > 0) {
                    summary.deleted.push({
                        message: `Deleted ${deleteResult.affectedRows} existing records for student ${student_id} in category ${category_id}`
                    });
                }
            } catch (deleteError) {
                console.error("Error deleting existing records:", deleteError.message);
                return res.status(500).json({
                    error: "Failed to delete existing records",
                    details: deleteError.message
                });
            }
    
            // Process new results
            for (const progress of results) {
                const { 
                    quiz_id, 
                    wrong_quiz, 
                    correct_quiz, 
                    total_quiz 
                } = progress;
    
                console.log(progress, '...3.Progress.........');
    
                try {
                    // Calculate attended quiz (now based on current batch of results)
                    const attended_quiz = results.findIndex(r => r.quiz_id === quiz_id) + 1;
                    const pending_quiz = Math.max(total_quiz - results.length, 0);
    
                    // Insert new quiz progress
                    const insertQuery = `
                        INSERT INTO quiz_progress (
                            student_id, 
                            category_id, 
                            quiz_id, 
                            attended_quiz, 
                            pending_quiz, 
                            wrong_quiz, 
                            correct_quiz, 
                            total_quiz
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?);
                    `;
    
                    const insertValues = [
                        student_id,
                        category_id,
                        quiz_id || null,
                        attended_quiz,
                        pending_quiz,
                        wrong_quiz,
                        correct_quiz,
                        total_quiz
                    ];
    
                    await con.promise().query(insertQuery, insertValues);
    
                    summary.success.push({
                        quiz_id,
                        message: `Quiz ID ${quiz_id} successfully recorded.`
                    });
                } catch (innerError) {
                    console.error(`Error processing Quiz ID ${quiz_id}:`, innerError.message);
                    summary.errors.push({
                        quiz_id,
                        error: innerError.message
                    });
                }
            }
    
            res.status(200).json({ 
                message: "Quiz progress updated", 
                summary,
                totalRecordsInserted: summary.success.length
            });
        } catch (error) {
            console.error("Error processing request:", error.message);
            res.status(500).json({
                error: "An error occurred while processing the request",
                details: error.message
            });
        }
    });

    router.post('/resultProgress', async (req, res) => {
        const { category_id, student_id } = req.body;
        console.log(req.body);
    
        if (!category_id || !student_id) {
            return res.status(400).json({ message: 'Course ID and Student ID are required' });
        }
    
        const fetchCourseProgressWithQuizData = `
            SELECT 
                qp.quiz_progress_id,
                qp.student_id,
                qp.category_id,
                qp.total_quiz,
                qp.attended_quiz,
                qp.pending_quiz,
                qp.wrong_quiz,
                qp.correct_quiz,
                qp.quiz_id,
                q.quiz_question,
                q.quiz_options,
                q.quiz_correct_answer,
                q.quiz_description
            FROM 
                quiz_progress qp
            LEFT JOIN 
                quiz q
            ON 
                qp.quiz_id = q.quiz_id
            WHERE 
                qp.category_id = ? AND qp.student_id = ?
        `;
    
        con.query(fetchCourseProgressWithQuizData, [category_id, student_id], (err, results) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ message: 'The Server is getting an error' });
            }
    
            console.log(results);
            return res.status(200).json(results);
        });
    });


    router.post('/resultPage', async (req, res) => {
        const { category_id, student_id } = req.body;
    
        if (!category_id || !student_id) {
            return res.status(400).json({ message: 'category_id ID and Student ID are required' });
        }
    
        const fetchCourseProgress = `
            SELECT * FROM quiz_progress 
            WHERE category_id = ? AND student_id = ?
        `;
    
        con.query(fetchCourseProgress, [category_id, student_id], (err, results) => {
            if (err) {
                return res.status(500).json({ message: 'The Server is getting error' });
            }
    
            return res.status(200).json(results);
        });
    });
    
    

    return router
}