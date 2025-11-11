'use server';

import { connectDB } from '@/lib/mongodb';
import { User, IUserInput } from '@/models/User';

export async function createUser(formData: FormData) {
  await connectDB();
  
  const userData: IUserInput = {
    name: formData.get('name') as string,
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  };
  
  const user = new User(userData);
  await user.save();
}