import React, { useState, useEffect, useCallback } from "react";
import { X, Plus } from "lucide-react";
import axiosInstance from "../../axiosInstance";

const AdminAddCourse = ({ onAddSuccess, onClose }) => {
  const [courses, setCourses] = useState([]);
  const [subCategories, setSubCategories] = useState([]);

  const [formData, setFormData] = useState({
    course_id: "",
    category_id: "",
    course_college_name: "",
    no_of_questions: "",
    questions_type: "random",
    category_code:''
  });
  const [error, setError] = useState("");
  const [courseCode, setCourseCode] = useState("");



  const generateRandomCourseCode = () => {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  
    const part1 = Array.from({ length: 3 })
      .map(() => letters.charAt(Math.floor(Math.random() * letters.length)))
      .join('');
    const part2 = String(Math.floor(Math.random() * 1000)).padStart(3, '0');
  
    return `${part1}-${part2}`;
  };
  
  const handleGenerateCourseCode = () => {
    setCourseCode(generateRandomCourseCode());
  };
  

  const fetchSubCategories = useCallback(async () => {
    try {
      const res = await axiosInstance.get("/catagory/category");
      setSubCategories(res.data);
    } catch (err) {
      console.error("Error fetching subcategories:", err);
      setError("Failed to load subcategories.");
    }
  }, []);

  const fetchcategoryid = useCallback(async (selectedCourseId) => {
    if (!selectedCourseId) return;
    try {
      const res = await axiosInstance.get(`/catagory/viewsubcatagory/${selectedCourseId}`);
      setSubCategories(res.data);
    } catch (err) {
      console.error("Error fetching subcategories for course:", err);
      setError("Failed to load subcategories for the selected course.");
    }
  }, []);

  const getAuthToken = () => {
    return sessionStorage.getItem('token');  
  };


  useEffect(() => {
    fetchcategoryid()

    const fetchCourses = async () => {
      try {
        const token = getAuthToken();

        const res = await axiosInstance.get("/courses/courseData",
          {
            headers: {
                Authorization: `Bearer ${token}` 
              }
        }

        );
        setCourses(res.data);
      } catch (err) {
        console.error("Error fetching courses:", err);
        setError("Failed to load course data.");
      }
    };

    fetchSubCategories();
    fetchCourses();
  }, [fetchSubCategories]);


  const handleInputChange = (field, value) => {
  setFormData((prev) => ({
    ...prev,
    [field]: value,
    ...(field === 'course_id' && { category_code: generateRandomCourseCode() })
  }));

  if (field === 'course_id') {
    fetchcategoryid(value);
  }
};

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
        console.log(formData);
        
      const res = await axiosInstance.post("/newcourse/add", formData);
      if (res.status === 200) {
        onAddSuccess();
        onClose();
      } else {
        setError("Failed to add course.");
      }
    } catch (err) {
      console.error("Error submitting form:", err);
      setError("An error occurred. Please try again.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-2xl shadow-2xl transform transition-all ease-in-out duration-300 flex flex-col max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 bg-gradient-to-r from-blue-600 to-blue-800 rounded-t-2xl border-b border-blue-700/30">
          <h3 className="text-xl font-bold text-white tracking-tight">Add New Course</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-white/30"
          >
            <X className="w-6 h-6 text-white" strokeWidth={2} />
          </button>
        </div>

        <div className="overflow-y-auto no-scrollbar flex-1">
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
              Category
            </label>
            <select
              value={formData.course_id}
              onChange={(e) => handleInputChange("course_id", e.target.value)}
              className="w-full rounded-lg border-gray-300 border p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select category</option>
              {courses.map((course) => (
                <option key={course.course_id} value={course.course_id}>
                  {course.course_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sub Category
            </label>
            <select
              value={formData.category_id}
              onChange={(e) => handleInputChange("category_id", e.target.value)}
              className="w-full rounded-lg border-gray-300 border p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              disabled={!formData.course_id}
            >
              <option value="">Select Subcategory</option>
              {subCategories.map((cat) => (
                <option key={cat.category_id} value={cat.category_id}>
                  {cat.category_name}
                </option>
              ))}
            </select>
          </div>

          {/* Course Name */}
          <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Course Name
              </label>
              <input
                type="text"
                value={formData.course_college_name}
                onChange={(e) => handleInputChange("course_college_name", e.target.value)}
                placeholder="Enter course name"
                className="w-full px-4 py-3 text-lg text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Number of Questions
              </label>
              <input
                type="text"
                value={formData.no_of_questions}
                onChange={(e) => handleInputChange("no_of_questions", e.target.value)}
                placeholder="Enter number of questions"
                className="w-full px-4 py-3 text-lg text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
            
              />
            </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
              Quiz Question Difficulty
            </label>
            <select
              value={formData.questions_type}
              onChange={(e) => handleInputChange("questions_type", e.target.value)}
              className="w-full rounded-lg border-gray-300 border p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select Difficulty</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
              <option value="random">Random</option>
            </select>
          </div>

          <div className="group">
                        <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                            Course Quiz Code
                        </h4>
                        <div className="flex items-center space-x-2">
                            <input
                                type="text"
                                value={courseCode}
                                onChange={(e) => setCourseCode(e.target.value)}
                                placeholder="Course Quiz Code"
                                className="flex-grow px-4 py-3 text-lg text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
                                required
                            />
                            <button
                                type="button"
                                onClick={handleGenerateCourseCode}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                            >
                                Generate
                            </button>
                        </div>
                    </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          {/* Buttons */}
          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <Plus size={20} />
              Add Course
            </button>
          </div>
        </form>
        </div>
      </div>
    </div>
  );
};

export default AdminAddCourse;
