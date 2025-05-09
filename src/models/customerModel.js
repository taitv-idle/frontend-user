const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const customerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Tên là bắt buộc']
    },
    email: {
        type: String,
        required: [true, 'Email là bắt buộc'],
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: [true, 'Mật khẩu là bắt buộc'],
        select: false // Không trả về password trong queries
    },
    phone: {
        type: String,
        trim: true
    },
    address: {
        type: String,
        trim: true
    },
    image: {
        type: String,
        default: ''
    },
    role: {
        type: String,
        default: 'customer'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Hash password trước khi lưu
customerSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

module.exports = mongoose.model('Customer', customerSchema); 