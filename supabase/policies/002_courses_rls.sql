-- Policies: 002_courses_rls.sql
-- Description: Row Level Security policies for course management tables

-- Enable RLS
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_materials ENABLE ROW LEVEL SECURITY;

-- DEPARTMENTS POLICIES
-- Everyone can view departments
CREATE POLICY "Departments are viewable by everyone"
    ON public.departments FOR SELECT
    USING (true);

-- Only admins can modify departments
CREATE POLICY "Admins can insert departments"
    ON public.departments FOR INSERT
    WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins can update departments"
    ON public.departments FOR UPDATE
    USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins can delete departments"
    ON public.departments FOR DELETE
    USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));


-- COURSES POLICIES
-- Everyone can view published courses
CREATE POLICY "Published courses are viewable by everyone"
    ON public.courses FOR SELECT
    USING (status = 'published');

-- Teachers can view their own courses (even draft/archived)
CREATE POLICY "Teachers can view their own courses"
    ON public.courses FOR SELECT
    USING (auth.uid() = teacher_id);

-- Admins can view all courses
CREATE POLICY "Admins can view all courses"
    ON public.courses FOR SELECT
    USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));

-- Only teachers and admins can create courses
CREATE POLICY "Teachers and admins can insert courses"
    ON public.courses FOR INSERT
    WITH CHECK (
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('teacher', 'admin'))
    );

-- Teachers can update their own courses; Admins can update any
CREATE POLICY "Teachers can update their own courses; Admins update any"
    ON public.courses FOR UPDATE
    USING (
        auth.uid() = teacher_id OR 
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
    );

-- Teachers can soft-delete their own courses; Admins can soft-delete any
CREATE POLICY "Teachers can delete their own courses; Admins delete any"
    ON public.courses FOR DELETE
    USING (
        auth.uid() = teacher_id OR 
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
    );


-- ENROLLMENTS POLICIES
-- Users can view their own enrollments
CREATE POLICY "Users can view their own enrollments"
    ON public.course_enrollments FOR SELECT
    USING (auth.uid() = student_id);

-- Teachers can view enrollments for their courses
CREATE POLICY "Teachers can view enrollments for their courses"
    ON public.course_enrollments FOR SELECT
    USING (
        EXISTS (SELECT 1 FROM public.courses WHERE id = course_id AND teacher_id = auth.uid())
    );

-- Admins can view all enrollments
CREATE POLICY "Admins can view all enrollments"
    ON public.course_enrollments FOR SELECT
    USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));

-- Students can enroll themselves in published courses
CREATE POLICY "Students can enroll themselves"
    ON public.course_enrollments FOR INSERT
    WITH CHECK (
        auth.uid() = student_id AND
        EXISTS (SELECT 1 FROM public.courses WHERE id = course_id AND status = 'published')
    );

-- Students can update their own enrollments (e.g. drop); Teachers/Admins can update
CREATE POLICY "Students can update their own enrollments; Teachers/Admins any"
    ON public.course_enrollments FOR UPDATE
    USING (
        auth.uid() = student_id OR
        EXISTS (SELECT 1 FROM public.courses WHERE id = course_id AND teacher_id = auth.uid()) OR
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
    );


-- MATERIALS POLICIES
-- Students can view materials if they are enrolled in the course and the course is published
-- Teachers can view materials for their own courses
-- Admins can view all materials
CREATE POLICY "Students can view materials for enrolled published courses; Teachers view own; Admins view all"
    ON public.course_materials FOR SELECT
    USING (
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
        OR
        EXISTS (SELECT 1 FROM public.courses WHERE id = course_id AND teacher_id = auth.uid())
        OR
        (
            EXISTS (SELECT 1 FROM public.course_enrollments WHERE course_id = public.course_materials.course_id AND student_id = auth.uid() AND status = 'active')
            AND
            EXISTS (SELECT 1 FROM public.courses WHERE id = course_id AND status = 'published')
        )
    );

-- Teachers can insert materials for their own courses
CREATE POLICY "Teachers can insert materials for their own courses; Admins any"
    ON public.course_materials FOR INSERT
    WITH CHECK (
        EXISTS (SELECT 1 FROM public.courses WHERE id = course_id AND teacher_id = auth.uid())
        OR
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
    );

-- Teachers can update materials for their own courses
CREATE POLICY "Teachers can update materials for their own courses; Admins any"
    ON public.course_materials FOR UPDATE
    USING (
        EXISTS (SELECT 1 FROM public.courses WHERE id = course_id AND teacher_id = auth.uid())
        OR
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
    );

-- Teachers can delete materials for their own courses
CREATE POLICY "Teachers can delete materials for their own courses; Admins any"
    ON public.course_materials FOR DELETE
    USING (
        EXISTS (SELECT 1 FROM public.courses WHERE id = course_id AND teacher_id = auth.uid())
        OR
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
    );
