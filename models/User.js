module.exports = {
  findByEmail: async (email) => null,
  createUser: async (username, email, password, is_admin) => ({
    id: 1,
    username,
    email,
    is_admin
  })
};
