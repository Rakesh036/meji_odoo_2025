import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { generateUniqueFileName } from '../utils/fileUtils.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export const register = async (req, res) => {
  try {
    const { name, email, password, confirmPassword, petName, skillsOffered, skillsWanted, location, isPublic, availability } = req.body;
    const profilePhoto = req.file;

    // Validation
    if (!name || !email || !password || !confirmPassword || !petName) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Handle profile photo upload
    let profilePhotoPath = null;
    if (profilePhoto) {
      console.log('Registration - Profile photo received:', profilePhoto.originalname);
      console.log('Registration - Multer saved file as:', profilePhoto.filename);
      profilePhotoPath = profilePhoto.filename;
    }

    // Create user
    const userData = {
      name,
      email,
      password: hashedPassword,
      petName,
      location,
      isPublic: isPublic === 'true' || isPublic === true,
      skillsOffered: skillsOffered || [],
      skillsWanted: skillsWanted || [],
      availability: availability ? JSON.parse(availability) : {
        weekdays: false,
        weekends: false,
        custom: false,
        customText: ''
      },
      profilePhoto: profilePhotoPath
    };

    const user = await User.createUser(userData);

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      user: user.toJSON(),
      token
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Registration failed' });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find user
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      user: user.toJSON(),
      token
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed' });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email, petName } = req.body;

    if (!email || !petName) {
      return res.status(400).json({ message: 'Email and pet name are required' });
    }

    // Find user
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    // Check pet name
    if (user.petName !== petName) {
      return res.status(400).json({ message: 'Invalid pet name' });
    }

    // Generate reset token (in a real app, send this via email)
    const resetToken = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({
      message: 'Password reset instructions sent to your email',
      resetToken // In production, send this via email instead
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Password reset failed' });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { resetToken, newPassword, confirmPassword } = req.body;

    if (!resetToken || !newPassword || !confirmPassword) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    // Verify reset token
    const decoded = jwt.verify(resetToken, JWT_SECRET);
    const user = await User.findUserById(decoded.userId);

    if (!user) {
      return res.status(400).json({ message: 'Invalid reset token' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update user password
    await User.updateUser(user._id, { password: hashedPassword });

    res.json({ message: 'Password reset successfully' });

  } catch (error) {
    console.error('Reset password error:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(400).json({ message: 'Invalid reset token' });
    }
    res.status(500).json({ message: 'Password reset failed' });
  }
};

export const getSkills = (req, res) => {
  const skills = [
    'React', 'Next.js', 'JavaScript', 'TypeScript', 'Node.js', 'Express.js',
    'Python', 'Django', 'Flask', 'Java', 'Spring Boot', 'C#', '.NET',
    'PHP', 'Laravel', 'Ruby', 'Rails', 'Go', 'Rust', 'C++', 'C',
    'SQL', 'MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'Kafka',
    'Docker', 'Kubernetes', 'AWS', 'Azure', 'GCP', 'Firebase',
    'HTML', 'CSS', 'Sass', 'Tailwind CSS', 'Bootstrap', 'Material-UI',
    'Angular', 'Vue.js', 'Svelte', 'GraphQL', 'REST API', 'WebSocket',
    'Git', 'GitHub', 'GitLab', 'CI/CD', 'Jenkins', 'Travis CI',
    'Linux', 'Ubuntu', 'CentOS', 'Windows Server', 'Apache', 'Nginx',
    'Machine Learning', 'Data Science', 'TensorFlow', 'PyTorch', 'Scikit-learn',
    'Blockchain', 'Ethereum', 'Solidity', 'Web3.js', 'DApp Development'
  ];

  res.json({ skills });
};

export const updateProfile = async (req, res) => {
  try {
    const { name, location, isPublic, skillsOffered, skillsWanted, availability } = req.body;
    const profilePhoto = req.file;
    const userId = req.params.userId;

    console.log('Profile Update - Request body:', req.body);
    console.log('Profile Update - User ID:', userId);
    console.log('Profile Update - Profile photo:', profilePhoto);

    // Find user
    const user = await User.findUserById(userId);
    if (!user) {
      console.log('Profile Update - User not found for ID:', userId);
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('Profile Update - Found user:', user.email);

    // Handle profile photo upload
    let profilePhotoPath = user.profilePhoto;
    if (profilePhoto) {
      console.log('Profile Update - Profile photo received:', profilePhoto.originalname);
      console.log('Profile Update - Multer saved file as:', profilePhoto.filename);
      profilePhotoPath = profilePhoto.filename;
    }

    // Update user data
    const updateData = {
      name,
      location,
      isPublic: isPublic === 'true' || isPublic === true,
      skillsOffered: skillsOffered || [],
      skillsWanted: skillsWanted || [],
      availability: availability ? JSON.parse(availability) : user.availability,
      profilePhoto: profilePhotoPath
    };

    console.log('Profile Update - Update data:', updateData);

    const updatedUser = await User.updateUser(userId, updateData);

    console.log('Profile Update - Updated user:', updatedUser.email);

    res.json({
      message: 'Profile updated successfully',
      user: updatedUser
    });

  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ 
      message: 'Profile update failed',
      error: error.message 
    });
  }
}; 