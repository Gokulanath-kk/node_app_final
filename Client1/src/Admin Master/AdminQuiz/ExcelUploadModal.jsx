import React, { useState, useEffect, useCallback } from 'react';
import * as XLSX from 'xlsx';
import axiosInstance from "../../axiosInstance";
import { Upload, X } from 'lucide-react';

const ExcelUploadModal = ({ onClose, onUploadSuccess }) => {
  const [file, setFile] = useState(null);
  const [subCatagoryName, setSubCatagoryName] = useState([]);
  const [filteredSubCategories, setFilteredSubCategories] = useState([]);
  const [previewData, setPreviewData] = useState([]);
  const [uploadError, setUploadError] = useState(null);
  const [courseName, setCourseName] = useState([]);
  const [formData, setFormData] = useState({
    course_id: '',
    category_id:''
  });

  const fetchSubCategory = useCallback(async () => {
    try {
      const res = await axiosInstance.get("/catagory/category");
      setSubCatagoryName(res.data);
    } catch (err) {
      console.error("Error:", err);
    }
  }, []);

  const fetchFilteredSubCategories = useCallback(async (selectedCourseId) => {
    if (!selectedCourseId) {
      setFilteredSubCategories([]);
      return;
    }
    try {
      const res = await axiosInstance.get(`/catagory/viewsubcatagory/${selectedCourseId}`);
      setFilteredSubCategories(res.data);
    } catch (err) {
      console.error("Error fetching subcategories for course:", err);
      setUploadError("Failed to load subcategories for the selected course.");
    }
  }, []);

  const getAuthToken = () => {
    return sessionStorage.getItem('token');
  };
  
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const token = getAuthToken();
        if (!token) {
          throw new Error("Authentication token is missing.");
        }
  
        const res = await axiosInstance.get("/courses/courseData", {
          headers: {
            Authorization: `Bearer ${token}`, 
          },
        });
        setCourseName(res.data);
      } catch (err) {
        console.error("Error fetching course data:", err);
        setUploadError("Failed to fetch course data. Please try again.");
      }
    };
  
    fetchSubCategory(); 
    fetchCourses(); 
  }, [fetchSubCategory]); 
  

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
      ...(field === 'course_id' && { category_id: '' })
    }));
  
    if (field === 'course_id') {
      fetchFilteredSubCategories(value);
    }
  };

  

  const handleFileChange = (e) => {
    const uploadedFile = e.target.files[0];
    setFile(uploadedFile);

    const reader = new FileReader();
    reader.onload = (event) => {
      const workbook = XLSX.read(event.target.result, { type: 'binary' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);
      setPreviewData(jsonData);
    };
    reader.readAsBinaryString(uploadedFile);
  };

  const parseOptions = (options) => {
    if (Array.isArray(options)) {
      return options.map((opt, index) => ({
        id: index,
        text: String(opt)
      }));
    }
    if (typeof options !== 'string') {
      return [{
        id: 0,
        text: String(options)
      }];
    }
    const result = [];
    let currentItem = '';
    let bracketCount = 0;
    let braceCount = 0;
    let parenthesesCount = 0;
    let currentId = 0;
  
    for (let i = 0; i < options.length; i++) {
      const char = options[i];
   
      if (char === '[') bracketCount++;
      if (char === ']') bracketCount--;
      if (char === '{') braceCount++;
      if (char === '}') braceCount--;
      if (char === '(') parenthesesCount++;
      if (char === ')') parenthesesCount--;
  
      if (char === ',' && bracketCount === 0 && braceCount === 0 && parenthesesCount === 0) {
        if (currentItem.trim()) {
          result.push({
            id: currentId++,
            text: currentItem.trim()
          });
        }
        currentItem = '';
      } else {
        currentItem += char;
      }
    }
  
    if (currentItem.trim()) {
      result.push({
        id: currentId,
        text: currentItem.trim()
      });
    }
  
    return result;
  };
  
  const parseCorrectAnswers = (correctAns, options) => {
    if (!correctAns || (Array.isArray(correctAns) && correctAns.length === 0)) {
      return [];
    }
  
    const correctAnsStr = Array.isArray(correctAns) ? correctAns.join(',') : String(correctAns);
  
    const correctAnswers = correctAnsStr
      .replace(/[\[\]]/g, '')  
      .split(',')
      .map(ans => ans.trim());
  
    return options.filter(option => 
      correctAnswers.some(ans => option.text.includes(ans))
    ).map(option => ({
      ...option,
      isCorrect: true
    }));
  };
  
  const validateExcelData = (data) => {
    const requiredColumns = [
      "quiz_name",
      "quiz_question",
      "quiz_options",
      "quiz_correct_answer",
      "quiz_description",
      "quiz_type",
    ];
  
    const missingColumns = requiredColumns.filter(
      (col) => !Object.keys(data[0] || {}).includes(col)
    );
  
    if (missingColumns.length > 0) {
      throw new Error(`Missing required columns: ${missingColumns.join(", ")}`);
    }
  
    return data.map((row) => {
      const parsedOptions = parseOptions(row.quiz_options);
      const correctAnswers = parseCorrectAnswers(row.quiz_correct_answer, parsedOptions);
      return {
        quiz_name: row.quiz_name,
        quiz_question: row.quiz_question,
        quiz_options: parsedOptions, 
        quiz_correct_answer: correctAnswers, 
        quiz_description: row.quiz_description || "",
        quiz_type: row.quiz_type,
      };
    });
  };

  const handleUpload = async () => {
    if (!file) {
      setUploadError('Please select a file');
      return;
    }

    try {
      const validatedData = validateExcelData(previewData);
      const response = await axiosInstance.post('/quiz/addQuizExcel', {
        course_id: formData.course_id,
        category_id:formData.category_id,
        quizzes: validatedData,
      });

      onUploadSuccess(response.data);
      onClose();
    }  catch (error) {
      console.error('Upload error:', error);
      if (error.response && error.response.data && error.response.data.errors) {
        const errorQuizIds = error.response.data.errors.map((err) => err.quizId);
        const errorMessage = `Invalid quiz data for quiz IDs: ${errorQuizIds.join(', ')}`;
        setUploadError(errorMessage);
      } else {
        setUploadError(error.message);
      }
    }
  };



  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-blue-500/20 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-xl w-full max-w-2xl shadow-2xl overflow-hidden duration-200 flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-6 bg-gradient-to-r from-blue-800 to-blue-800 rounded-t-xl border-b">
          <h2 className="text-2xl font-bold text-white">Add Quiz Via Excel</h2>
          <button
            onClick={onClose}
            className="p-2 text-white hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {uploadError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {uploadError}
          </div>
        )}

        <div className="overflow-y-auto no-scrollbar flex-1">
          <div className="p-6 space-y-6 overflow-y-auto overflow-hidden">
          <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={formData.course_id}
                onChange={(e) => handleInputChange('course_id', e.target.value)}
                className="w-full rounded-lg border-gray-300 border p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Category</option>
                {courseName.map((course) => (
                  <option key={course.course_id} value={course.course_id}>
                    {course.course_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sub Category</label>
              <select
                value={formData.category_id}
                onChange={(e) => handleInputChange('category_id', e.target.value)}
                className="w-full rounded-lg border-gray-300 border p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                disabled={!formData.course_id}
              >
                <option value="">Select Sub Category</option>
                {filteredSubCategories.map((cat) => (
                  <option key={cat.category_id} value={cat.category_id}>
                    {cat.category_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <input
                type="file"
                accept=".xlsx, .xls"
                onChange={handleFileChange}
                className="hidden"
                id="excelUpload"
              />
              <label
                htmlFor="excelUpload"
                className="cursor-pointer flex flex-col items-center"
              >
                <Upload className="w-12 h-12 text-gray-400 mb-4" />
                <p className="text-gray-600">
                  {file
                    ? `Selected File: ${file.name}`
                    : 'Click to upload Excel file (.xlsx, .xls)'}
                </p>
              </label>
            </div>

            {previewData.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Preview Quizzes</h3>
                <div className="max-h-64 overflow-y-auto border border-gray-300 rounded-lg">
                  <table className="w-full border-collapse">
                    <thead className="sticky top-0 bg-gray-100">
                      <tr>
                        {Object.keys(previewData[0]).map((header) => (
                          <th key={header} className="border p-2 text-sm text-left">
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {previewData.map((row, rowIndex) => (
                        <tr key={rowIndex} className="border hover:bg-gray-50">
                          {Object.values(row).map((value, cellIndex) => (
                            <td
                              key={cellIndex}
                              className="border p-2 text-xs break-words whitespace-nowrap overflow-hidden text-ellipsis max-w-xs"
                              title={typeof value === 'object' ? JSON.stringify(value) : value}
                            >
                              {typeof value === 'object' ? JSON.stringify(value) : value}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {previewData.length > 5 && (
                  <p className="text-sm text-gray-500">
                    Scroll to view more rows.
                  </p>
                )}
              </div>
            )}

            <div className="flex-none flex items-center justify-end gap-x-4 pt-6">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleUpload}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                disabled={!file}
              >
                Upload Quizzes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

  );
};

export default ExcelUploadModal;
