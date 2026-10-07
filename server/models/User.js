const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,})+$/, 'Please provide a valid email']
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: 6,
      select: false
    },
    role: {
      type: String,
      enum: ['candidate', 'hr', 'recruiter', 'admin'],
      default: 'candidate'
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid'],
      default: 'pending'
    },
    activated: {
      type: Boolean,
      default: true
    },
    savedJobViews: [
      {
        name: { type: String, required: true },
        queryParams: { type: Object, default: {} },
        columnVisibility: { type: Object, default: {} },
        isDefault: { type: Boolean, default: false },
        createdAt: { type: Date, default: Date.now }
      }
    ],
    jobTablePreferences: {
      density: { type: String, enum: ['comfortable', 'compact'], default: 'comfortable' },
      columnVisibility: { type: Object, default: {} }
    },
    savedJobs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Job' }]
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
