-- Policies: 003_assessments_rls.sql
-- Description: Row Level Security policies for assessment module

-- Enable RLS
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submission_answers ENABLE ROW LEVEL SECURITY;

-- ASSESSMENTS POLICIES
-- Students can view published assessments if enrolled in the course
CREATE POLICY "Students view published assessments for enrolled courses"
    ON public.assessments FOR SELECT
    USING (
        status = 'published' AND
        EXISTS (
            SELECT 1 FROM public.course_enrollments 
            WHERE course_id = public.assessments.course_id 
            AND student_id = auth.uid() 
            AND status = 'active'
        )
    );

-- Teachers can view their own assessments; Admins can view all
CREATE POLICY "Teachers view own assessments; Admins view all"
    ON public.assessments FOR SELECT
    USING (
        teacher_id = auth.uid() OR 
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
    );

-- Teachers can insert assessments
CREATE POLICY "Teachers can insert assessments"
    ON public.assessments FOR INSERT
    WITH CHECK (teacher_id = auth.uid() AND EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'teacher'));

-- Teachers can update their own assessments
CREATE POLICY "Teachers can update own assessments"
    ON public.assessments FOR UPDATE
    USING (teacher_id = auth.uid());

-- Teachers can delete their own assessments
CREATE POLICY "Teachers can delete own assessments"
    ON public.assessments FOR DELETE
    USING (teacher_id = auth.uid());


-- QUESTIONS POLICIES
-- Students can view questions if they have an active submission or the assessment is published and they are enrolled
-- Note: A stricter implementation would only expose questions when a submission is started. We will enforce that via API, but at DB level we allow read.
CREATE POLICY "Students view questions of published assessments"
    ON public.questions FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.assessments 
            WHERE id = assessment_id AND status = 'published'
        )
    );

-- Teachers view all questions for their assessments
CREATE POLICY "Teachers view questions for own assessments"
    ON public.questions FOR SELECT
    USING (
        EXISTS (SELECT 1 FROM public.assessments WHERE id = assessment_id AND teacher_id = auth.uid()) OR
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
    );

CREATE POLICY "Teachers can insert questions"
    ON public.questions FOR INSERT
    WITH CHECK (EXISTS (SELECT 1 FROM public.assessments WHERE id = assessment_id AND teacher_id = auth.uid()));

CREATE POLICY "Teachers can update questions"
    ON public.questions FOR UPDATE
    USING (EXISTS (SELECT 1 FROM public.assessments WHERE id = assessment_id AND teacher_id = auth.uid()));

CREATE POLICY "Teachers can delete questions"
    ON public.questions FOR DELETE
    USING (EXISTS (SELECT 1 FROM public.assessments WHERE id = assessment_id AND teacher_id = auth.uid()));


-- QUESTION OPTIONS POLICIES
-- Same read policies as questions
CREATE POLICY "Students view options of published assessments"
    ON public.question_options FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.questions q
            JOIN public.assessments a ON q.assessment_id = a.id
            WHERE q.id = question_id AND a.status = 'published'
        )
    );

-- Note: We might want to hide 'is_correct' from students in a real-world scenario by using a secure view, 
-- but we will scrub this at the API layer for now, allowing SELECT on the table.

CREATE POLICY "Teachers manage question options"
    ON public.question_options FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.questions q
            JOIN public.assessments a ON q.assessment_id = a.id
            WHERE q.id = question_id AND a.teacher_id = auth.uid()
        )
    );


-- SUBMISSIONS POLICIES
-- Students can view and update their own submissions
CREATE POLICY "Students manage their own submissions"
    ON public.assessment_submissions FOR SELECT
    USING (student_id = auth.uid());

CREATE POLICY "Students insert their own submissions"
    ON public.assessment_submissions FOR INSERT
    WITH CHECK (student_id = auth.uid());

CREATE POLICY "Students update their own submissions"
    ON public.assessment_submissions FOR UPDATE
    USING (student_id = auth.uid());

-- Teachers view and update submissions for their assessments (e.g. grading)
CREATE POLICY "Teachers view and evaluate submissions"
    ON public.assessment_submissions FOR SELECT
    USING (
        EXISTS (SELECT 1 FROM public.assessments WHERE id = assessment_id AND teacher_id = auth.uid()) OR
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
    );

CREATE POLICY "Teachers update submissions for their assessments"
    ON public.assessment_submissions FOR UPDATE
    USING (EXISTS (SELECT 1 FROM public.assessments WHERE id = assessment_id AND teacher_id = auth.uid()));


-- SUBMISSION ANSWERS POLICIES
-- Students manage their own answers
CREATE POLICY "Students view their own answers"
    ON public.submission_answers FOR SELECT
    USING (
        EXISTS (SELECT 1 FROM public.assessment_submissions WHERE id = submission_id AND student_id = auth.uid())
    );

CREATE POLICY "Students insert their own answers"
    ON public.submission_answers FOR INSERT
    WITH CHECK (
        EXISTS (SELECT 1 FROM public.assessment_submissions WHERE id = submission_id AND student_id = auth.uid())
    );

CREATE POLICY "Students update their own answers"
    ON public.submission_answers FOR UPDATE
    USING (
        EXISTS (SELECT 1 FROM public.assessment_submissions WHERE id = submission_id AND student_id = auth.uid())
    );

-- Teachers view and update answers for their assessments (for grading)
CREATE POLICY "Teachers view answers"
    ON public.submission_answers FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.assessment_submissions s
            JOIN public.assessments a ON s.assessment_id = a.id
            WHERE s.id = submission_id AND a.teacher_id = auth.uid()
        ) OR EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
    );

CREATE POLICY "Teachers update answers (grading)"
    ON public.submission_answers FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.assessment_submissions s
            JOIN public.assessments a ON s.assessment_id = a.id
            WHERE s.id = submission_id AND a.teacher_id = auth.uid()
        )
    );
