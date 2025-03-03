import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FcQuestions} from "react-icons/fc";
import { SiQuizlet } from "react-icons/si";
import { 
  ChevronDown, 
  Lock,
  Menu,
  X,
  Gauge,
  GraduationCap
} from "lucide-react";
import axiosInstance from "../../axiosInstance";

const StudentQuizSideBar = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [expandedTopic, setExpandedTopic] = useState("");
  const [quizzes, setQuizzes] = useState({});
  const [unlockedTopics, setUnlockedTopics] = useState([]);
  const [course, setCourse] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  const urlParts = location.pathname.split('/');
  const quizIndex = urlParts.indexOf('quiz');
  const activeTopicId = quizIndex !== -1 ? urlParts[quizIndex + 1] : null;
  const activeQuizId = quizIndex !== -1 ? urlParts[quizIndex + 2] : null;

  const getCourse = JSON.parse(sessionStorage.getItem("userData"));
  const courseName = getCourse ? getCourse[0].course_id : "";
  const getStuid = getCourse ? getCourse[0].stu_id : "";

  const fetchCourse = useCallback(async (courseName) => {
    try {
      const res = await axiosInstance.get(`/courses/viewCourses/${courseName}`);
      setCourse(res.data[0].course_name);
    } catch (err) {
      console.error("Error fetching course name:", err);
    }
  }, []);

  const fetchTopics = useCallback(async () => {
    try {
      const response = await axiosInstance.get(`/Topics/Modulefetch/${courseName}`);
      setTopics(response.data);
    } catch (error) {
      console.error("Error fetching topics:", error);
    }
  }, [courseName]);

  const fetchQuizzes = useCallback(async (topicId) => {
    try {
      const response = await axiosInstance.get(`/quiz/TopicQuiz/${topicId}`);
      setQuizzes((prev) => ({ ...prev, [topicId]: response.data }));
    } catch (error) {
      console.error("Error fetching quizzes:", error);
    }
  }, []);

  const getunlockedTopics = async (topicDetails) => {
    try {
      const res = await axiosInstance.post("/tracking/trackingTopic", topicDetails);
      setUnlockedTopics(res.data);
    } catch (err) {
      console.error("Error fetching unlocked topics:", err);
    }
  };

  useEffect(() => {
    fetchTopics();
    fetchCourse(courseName);
    if (courseName && getStuid) {
      getunlockedTopics({
        course_id: courseName,
        stu_id: getStuid,
      });
    }
  }, [fetchTopics, fetchCourse, courseName, getStuid]);

  useEffect(() => {
    if (expandedTopic) {
      fetchQuizzes(expandedTopic);
    }
  }, [expandedTopic, fetchQuizzes]);

  useEffect(() => {
    if (activeTopicId) {
      setExpandedTopic(activeTopicId);
    }
  }, [activeTopicId]);

  const isTopicUnlocked = (topicId) => {
    const topic = unlockedTopics.find((t) => t.Course_Topic_id === topicId);
    return topic && topic.is_complete === 1;
  };

  const calculateProgress = () => {
    if (!unlockedTopics.length || !topics.length) return 0;
    const completedTopics = unlockedTopics.filter(t => t.is_complete === 1).length;
    return Math.round((completedTopics / topics.length) * 100);
  };

  const handleTopicClick = (topicId) => {
    if (isTopicUnlocked(topicId)) {
      setExpandedTopic((prev) => (prev === topicId ? '' : topicId));
      navigate(`/${course}-programming/quiz/${topicId}`);
    }
  };

  const handleQuizClick = (topicId, quizId) => {
    navigate(`/${course}-programming/quiz/${topicId}/${quizId}`);
  };

  return (
    <>
      <div 
        className={`fixed inset-0 md:hidden transition-all duration-300 
          ${isOpen ? '' : 'pointer-events-none'}`}
        onClick={() => setIsOpen(false)}
      />
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`sm:block md:hidden fixed top-32 left-2 z-50 p-2 rounded text-white bg-gray-950 
           transition-all duration-300 hover:scale-105 active:scale-95
          ${isOpen ? "translate-x-52 left-20 -ml-5" : "translate-x-0"}`}
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>
      <aside
        className={`fixed left-0 h-screen bg-gradient-to-b from-white to-gray-50 transition-all duration-300
          ease-in-out overflow-hidden border-r border-t border-gray-100
          ${isOpen ? 'w-72' : 'w-0'} 
          md:w-72 md:translate-x-0 md:block
          lg:w-72 lg:translate-x-0`}
      >
        <div className="flex flex-col h-full">
          <div className="px-6 py-6 bg-white border-b">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-800 capitalize">{course}</h2>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Gauge className="w-5 h-5 text-indigo-600" />
                  <span className="text-sm text-gray-600 font-medium">Course Progress</span>
                </div>
                <span className="text-sm font-semibold text-indigo-600">{calculateProgress()}%</span>
              </div>
              <div className="w-full h-2.5 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-600 to-violet-600 rounded-full 
                    transition-all duration-1000 ease-out"
                  style={{ width: `${calculateProgress()}%` }}
                />
              </div>
            </div>
          </div>
          
          <nav className="flex-1 px-2 py-6 overflow-y-auto custom-scrollbar pb-28">
            <div className="">
              {topics.map((topic) => (
                <div key={topic.Course_Topic_id} className="rounded">
                  <button
                    onClick={() => handleTopicClick(topic.Course_Topic_id)}
                    disabled={!isTopicUnlocked(topic.Course_Topic_id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 
                      ${isTopicUnlocked(topic.Course_Topic_id) 
                        ? 'hover:bg-indigo-50 cursor-pointer' 
                        : 'opacity-60 cursor-not-allowed'}
                      ${expandedTopic === topic.Course_Topic_id 
                        ? 'bg-indigo-50 text-indigo-600' 
                        : 'hover:shadow-sm'}
                      ${activeTopicId === topic.Course_Topic_id 
                        ? 'bg-indigo-50' 
                        : 'text-indigo-600'}
                      group`}
                  >
                    {isTopicUnlocked(topic.Course_Topic_id) ? (
                      <SiQuizlet className={`w-5 h-5 transition-transform duration-200 
                        group-hover:scale-110
                        ${activeTopicId === topic.Course_Topic_id 
                          ? 'text-indigo-600' 
                          : 'text-lime-600'}`} />
                    ) : (
                      <Lock className="w-5 h-5 text-gray-600" />
                    )}
                    <span className={`text-sm font-medium text-left flex-1 text-gray-600
                      group-hover:text-indigo-600
                      ${expandedTopic === topic.Course_Topic_id 
                        ? 'text-indigo-600 line-clamp-1' 
                        : 'text-gray-600 line-clamp-1'}`}>
                      {topic.Topic_Name}
                    </span>
                    <ChevronDown 
                      className={`w-5 h-5 transition-transform duration-300 
                        ${expandedTopic === topic.Course_Topic_id ? 'rotate-180 text-indigo-600' : 'text-gray-400'}`}
                    />
                  </button>

                  <div
                    className={`overflow-hidden transition-all duration-300 ease-in-out
                      ${expandedTopic === topic.Course_Topic_id ? 'max-h-96 mt-2' : 'max-h-0'}`}
                  >
                    {quizzes[topic.Course_Topic_id]?.map((quiz) => (
                      <button
                        key={quiz.quiz_id}
                        onClick={() => handleQuizClick(topic.Course_Topic_id, quiz.quiz_id)}
                        className={`w-full px-16 py-2.5 pl-12 flex items-center gap-2.5 
                          rounded-lg hover:bg-indigo-50/50 transition-all duration-200
                          hover:translate-x-1 group
                          ${activeQuizId === quiz.quiz_id.toString() 
                            ? 'bg-indigo-50 text-indigo-600' 
                            : 'text-gray-600'}`}
                      >
                        <FcQuestions className={`w-4 h-4 transition-colors duration-200
                          ${activeQuizId === quiz.quiz_id.toString() 
                            ? 'text-indigo-600' 
                            : 'text-gray-400 group-hover:text-indigo-600'}`} />
                        <span className={`text-sm text-left transition-colors
                          ${activeQuizId === quiz.quiz_id.toString() 
                            ? 'text-gray-600 font-medium' 
                            : 'group-hover:text-indigo-600'}`}>
                          {quiz.Quiz_name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </nav>
        </div>
      </aside>
    </>
  );
};

export default StudentQuizSideBar;