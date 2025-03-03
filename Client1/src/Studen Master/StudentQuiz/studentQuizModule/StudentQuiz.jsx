import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axiosInstance from '../../axiosInstance';

const StudentQuiz = () => {
  const [topic, setTopic] = useState(null);
  const [showGuidelines, setShowGuidelines] = useState(false);
  const [showRetakeGuidelines, setShowRetakeGuidelines] = useState(false);
  const [displayTopics, setDisplayTopics] = useState([]);
  const [course, setCourse] = useState('');
  const [unlockedTopics, setUnlockedTopics] = useState([]);
  const [completedQuizTopics, setCompletedQuizTopics] = useState([]);
  const [error, setError] = useState('');
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [showNoQuizSnackbar, setShowNoQuizSnackbar] = useState(false);
  const { topicId } = useParams();
  const navigate = useNavigate();

  const getUserData = () => {
    try {
      const userData = JSON.parse(sessionStorage.getItem("userData"));
      return {
        courseId: userData?.[0]?.course_id || '',
        studentId: userData?.[0]?.stu_id || ''
      };
    } catch (error) {
      setError('Unable to retrieve user data. Please try logging in again.');
      return { courseId: '', studentId: '' };
    }
  };

  const { courseId, studentId } = getUserData();

  const fetchCourse = useCallback(async () => {
    if (!courseId) return;

    try {
      const res = await axiosInstance.get(`/courses/viewCourses/${courseId}`);
      setCourse(res.data[0]?.course_name || '');
    } catch (err) {
      setError('Failed to load course details. Please refresh the page.');
    }
  }, [courseId]);

  const fetchCompletedQuizTopics = useCallback(async () => {
    try {
      const response = await axiosInstance.post("/quiz/checkquiz", { stu_id: studentId, course_id: courseId });

      setCompletedQuizTopics(response.data.map(item => item.Course_Topic_id));
    } catch (err) {
      console.error("Error fetching completed quiz topics:", err);
    }
  }, [studentId, courseId]);

  const fetchTopicWithQuizzes = useCallback(async () => {
    try {
      const response = await axiosInstance.get('/quiz/topicwithquizes');

      const topics = response.data.topics || [];

      if (topicId) {
        const selectedTopicIndex = topics.findIndex(t => t.Course_Topic_id === parseInt(topicId));
        if (selectedTopicIndex !== -1) {
          const currentTopic = topics[selectedTopicIndex];
          setTopic(currentTopic);
          const nextTopics = topics.slice(selectedTopicIndex, selectedTopicIndex + 4);
          setDisplayTopics(nextTopics);
        } else {
          setDisplayTopics(topics.slice(0, 4));
        }
      } else {
        setDisplayTopics(topics.slice(0, 4));
      }
    } catch (error) {
      setError('Failed to load quiz topics. Please refresh the page.');
    }
  }, [topicId]);

  const getUnlockedTopics = async (topicDetails) => {
    try {
      const res = await axiosInstance.post("/tracking/trackingTopic", topicDetails);
      const unlockedTopicsList = res.data.filter(topic => topic.is_complete === 1);
      setUnlockedTopics(unlockedTopicsList);
    } catch (err) {
      console.error("Error fetching unlocked topics:", err);
    }
  };

  useEffect(() => {
    fetchCourse();

    if (courseId && studentId) {
      getUnlockedTopics({
        course_id: courseId,
        stu_id: studentId,
      });
      fetchCompletedQuizTopics();
      if (topicId) {
        // Add any specific handling for a selected topic if needed
      }
    }
    fetchTopicWithQuizzes();
  }, [fetchCourse, fetchTopicWithQuizzes, fetchCompletedQuizTopics, courseId, studentId, topicId]);

  const isTopicUnlocked = (topicId) => {
    return unlockedTopics.some(t => t.Course_Topic_id === topicId);
  };

  const handleTopicClick = (topic) => {
    if (!isTopicUnlocked(topic.Course_Topic_id)) {
      setError('Complete previous topics to unlock this one!');
      return;
    }
    if (topic?.quizes?.[0]?.Quiz_id) {
      navigate(`/${course}-programming/quiz/${topic.Course_Topic_id}/${topic.quizes[0].Quiz_id}`);
    } else {
      setShowNoQuizSnackbar(true);
      setTimeout(() => setShowNoQuizSnackbar(false), 3000);
    }
  };

  const handleTakeQuiz = (topic) => {
    if (!isTopicUnlocked(topic.Course_Topic_id)) {
      setError('Complete previous topics to unlock this one!');
      return;
    }
    setSelectedTopic(topic);
    setShowGuidelines(true);
  };

  const handleRetakeQuiz = (topic) => {
    if (!isTopicUnlocked(topic.Course_Topic_id)) {
      setError('Complete previous topics to unlock this one!');
      return;
    }
    setSelectedTopic(topic);
    setShowRetakeGuidelines(true);
  };

  const handleQuizAction = (topic) => {
    const isUnlocked = isTopicUnlocked(topic.Course_Topic_id);
    const isQuizCompleted = completedQuizTopics.includes(topic.Course_Topic_id);

    if (!isUnlocked) return;

    if (!topic?.quizes?.[0]?.Quiz_id) {
      setShowNoQuizSnackbar(true);
      setTimeout(() => setShowNoQuizSnackbar(false), 3000); // Hide after 3 seconds
      return;
    }

    if (isQuizCompleted) {
      handleRetakeQuiz(topic);
    } else {
      handleTakeQuiz(topic);
    }
  };

  const handleStartQuiz = () => {
    if (selectedTopic?.quizes?.[0]?.Quiz_id) {
      navigate(`/${course}-programming/quiz/${selectedTopic.Course_Topic_id}/${selectedTopic.quizes[0].Quiz_id}`);
    }
    setShowGuidelines(false);
  };

  const handleStartRetakeQuiz = async () => {
    try {
      const deleteResponse = await axiosInstance.post("/quiz/deletePreQuizAns", {
        stu_id: studentId,
        Course_Topic_id: selectedTopic.Course_Topic_id
      });

      if (selectedTopic?.quizes?.[0]?.Quiz_id) {
        navigate(`/${course}-programming/quiz/${selectedTopic.Course_Topic_id}/${selectedTopic.quizes[0].Quiz_id}`);
      }

      setShowRetakeGuidelines(false);
    } catch (error) {
      console.error("Error deleting previous quiz answers:", error);
      setError("Failed to reset quiz. Please try again.");
    }
  };

  const isLastUnlockedTopic = (topicId) => {
    if (unlockedTopics.length === 0) return false;
    return unlockedTopics[unlockedTopics.length - 1].Course_Topic_id === topicId;
  };

  const getTopicColor = (topicId) => {
    if (isLastUnlockedTopic(topicId)) {
      return 'border-green-200 hover:border-green-300 bg-green-50';
    }
    return 'border-blue-200 hover:border-blue-300 bg-blue-50';
  };

  const getQuizButtonText = (topic) => {
    const isUnlocked = isTopicUnlocked(topic.Course_Topic_id);
    const isQuizCompleted = completedQuizTopics.includes(topic.Course_Topic_id);

    if (!isUnlocked) return 'Locked';
    if (isQuizCompleted) return 'Retake Quiz';
    return 'Take Quiz';
  };

  const getQuizButtonClasses = (topic) => {
    const isUnlocked = isTopicUnlocked(topic.Course_Topic_id);
    const isQuizCompleted = completedQuizTopics.includes(topic.Course_Topic_id);

    if (!isUnlocked) return 'bg-gray-400 text-white cursor-not-allowed';
    if (isQuizCompleted) return 'bg-blue text-white hover:bg-liteblue';
    return 'bg-green-600 text-white hover:bg-green-700';
  };

  if (!topic && topicId) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="h-32 w-32 animate-spin rounded-full border-t-4 border-blue-600" />
          <p className="text-slate-500">Loading quiz details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {showNoQuizSnackbar && (
          <div className="fixed top-32 right-1 transform  z-50">
            <div className="bg-slate-900 text-white px-6 py-2 rounded-lg shadow-lg">
              This topic currently has no quiz available.
            </div>
          </div>
        )}

        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-slate-800 mb-4">
            Welcome to the
            <span className="block text-6xl md:text-6xl mt-2 text-slate-700 capitalize bg-clip-text">
              {course || 'Frontend'} Quiz
            </span>
          </h1>
          <p className="text-xl text-slate-600 mt-6">
            Master your skills one topic at a time
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
          {displayTopics.map((topic) => {
            const isUnlocked = isTopicUnlocked(topic.Course_Topic_id);
            const topicColor = getTopicColor(topic.Course_Topic_id);

            return (
              <div
                key={topic.Course_Topic_id}
                className={`group p-6 rounded-xl border-2 ${topicColor} 
                  transition-all duration-300 hover:scale-[1.02] hover:shadow-lg
                  ${!isUnlocked && 'cursor-not-allowed'}`}
                onClick={() => isUnlocked && handleTopicClick(topic)}
              >
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    {isUnlocked ? (
                      <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                      </svg>
                    ) : (
                      <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    )}
                  </div>
                  <div className="text-left flex-grow">
                    <h3 className="text-xl font-semibold text-slate-800">
                      {topic.Topic_Name || 'Untitled Topic'}
                    </h3>
                    <p className="text-slate-600 mt-1 line-clamp-2">
                      {topic.Topic_Content || 'No description available'}
                    </p>
                  </div>
                  {isUnlocked && (
                    <svg className="w-6 h-6 text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  )}
                </div>
                <div className="mt-4">
                  <button
                    className={`px-4 py-2 rounded transition-colors ${getQuizButtonClasses(topic)}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleQuizAction(topic);
                    }}
                    disabled={!isTopicUnlocked(topic.Course_Topic_id)}
                  >
                    {getQuizButtonText(topic)}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
        {showGuidelines && selectedTopic && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="bg-white p-4 sm:p-6 rounded-lg max-w-sm w-full mx-auto">
              <h2 className="text-lg sm:text-xl font-semibold text-slate-800 mb-3 sm:mb-4">
                Quiz Guidelines for {selectedTopic.Topic_Name}
              </h2>
              <p className="text-sm sm:text-base text-slate-600 mb-3 sm:mb-4">
                Please read the following guidelines before starting the quiz:
              </p>
              <ul className="list-disc ml-4 sm:ml-6 mt-2 text-sm sm:text-base text-slate-600 space-y-1">
                <li>Read each question carefully.</li>
                <li>You have one attempt to complete this quiz.</li>
                <li>Manage your time wisely.</li>
                <li>Make sure you're in a quiet environment.</li>
              </ul>
              <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-4">
                <button
                  className="bg-slate-200 text-slate-700 px-4 py-2 rounded text-sm sm:text-base w-full sm:w-auto"
                  onClick={() => setShowGuidelines(false)}
                >
                  Cancel
                </button>
                <button
                  className="bg-green-600 text-white px-4 py-2 rounded text-sm sm:text-base w-full sm:w-auto"
                  onClick={handleStartQuiz}
                >
                  Start Quiz
                </button>
              </div>
            </div>
          </div>
        )}


        {showRetakeGuidelines && selectedTopic && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="bg-white p-4 sm:p-6 rounded-lg max-w-sm sm:max-w-md w-full mx-auto">
              <h2 className="text-lg sm:text-xl font-semibold text-slate-800 mb-3 sm:mb-4">
                Retake Quiz for {selectedTopic.Topic_Name}
              </h2>
              <p className="text-sm sm:text-base text-slate-600 mb-3 sm:mb-4">
                You are about to retake the quiz for this topic. Please note the following:
              </p>
              <ul className="list-disc ml-4 sm:ml-6 mt-2 text-sm sm:text-base text-slate-600 space-y-1">
                <li>Your previous quiz score will be replaced by the new attempt.</li>
                <li>Take time to review the learning materials before retaking.</li>
                <li>Try to improve your previous performance.</li>
                <li>This is an opportunity to strengthen your understanding.</li>
              </ul>
              <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-4">
                <button
                  className="bg-slate-200 text-slate-700 px-4 py-2 rounded text-sm sm:text-base w-full sm:w-auto"
                  onClick={() => setShowRetakeGuidelines(false)}
                >
                  Cancel
                </button>
                <button
                  className="bg-blue text-white px-4 py-2 rounded text-sm sm:text-base w-full sm:w-auto"
                  onClick={handleStartRetakeQuiz}
                >
                  Retake Quiz
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentQuiz;