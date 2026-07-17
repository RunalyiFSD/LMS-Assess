const userRepository = require('../repositories/userRepository');
const AppError = require('../utils/AppError');

class UserService {
  async getAllUsers(role) {
    const users = await userRepository.findAll();
    if (role) {
      return users.filter(u => u.role === role);
    }
    return users;
  }

  async updateUserProfile(id, updateData) {
    return userRepository.update(id, updateData);
  }

  async deleteUser(id) {
    return userRepository.delete(id);
  }
  
  // Note: Analytics and detailed profile endpoints will be refactored 
  // in their respective sprints using proper repositories.
  // We keep the legacy logic mostly in the controller for now if they depend on Result/Attempt.
}

module.exports = new UserService();
