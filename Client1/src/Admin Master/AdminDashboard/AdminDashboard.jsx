import React, { useEffect, useState } from 'react';
import { Pie, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, BarElement, Title, Tooltip, Legend, CategoryScale, LinearScale } from 'chart.js';
import { ChartBar, PieChart } from 'lucide-react';
import axiosInstance from '../../axiosInstance';

ChartJS.register(ArcElement, BarElement, Title, Tooltip, Legend, CategoryScale, LinearScale);

const AdminDashboard = () => {
    const [pieChartData, setPieChartData] = useState({});
    const [categories, setCategories] = useState([]);
    const [courses, setCourses] = useState([]);
    const [students, setStudents] = useState([]);
    const [chartData, setChartData] = useState({});
    const [counts, setCounts] = useState({
        "1st Year": 0,
        "2nd Year": 0,
        "3rd Year": 0,
        "4th Year": 0,
    });
    const [labelCounts, setLabelCounts] = useState([]);

    const fetchStudent = async () => {
        try {
            const res = await axiosInstance.get("/student/studentData");

            setStudents(res.data);

            const allYears = ["1st Year", "2nd Year", "3rd Year", "4th Year"];
            const countsByYear = allYears.reduce((acc, year) => {
                acc[year] = 0;
                return acc;
            }, {});

            res.data.forEach(student => {
                if (countsByYear[student.year] !== undefined) {
                    countsByYear[student.year] += 1;
                }
            });
            setCounts(countsByYear);

            setChartData({
                labels: allYears,
                datasets: [{
                    label: 'Student Count',
                    data: allYears.map(year => countsByYear[year]),
                    backgroundColor: [
                        'rgba(54, 162, 235, 0.6)',
                        'rgba(75, 192, 192, 0.6)',
                        'rgba(153, 102, 255, 0.6)',
                        'rgba(255, 159, 64, 0.6)'
                    ],
                    borderWidth: 1
                }]
            });
        } catch (error) {
            console.log('error', 'Failed to fetch students');
        }
    };

    const fetchCourses = async () => {
        try {
            const res = await axiosInstance.get("/courses/CourseData");
            setCourses(res.data);
        } catch (error) {
            console.log('error', 'Failed to fetch courses');
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await axiosInstance.get('/catagory/category');
            setCategories(response.data);
        } catch (error) {
            console.log('error', 'Failed to fetch categories');
        }
    };

    const processChartData = () => {
        if (courses.length === 0 || categories.length === 0) return;

        const courseCategoryCounts = courses.map((course) => {
            const count = categories.filter(cat => cat.course_id === course.course_id).length;
            return { name: course.course_name.trim(), count };
        });

        setLabelCounts(courseCategoryCounts);

        setPieChartData({
            labels: courseCategoryCounts.map(item => item.name),
            datasets: [{
                data: courseCategoryCounts.map(item => item.count),
                backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF','#808080','#FF00FF'],
                hoverBackgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'],
            }]
        });
    };

    useEffect(() => {
        fetchCategories();
        fetchCourses();
        fetchStudent();
    }, []);

    useEffect(() => {
        processChartData();
    }, [courses, categories]);

    return (
        <div className="min-h-screen min-w-screen bg-gray-50">
        <div className="max-w-full mx-auto px-6 py-8 sm:px-8 lg:px-12"> {/* Increased container padding and width */}
            {/* Header Section */}
            <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 rounded-xl shadow-xl mb-8 p-8 transition-all duration-300 hover:shadow-2xl">
                <div className="max-w-6xl"> {/* Increased width of header */}
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
                        Xplore It Corp
                    </h1>
                    <h2 className="text-2xl md:text-3xl font-semibold text-white/90 mb-4">
                        Professional IT Training Institute
                    </h2>
                    <p className="text-lg text-white/80">
                        Best IT Training with Certification in Coimbatore. 
                        Best IT Training with placement in Coimbatore. 
                        IT courses. Web development!
                    </p>
                </div>
            </div>
    
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-700">Total Students</h3>
                        <ChartBar className="h-6 w-6 text-blue-500" />
                    </div>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{students.length}</p>
                </div>
                <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-700">Total Courses</h3>
                        <PieChart className="h-6 w-6 text-green-500" />
                    </div>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{courses.length}</p>
                </div>
                <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-700">Total Categories</h3>
                        <ChartBar className="h-6 w-6 text-purple-500" />
                    </div>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{categories.length}</p>
                </div>
            </div>
    
            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10"> {/* Increased gap and width */}
                {/* Bar Chart */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <h3 className="text-xl font-semibold text-gray-800 mb-6">Student List</h3>
                    <div className="h-80">
                        {chartData.labels?.length > 0 ? (
                            <Bar
                                data={chartData}
                                options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    plugins: {
                                        legend: { position: 'top' },
                                        title: { display: false }
                                    }
                                }}
                            />
                        ) : (
                            <div className="flex items-center justify-center h-full">
                                <p className="text-gray-500">Loading data...</p>
                            </div>
                        )}
                    </div>
                    <div className="mt-6 flex flex-wrap gap-4 justify-center">
                        {Object.entries(counts).map(([year, count], index) => (
                            <div key={year} className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full" style={{ 
                                    backgroundColor: chartData.datasets?.[0].backgroundColor[index] 
                                }}></div>
                                <span className="text-sm text-gray-600">{year}: {count}</span>
                            </div>
                        ))}
                    </div>
                </div>
    
                {/* Pie Chart */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <h3 className="text-xl font-semibold text-gray-800 mb-6">Course Categories</h3>
                    <div className="h-80">
                        {pieChartData.labels?.length > 0 ? (
                            <Pie
                                data={pieChartData}
                                options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    plugins: {
                                        legend: { position: 'right' }
                                    }
                                }}
                            />
                        ) : (
                            <div className="flex items-center justify-center h-full">
                                <p className="text-gray-500">Loading data...</p>
                            </div>
                        )}
                    </div>
                    <div className="mt-6 flex flex-wrap gap-4 justify-center">
                        {labelCounts.map((item, index) => (
                            <div key={index} className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full" style={{ 
                                    backgroundColor: pieChartData.datasets?.[0].backgroundColor[index] 
                                }}></div>
                                <span className="text-sm text-gray-600">{item.name}: {item.count}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    </div>
    
    );
};

export default AdminDashboard;