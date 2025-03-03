const express = require('express');
const router = express();

module.exports = (con) => {
    // Get all courses
    router.get("/courseData", (req, res) => {
        con.query("SELECT * FROM course", (err, results) => {
            if (err) {
                console.error('Error fetching courses:', err);
                return res.status(500).json({
                    error: true,
                    message: "Internal server error while fetching courses"
                });
            }
            res.status(200).json(results);
        });
    });

    //get course and catory  table 

    router.get("/allData", (req, res) => {
        con.query(`
            SELECT 
    c.course_id,
    c.course_name,
    c.course_quiz_code,
    cc.category_id,
    cc.category_name,
    cc.category_code
    FROM 
        course c
    INNER JOIN 
        course_category cc
    ON 
        c.course_id = cc.course_id;
            ` , (err, results) => {
            if (err) {
                console.error('Error fetching courses:', err);
                return res.status(500).json({
                    error: true,
                    message: "Internal server error while fetching courses"
                });
            }
            res.status(200).json(results);
        });
    });

    // Get all course categories
    router.get("/coursecategory", (req, res) => {
        con.query("SELECT * FROM course_category", (err, results) => {
            if (err) {
                console.error('Error fetching course categories:', err);
                return res.status(500).json({
                    error: true,
                    message: "Internal server error while fetching course categories"
                });
            }
            res.status(200).json(results);
        });
    });

    // Get specific course by ID
    router.get("/viewCourse/:id", (req, res) => {
        const id = req.params.id;
        const viewCourse = "SELECT * FROM course WHERE course_id = ?";

        con.query(viewCourse, [id], (error, results) => {
            if (error) {
                console.error("Error fetching course details:", error);
                return res.status(500).json({
                    error: true,
                    message: "Internal server error while fetching course details"
                });
            }

            if (results.length === 0) {
                return res.status(404).json({
                    error: true,
                    message: "Course not found"
                });
            }
            res.status(200).json(results);
        });
    });

    // // Add new course
    router.post("/addCourse", (req, res) => {
        const { course_name, course_categories } = req.body;
        console.log(req.body);

        // Step 1: Check if the course already exists
        con.query(
            "SELECT course_id FROM course WHERE course_name = ?",
            [course_name],
            (err, results) => {
                if (err) {
                    console.error("Error checking course existence:", err);
                    return res.status(500).json({
                        error: true,
                        message: "Failed to check course existence",
                    });
                }

                if (results.length > 0) {
                    // Course exists, reuse the existing course_id
                    const courseId = results[0].course_id;

                    // Insert categories
                    const categoryValues = course_categories.map((category) => [courseId, category]);
                    con.query(
                        "INSERT INTO course_category (course_id, category_name) VALUES ?",
                        [categoryValues],
                        (err) => {
                            if (err) {
                                console.error("Error inserting categories:", err);
                                return res.status(500).json({
                                    error: true,
                                    message: "Failed to add categories",
                                });
                            }

                            res.status(201).json({
                                message: "Categories added successfully to the existing course",
                                courseId,
                            });
                        }
                    );
                } else {
                    // Step 2: Course does not exist, insert the new course
                    con.query(
                        "INSERT INTO course (course_name) VALUES (?)",
                        [course_name],
                        (err, courseResult) => {
                            if (err) {
                                console.error("Error inserting course:", err);
                                return res.status(500).json({
                                    error: true,
                                    message: "Failed to add course",
                                });
                            }

                            const courseId = courseResult.insertId;

                            // Insert categories
                            const categoryValues = course_categories.map((category) => [courseId, category]);
                            con.query(
                                "INSERT INTO course_category (course_id, category_name) VALUES ?",
                                [categoryValues],
                                (err) => {
                                    if (err) {
                                        console.error("Error inserting categories:", err);
                                        return res.status(500).json({
                                            error: true,
                                            message: "Failed to add categories",
                                        });
                                    }

                                    res.status(201).json({
                                        message: "Course and categories added successfully",
                                        courseId,
                                    });
                                }
                            );
                        }
                    );
                }
            }
        );
    });



    // add new Couruse 

    // router.post('/addCourse', (req, res) => {
    //     const { course_name } = req.body; // Extract course_name from the request body

    //     console.log(req.body);

    //     if (!course_name || course_name.trim() === '') {
    //         return res.status(400).json({ error: 'Course name is required' });
    //     }

    //     const query = "INSERT INTO course (course_name) VALUES (?)";

    //     con.query(query, [course_name], (err, results) => {
    //         if (err) {
    //             console.error('Database error:', err);
    //             return res.status(500).json({ error: 'Failed to add course. Please try again later.' });
    //         }

    //         return res.status(200).json({ message: 'Course added successfully!', course_id: results.insertId });
    //     });
    // });

    // Update course
    router.put('/updateCourses/:id', (req, res) => {
        const { id } = req.params;
        const { course_name } = req.body;

        const updateQuery = "UPDATE course SET course_name = ?  WHERE course_id = ?";

        con.query(updateQuery, [course_name, id], (err, result) => {
            if (err) {
                console.error("Error updating course:", err);
                return res.status(500).json({
                    error: true,
                    message: "Server error during course update"
                });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    error: true,
                    message: "Course not found"
                });
            }

            res.status(200).json({
                message: "Course updated successfully",
                courseId: id
            });
        });
    });

    // Delete course
    router.delete("/deleteCourse/:id", (req, res) => {
        const { id } = req.params;
        const deleteCourse = "DELETE FROM course WHERE course_id = ?";

        con.query(deleteCourse, [id], (err, result) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({
                    error: true,
                    message: "Error deleting course"
                });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    error: true,
                    message: `Course with ID ${id} not found`
                });
            }

            res.status(200).json({
                message: `Course deleted successfully`,
                courseId: id
            });
        });
    });

    return router;
};
