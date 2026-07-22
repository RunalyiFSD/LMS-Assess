const supabase = require('../config/supabase');
const AppError = require('../utils/AppError');

class UserRepository {
  async findById(id) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw new AppError(`Error fetching user by id: ${error.message}`, 500);
    }
    return data;
  }

  async findByEmail(email) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw new AppError(`Error fetching user by email: ${error.message}`, 500);
    }
    return data;
  }

  // creation in public.users is handled by Supabase trigger, 
  // but we may need an explicit create or admin action to create auth user
  async createAuthUser(email, password, fullName, role = 'student') {
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
      },
    });

    if (error) {
      throw new AppError(`Failed to create user: ${error.message}`, 400);
    }

    // Role is assigned directly by the backend to bypass raw_user_meta_data manipulation
    // Since the trigger automatically creates a 'student' profile, we just need to update it
    // if the role is different.
    if (role !== 'student') {
      await this.update(data.user.id, { role });
    }

    return data.user;
  }

  async update(id, updateData) {
    const { data, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new AppError(`Error updating user: ${error.message}`, 500);
    }
    return data;
  }

  async delete(id) {
    // We soft-delete by setting is_active = false
    return this.update(id, { is_active: false });
  }

  async findAll() {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw new AppError(`Error fetching users: ${error.message}`, 500);
    }
    return data;
  }
}

module.exports = new UserRepository();
