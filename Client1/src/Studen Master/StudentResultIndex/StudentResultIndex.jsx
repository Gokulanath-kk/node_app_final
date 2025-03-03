import React from 'react'
import StudentResult from './StudentResult'
import HeroStrip from '../StudenLanding/HeroStrip'
import StudentFooter from '../StudenLanding/StudentFooter'
import FeedBackForm from './FeedBackForm'
import StudentGetScoreIndex from './StudentGetScoreIndex'

const StudentResultIndex = () => {
  return (
    <div>
      <StudentResult/>
      <HeroStrip/>
      <StudentGetScoreIndex/>
      <FeedBackForm/>
      <StudentFooter/>
    </div>
  )
}

export default StudentResultIndex
