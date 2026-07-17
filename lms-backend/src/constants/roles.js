/**
 * Canonical role names for LMS-Assess.
 *
 * These are the only valid role strings in the system.
 * All authorization checks, database queries, and UI role conditionals
 * must use these constants — never hardcode a role string directly.
 */
const ROLES = Object.freeze({
  STUDENT: 'student',
  TEACHER: 'teacher',
  ADMIN: 'admin',
});

module.exports = ROLES;
