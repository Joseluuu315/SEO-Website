const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['trial', 'paid', 'admin'], default: 'trial' },
  temporaryUntil: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now },
});

const User = mongoose.model('User', UserSchema);

async function fixAdmin() {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/seoanalyzer');
    console.log('Conectado a MongoDB');
    
    // Check if admin user exists
    const adminUser = await User.findOne({ email: 'joselufupa2016@gmail.com' });
    
    if (adminUser) {
      console.log('Usuario encontrado:', adminUser);
      console.log('Rol actual:', adminUser.role);
      
      // Update role to admin if not already
      if (adminUser.role !== 'admin') {
        await User.findByIdAndUpdate(adminUser._id, { role: 'admin' });
        console.log('Rol actualizado a admin');
      }
    } else {
      console.log('Usuario admin no encontrado');
      
      // Create admin user
      const hashedPassword = await bcrypt.hash('admin123', 12);
      
      const newAdmin = await User.create({
        username: 'joseluuu315',
        email: 'joselufupa2016@gmail.com',
        password: hashedPassword,
        role: 'admin'
      });
      
      console.log('Usuario admin creado:', newAdmin);
    }
    
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

fixAdmin();
