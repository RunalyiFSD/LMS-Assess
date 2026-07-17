-- Migration: 003_assessments_schema.sql
-- Description: Create tables for assessment module

-- ENUMS
CREATE TYPE assessment_status AS ENUM ('draft', 'published', 'archived');
CREATE TYPE assessment_type AS ENUM ('quiz', 'exam', 'assignment');
CREATE TYPE question_type AS ENUM ('mcq', 'theory', 'coding');
CREATE TYPE submission_status AS ENUM ('in_progress', 'submitted', 'evaluated');

-- 1. Assessments Table
CREATE TABLE IF NOT EXISTS public.assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    teacher_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    type assessment_type DEFAULT 'quiz'::assessment_type NOT NULL,
    duration INTEGER DEFAULT 60, -- minutes
    status assessment_status DEFAULT 'draft'::assessment_status NOT NULL,
    max_score INTEGER DEFAULT 100,
    instructions TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TRIGGER set_assessments_updated_at
BEFORE UPDATE ON public.assessments
FOR EACH ROW
EXECUTE FUNCTION handle_updated_at();

-- 2. Questions Table
CREATE TABLE IF NOT EXISTS public.questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_id UUID NOT NULL REFERENCES public.assessments(id) ON DELETE CASCADE,
    type question_type NOT NULL,
    content TEXT NOT NULL,
    marks INTEGER DEFAULT 1 NOT NULL,
    "order" INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Question Options (For MCQs)
CREATE TABLE IF NOT EXISTS public.question_options (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    is_correct BOOLEAN DEFAULT false NOT NULL
);

-- 4. Assessment Submissions (Student attempts)
CREATE TABLE IF NOT EXISTS public.assessment_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_id UUID NOT NULL REFERENCES public.assessments(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    status submission_status DEFAULT 'in_progress'::submission_status NOT NULL,
    score INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL, -- Started at
    submitted_at TIMESTAMP WITH TIME ZONE,
    evaluated_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(assessment_id, student_id) -- One active submission per assessment (or final depending on retake policy)
);

-- 5. Submission Answers (Individual answers)
CREATE TABLE IF NOT EXISTS public.submission_answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    submission_id UUID NOT NULL REFERENCES public.assessment_submissions(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
    answer_text TEXT, -- For theory
    code_answer TEXT, -- For coding
    selected_option_id UUID REFERENCES public.question_options(id) ON DELETE SET NULL, -- For MCQ
    marks_awarded INTEGER DEFAULT 0,
    feedback TEXT,
    UNIQUE(submission_id, question_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_assessments_course_id ON public.assessments(course_id);
CREATE INDEX IF NOT EXISTS idx_assessments_teacher_id ON public.assessments(teacher_id);
CREATE INDEX IF NOT EXISTS idx_questions_assessment_id ON public.questions(assessment_id);
CREATE INDEX IF NOT EXISTS idx_options_question_id ON public.question_options(question_id);
CREATE INDEX IF NOT EXISTS idx_submissions_assessment_id ON public.assessment_submissions(assessment_id);
CREATE INDEX IF NOT EXISTS idx_submissions_student_id ON public.assessment_submissions(student_id);
CREATE INDEX IF NOT EXISTS idx_answers_submission_id ON public.submission_answers(submission_id);
