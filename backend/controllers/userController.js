const User = require('../models/userModel');

const createUser = async (req, res) => {
    try {
        const { profile_name} = req.body;
        if (!profile_name || profile_name.trim() === '') {
            return res.status(400).json({ 
                success: false, 
                message: 'Profile name is required' 
            });
        }
        const existingUser = await User.findOne({ 
            profile_name: profile_name.trim() 
        });
        
        if (existingUser) {
            return res.status(400).json({ 
                success: false, 
                message: 'Profile name already exists' 
            });
        }

        const user = new User({
            profile_name: profile_name.trim()
        });
        const savedUser = await user.save();
        res.status(201).json({
            success: true,
            message: 'User profile created successfully',
            data: savedUser
        });
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Internal server error',
            error: error.message 
        });
    }
};
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            data: users
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Internal server error',
            error: error.message 
        });
    }
};

module.exports = {
    createUser,
    getAllUsers,
};