import db from '../db/knex';

// TypeScript interfaces
export interface User {
  id: number;
  username: string;
  email: string;
  password_hash: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreateUserData {
  username: string;
  email: string;
  password: string;
}

export interface UpdateUserData {
  username?: string;
  email?: string;
  password?: string;
}

// User model class
export class UserModel {
  private tableName = 'users';

  // Get all users
  async findAll(): Promise<User[]> {
    return db(this.tableName).select('*');
  }

  // Get user by ID
  async findById(id: number): Promise<User | null> {
    const users = await db(this.tableName).where({ id }).select('*');
    return users[0] || null;
  }

  // Get user by email
  async findByEmail(email: string): Promise<User | null> {
    const users = await db(this.tableName).where({ email }).select('*');
    return users[0] || null;
  }

  // Get user by username
  async findByUsername(username: string): Promise<User | null> {
    const users = await db(this.tableName).where({ username }).select('*');
    return users[0] || null;
  }

  // Create new user
  async create(userData: CreateUserData): Promise<User> {
    const [user] = await db(this.tableName)
      .insert({
        ...userData,
        created_at: new Date(),
        updated_at: new Date()
      })
      .returning('*');
    return user;
  }

  // Update user
  async update(id: number, userData: UpdateUserData): Promise<User | null> {
    const [user] = await db(this.tableName)
      .where({ id })
      .update({
        ...userData,
        updated_at: new Date()
      })
      .returning('*');
    return user || null;
  }

  // Delete user
  async delete(id: number): Promise<boolean> {
    const deletedRows = await db(this.tableName).where({ id }).del();
    return deletedRows > 0;
  }
}

export default new UserModel(); 