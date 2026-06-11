import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import User from './models/User.js';
import connectDB from './config/db.js';

const createAdmin = async () => {
  try {
    await connectDB();

    const adminEmail = 'admin@basebyte.com';
    const adminPassword = 'adminpassword123';

    // Check if admin already exists
    let admin = await User.findOne({ email: adminEmail });
    if (admin) {
      console.log('Admin user already exists!');
      console.log(`Email: ${adminEmail}`);
      console.log('Role: admin');
      process.exit(0);
    }

    // Create new admin
    admin = await User.create({
      name: 'Super Admin',
      email: adminEmail,
      password: adminPassword,
      role: 'admin'
    });

    console.log('Admin user created successfully!');
    console.log(`Email: ${adminEmail}`);
    console.log(`Password: ${adminPassword}`);
    console.log('Role: admin');
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin:', error);
    process.exit(1);
  }
};

createAdmin();

