require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const { protectPage } = require('./middleware/authMiddleware');

const app = express();
const PORT = process.env.PORT || 5000;

connectDB();

app.use(cors({
  origin: ['http://localhost:5000', 'http://127.0.0.1:5000'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(express.static(path.join(__dirname, '../public')));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/institutes', require('./routes/institute'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/students', require('./routes/students'));
app.use('/api/complaints', require('./routes/complaints'));
app.use('/api/ocr', require('./routes/ocr'));
app.use('/api/pincode', require('./routes/pincode'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/public', require('./routes/public'));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/login.html'));
});
app.get('/forgot-password', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/forgot-password.html'));
});
app.get('/directory', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/directory.html'));
});
app.get('/public-directory', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/public-directory.html'));
});
app.get('/complaint', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/complaint.html'));
});

app.get('/institute/dashboard', protectPage('INSTITUTE'), (req, res) => {
  res.sendFile(path.join(__dirname, '../public/institute-dashboard.html'));
});
app.get('/institute/students', protectPage('INSTITUTE'), (req, res) => {
  res.sendFile(path.join(__dirname, '../public/institute-students.html'));
});
app.get('/institute/students/new', protectPage('INSTITUTE'), (req, res) => {
  res.sendFile(path.join(__dirname, '../public/institute-students-new.html'));
});
app.get('/institute/compliance', protectPage('INSTITUTE'), (req, res) => {
  res.sendFile(path.join(__dirname, '../public/institute-compliance.html'));
});
app.get('/institute/settings', protectPage('INSTITUTE'), (req, res) => {
  res.sendFile(path.join(__dirname, '../public/institute-settings.html'));
});

app.get('/admin/dashboard', protectPage('ADMIN'), (req, res) => {
  res.sendFile(path.join(__dirname, '../public/admin-dashboard.html'));
});
app.get('/admin/institutes', protectPage('ADMIN'), (req, res) => {
  res.sendFile(path.join(__dirname, '../public/admin-institutes.html'));
});
app.get('/admin/register-institute', protectPage('ADMIN'), (req, res) => {
  res.sendFile(path.join(__dirname, '../public/admin-register-institute.html'));
});
app.get('/admin/complaints', protectPage('ADMIN'), (req, res) => {
  res.sendFile(path.join(__dirname, '../public/admin-complaints.html'));
});
app.get('/admin/settings', protectPage('ADMIN'), (req, res) => {
  res.sendFile(path.join(__dirname, '../public/admin-settings.html'));
});

app.get('/district-admin/dashboard', protectPage('ADMIN'), (req, res) => {
  res.sendFile(path.join(__dirname, '../public/district-admin-dashboard.html'));
});

app.use((req, res) => {
  res.status(404).redirect('/');
});

app.listen(PORT, () => {
  console.log(`Server is running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
