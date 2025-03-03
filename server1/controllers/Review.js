const express = require('express')
const router = express()

module.exports = (con) => {


    router.post('/studentreview', (req, res) => {
        console.log(req.body);
        
        const {
            
            course_id,
            student_id,
            presentationSkills,
            responseToQuestions,
            sessionRating,
            interestedInCourses,
            interestedInInternships,
            technologies,
        } = req.body;
    
        const query = `
            INSERT INTO student_review 
            ( course_id, student_id, 
            presentation_skills, response_to_questions, session_rating, 
            interested_in_courses, interested_in_internships, technologies)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;
    
        con.query(
            query,
            [
                course_id,
                student_id,
                presentationSkills,
                responseToQuestions,
                sessionRating,
                interestedInCourses,
                interestedInInternships,
                JSON.stringify(technologies), 
            ],
            (err, result) => {
                if (err) {
                    console.log('Error inserting data:', err.message);
                    return res.status(500).json({ message: 'Database error' });
                }
                res.status(201).json({ message: 'Registration successful', data: result });
            }
        );
    });

    return router
}