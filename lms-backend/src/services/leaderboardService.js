const Leaderboard = require('../legacy/models/Leaderboard');
const Attempt = require('../legacy/models/Attempt');

/**
 * Calculates and updates rankings for a specific assessment.
 * @param {string} assessmentId - The ID of the assessment
 * @returns {Promise<Object>} The updated Leaderboard document
 */
exports.recalculateLeaderboard = async (assessmentId) => {
  try {
    // 1. Fetch all attempts that are submitted or graded for this assessment
    const attempts = await Attempt.find({
      assessment: assessmentId,
      status: { $in: ['submitted', 'graded'] },
    })
      .populate('student', 'name email profilePicture')
      .exec();

    if (attempts.length === 0) {
      // Create empty leaderboard if no submissions exist yet
      return await Leaderboard.findOneAndUpdate(
        { assessment: assessmentId },
        { rankings: [], updatedAt: new Date() },
        { upsert: true, new: true }
      );
    }

    // 2. Sort attempts with tie-breakers:
    //    a) Total marks obtained (descending)
    //    b) Time taken to complete the assessment (ascending)
    //    c) Submission date/time (ascending)
    attempts.sort((a, b) => {
      // Primary: Score (Descending)
      if (b.totalMarksObtained !== a.totalMarksObtained) {
        return b.totalMarksObtained - a.totalMarksObtained;
      }
      
      // Secondary: Time Taken (Ascending)
      if (a.timeTakenSeconds !== b.timeTakenSeconds) {
        return a.timeTakenSeconds - b.timeTakenSeconds;
      }
      
      // Tertiary: Submission Time (Ascending)
      const aTime = a.submittedAt ? new Date(a.submittedAt).getTime() : new Date(a.updatedAt).getTime();
      const bTime = b.submittedAt ? new Date(b.submittedAt).getTime() : new Date(b.updatedAt).getTime();
      return aTime - bTime;
    });

    // 3. Create structured ranking list (assigning rank numbers, including handle for equal ranks if desired, but here we do incremental rank)
    const rankings = attempts.map((attempt, index) => {
      const subTime = attempt.submittedAt || attempt.updatedAt;
      return {
        student: attempt.student._id,
        score: attempt.totalMarksObtained,
        timeTakenSeconds: attempt.timeTakenSeconds || 0,
        submittedAt: subTime,
        rank: index + 1,
      };
    });

    // 4. Update the Leaderboard collection cache
    const leaderboard = await Leaderboard.findOneAndUpdate(
      { assessment: assessmentId },
      {
        rankings,
        updatedAt: new Date(),
      },
      { upsert: true, new: true }
    ).populate('rankings.student', 'name email profilePicture college department batch');

    return leaderboard;
  } catch (error) {
    console.error(`Error recalculating leaderboard for assessment ${assessmentId}:`, error);
    throw error;
  }
};
