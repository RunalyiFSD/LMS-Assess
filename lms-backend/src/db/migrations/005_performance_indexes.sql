-- 005_performance_indexes.sql

-- Attempts Table
CREATE INDEX IF NOT EXISTS idx_attempts_student_id ON attempts (student_id);
CREATE INDEX IF NOT EXISTS idx_attempts_assessment_id ON attempts (assessment_id);
CREATE INDEX IF NOT EXISTS idx_attempts_status ON attempts (status);

-- Assessments Table
CREATE INDEX IF NOT EXISTS idx_assessments_subject_id ON assessments (subject_id);
CREATE INDEX IF NOT EXISTS idx_assessments_is_active ON assessments (is_active);

-- Notifications Table
CREATE INDEX IF NOT EXISTS idx_notifications_user_id_is_read ON notifications (user_id, is_read);
