const express = require('express');
const router = express();

module.exports = (con) => {

    // GET: Fetch all categories
    router.get("/category", (req, res) => {
        const query = "SELECT * FROM course_category"; 

        con.query(query, (err, result) => {
            if (err) {
                console.error("Error executing query:", err);
                return res.status(500).json({
                    success: false,
                    message: "Failed to fetch categories. Please try again later.",
                });
            }

            res.status(200).json(result);
        });
    });


    router.get("/viewsubcatagory/:id", (req, res) => {
        const id = req.params.id
        const query = `SELECT 
                cc.category_id,
                cc.category_name,
                cc.category_code,
                c.course_id,
                c.course_name,
                c.course_quiz_code
            FROM 
                course_category cc
            INNER JOIN 
                course c
            ON 
                cc.course_id = c.course_id
            WHERE 
                cc.course_id = ?;
            `; 

        con.query(query, [id] ,(err, result) => {
            if (err) {
                console.error("Error executing query:", err);
                return res.status(500).json({
                    success: false,
                    message: "Failed to fetch categories. Please try again later.",
                });
            }
            console.log(result);
            

            res.status(200).json(result);
        });
    });


    router.get("/viewcategory/:id", (req, res) => {
        const { id } = req.params;
        const query = "SELECT * FROM course_category WHERE category_id = ?";

        con.query(query, [id], (err, result) => {
            if (err) {
                console.error("Error executing query:", err);
                return res.status(500).json({
                    success: false,
                    message: "Failed to fetch category. Please try again later.",
                });
            }

            if (result.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Category not found.",
                });
            }

            res.status(200).json({
                success: true,
                data: result[0],
            });
        });
    });

    router.get("/courseCategory/:id", (req, res) => {
        const { id } = req.params;
        const query = "SELECT * FROM course_category WHERE course_id = ?";

        con.query(query, [id], (err, result) => {
            if (err) {
                console.error("Error executing query:", err);
                return res.status(500).json({
                    success: false,
                    message: "Failed to fetch category. Please try again later.",
                });
            }

            if (result.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Category not found.",
                });
            }

            res.status(200).json(result);
        });
    });

    
    router.post('/addCategory', (req, res) => {
        const { course_id, category_name, category_code } = req.body;

        if (!course_id || !category_name) {
            return res.status(400).json({ message: 'Course ID and Category Name are required.' });
        }

        const query = `INSERT INTO course_category (course_id, category_name, category_code) VALUES (?, ?, ?)`;

        con.query(query, [course_id, category_name, category_code || null], (err, result) => {
            if (err) {
                console.error('Error inserting category:', err);
                return res.status(500).json({ message: 'Failed to add category', error: err.message });
            }

            // Success response
            return res.status(200).json({
                message: 'Category added successfully',
                category_id: result.insertId, 
            });
        });
    });

    // // DELETE: Remove a category by category_id
    // router.delete('/delete/:id', (req, res) => {
    //     const { id } = req.params;
    //     const query = "DELETE FROM course_category WHERE category_id = ?";

    //     con.query(query, [id], (err, result) => {
    //         if (err) {
    //             console.error('Error deleting category:', err);
    //             return res.status(500).json({
    //                 success: false,
    //                 message: 'Failed to delete category.',
    //             });
    //         }

    //         if (result.affectedRows === 0) {
    //             return res.status(404).json({
    //                 success: false,
    //                 message: 'Category not found.',
    //             });
    //         }

    //         res.status(200).json({
    //             success: true,
    //             message: 'Category deleted successfully.',
    //         });
    //     });
    // });

    router.delete('/delete/:id', async (req, res) => {
        const { id } = req.params;
    
        try {
            const findCourseQuery = "SELECT course_id FROM course_category WHERE category_id = ?";
            const courseResults = await queryAsync(findCourseQuery, [id]);
    
            if (courseResults.length === 0) {
                return res.status(404).json({ 
                    success: false, 
                    message: 'No course found for this category.' 
                });
            }
    
            const courseId = courseResults[0].course_id;
    
            // Delete the category first
            const deleteCategoryQuery = "DELETE FROM course_category WHERE category_id = ?";
            await queryAsync(deleteCategoryQuery, [id]);
    
            // Check remaining categories for the course
            const remainingCategoriesQuery = "SELECT COUNT(*) as category_count FROM course_category WHERE course_id = ?";
            const categoryCounts = await queryAsync(remainingCategoriesQuery, [courseId]);
    
            // If no categories remain, delete the course
            if (categoryCounts[0].category_count === 0) {
                const deleteCourseQuery = "DELETE FROM course WHERE course_id = ?";
                await queryAsync(deleteCourseQuery, [courseId]);
            }
    
            res.status(200).json({ 
                success: true, 
                message: 'Category deleted successfully.',
                courseDeleted: categoryCounts[0].category_count === 0
            });
    
        } catch (error) {
            console.error('Error deleting category:', error);
            res.status(500).json({ 
                success: false, 
                message: 'Failed to delete category.',
                error: error.message 
            });
        }
    });
    
    function queryAsync(sql, params) {
        return new Promise((resolve, reject) => {
            con.query(sql, params, (error, results) => {
                if (error) return reject(error);
                resolve(results);
            });
        });
    }
    
    function queryAsync(sql, params) {
        return new Promise((resolve, reject) => {
            con.query(sql, params, (error, results) => {
                if (error) return reject(error);
                resolve(results);
            });
        });
    }

    // router.put('/updatecategory/:id', (req, res) => {
    //     const { id } = req.params;
    //     const { course_id, category_name,course_name } = req.body;
    //     console.log(req.body);
    
    //     if (!course_id || !category_name) {
    //         return res.status(400).json({ message: 'Course ID and Category Name are required.' });
    //     }
    
    //     const query = `UPDATE course_category SET course_id = ?, category_name = ? WHERE category_id = ?`;
    
    //     con.query(query, [course_id, category_name, id], (err, result) => {
    //         if (err) {
    //             console.error('Error updating category:', err);
    //             return res.status(500).json({
            
    //                 message: 'Failed to update category.'
    //             });
    //         }
    
    //         if (result.affectedRows === 0) {
    //             return res.status(404).json({
               
    //                 message: 'Category not found.'
    //             });
    //         }
    
    //         res.status(200).json({
    //             message: 'Category updated successfully.'
    //         });
    //     });
    // });
   
   
   
    router.put('/updatecategory/:id', async (req, res) => {
        const { id } = req.params;
        const { course_id, category_name, course_name } = req.body;
    
        if (!course_id || !category_name || !course_name) {
            return res.status(400).json({ message: 'Course ID, Category Name, and Course Name are required.' });
        }
    
        const updateCategoryQuery = `
            UPDATE course_category 
            SET course_id = ?, category_name = ? 
            WHERE category_id = ?
        `;
    
        const updateCourseQuery = `
            UPDATE course 
            SET course_name = ? 
            WHERE course_id = ?
        `;
    
        try {
            const categoryResult = await new Promise((resolve, reject) => {
                con.query(updateCategoryQuery, [course_id, category_name, id], (err, result) => {
                    if (err) return reject(err);
                    resolve(result);
                });
            });
            const courseResult = await new Promise((resolve, reject) => {
                con.query(updateCourseQuery, [course_name, course_id], (err, result) => {
                    if (err) return reject(err);
                    resolve(result);
                });
            });
            if (categoryResult.affectedRows === 0) {
                return res.status(404).json({ message: 'Category not found.' });
            }
    
            res.status(200).json({
                message: 'Category and Course updated successfully.',
            });
        } catch (error) {
            console.error('Error updating data:', error);
            res.status(500).json({
                message: 'Failed to update category and course name.',
                error: error.message,
            });
        }
    });
    
    
    return router;
}
