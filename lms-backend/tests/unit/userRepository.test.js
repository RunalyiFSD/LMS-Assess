const userRepository = require('../../src/repositories/userRepository');
const { supabase } = require('../../src/config/supabase');
const AppError = require('../../src/utils/AppError');

// Mock supabase client
jest.mock('../../src/config/supabase', () => ({
  supabase: {
    from: jest.fn(),
    auth: {
      admin: {
        createUser: jest.fn(),
      },
    },
  },
}));

describe('UserRepository', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('findById', () => {
    it('should return a user if found', async () => {
      const mockUser = { id: '123', email: 'test@example.com' };
      const singleMock = jest.fn().mockResolvedValue({ data: mockUser, error: null });
      const eqMock = jest.fn().mockReturnValue({ single: singleMock });
      const selectMock = jest.fn().mockReturnValue({ eq: eqMock });
      supabase.from.mockReturnValue({ select: selectMock });

      const user = await userRepository.findById('123');
      expect(user).toEqual(mockUser);
      expect(supabase.from).toHaveBeenCalledWith('users');
      expect(selectMock).toHaveBeenCalledWith('*');
      expect(eqMock).toHaveBeenCalledWith('id', '123');
    });

    it('should return null if user is not found (PGRST116)', async () => {
      const singleMock = jest.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116' } });
      const eqMock = jest.fn().mockReturnValue({ single: singleMock });
      const selectMock = jest.fn().mockReturnValue({ eq: eqMock });
      supabase.from.mockReturnValue({ select: selectMock });

      const user = await userRepository.findById('123');
      expect(user).toBeNull();
    });
  });

  describe('createAuthUser', () => {
    it('should create auth user and not update role if role is student', async () => {
      const mockAuthResponse = {
        data: { user: { id: 'auth123', email: 'student@example.com' } },
        error: null,
      };
      supabase.auth.admin.createUser.mockResolvedValue(mockAuthResponse);

      const user = await userRepository.createAuthUser('student@example.com', 'pass123', 'John Doe');
      
      expect(supabase.auth.admin.createUser).toHaveBeenCalledWith({
        email: 'student@example.com',
        password: 'pass123',
        email_confirm: true,
        user_metadata: { full_name: 'John Doe' },
      });
      // Should not call update since role is 'student' by default
      expect(supabase.from).not.toHaveBeenCalled();
      expect(user.id).toBe('auth123');
    });

    it('should create auth user and update role if role is not student', async () => {
      const mockAuthResponse = {
        data: { user: { id: 'auth123', email: 'teacher@example.com' } },
        error: null,
      };
      supabase.auth.admin.createUser.mockResolvedValue(mockAuthResponse);

      // Mock update
      const singleMock = jest.fn().mockResolvedValue({ data: { id: 'auth123', role: 'teacher' }, error: null });
      const selectMock = jest.fn().mockReturnValue({ single: singleMock });
      const eqMock = jest.fn().mockReturnValue({ select: selectMock });
      const updateMock = jest.fn().mockReturnValue({ eq: eqMock });
      supabase.from.mockReturnValue({ update: updateMock });

      const user = await userRepository.createAuthUser('teacher@example.com', 'pass123', 'Jane Doe', 'teacher');
      
      expect(supabase.from).toHaveBeenCalledWith('users');
      expect(updateMock).toHaveBeenCalledWith({ role: 'teacher' });
    });
  });
});
