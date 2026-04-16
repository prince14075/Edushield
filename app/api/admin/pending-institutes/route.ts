import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Institute from '@/models/Institute';
import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';

export async function GET(req: Request) {
  try {
    await dbConnect();
    const pendingInstitutes = await Institute.find({ status: 'Pending' }).sort({ registrationDate: -1 });
    return NextResponse.json({ success: true, data: pendingInstitutes });
  } catch (error) {
    console.error('Failed to fetch pending institutes:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch pending institutes' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const { id, action } = await req.json(); // id is the MongoDB _id

    if (!id || !['Approve', 'Reject'].includes(action)) {
      return NextResponse.json({ success: false, error: 'Invalid parameters' }, { status: 400 });
    }

    await dbConnect();
    const institute = await Institute.findById(id);

    if (!institute) {
      return NextResponse.json({ success: false, error: 'Institute not found' }, { status: 404 });
    }

    if (action === 'Reject') {
      institute.status = 'Rejected';
      institute.riskStatus = 'UNSAFE';
      await institute.save();
      return NextResponse.json({ success: true, message: 'Institute rejected successfully' });
    }

    // Approval Flow
    const plainPassword = Math.random().toString(36).slice(-8);
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(plainPassword, salt);

    institute.status = 'Approved';
    institute.riskStatus = 'SAFE'; // Initially safe
    institute.password = hashedPassword;
    await institute.save();

    const ownerEmail = institute.ownerDetails?.email;
    const ownerMobile = institute.ownerDetails?.contact;

    // Send Real Email with Login Credentials
    if (ownerEmail && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: ownerEmail,
        subject: 'EduShield - Registration Approved',
        html: `
          <h2>Congratulations!</h2>
          <p>Your coaching institute registration for <strong>${institute.name}</strong> has been officially approved by the District Admin.</p>
          <p>Here are your secure login credentials:</p>
          <ul>
            <li><strong>Login ID:</strong> ${institute.instituteId}</li>
            <li><strong>Temporary Password:</strong> ${plainPassword}</li>
          </ul>
          <p>Please log in and change your password immediately.</p>
        `
      };

      await transporter.sendMail(mailOptions);
    } else {
      console.log(`[Mock Email] Registration Approved for ${institute.name}. ID: ${institute.instituteId}, PASS: ${plainPassword}`);
    }

    // Mock SMS
    if (ownerMobile) {
      console.log(`[Mock SMS] Sent to ${ownerMobile}: Your EduShield registration is approved. ID: ${institute.instituteId}, PASS: ${plainPassword}`);
    }

    const isMock = !process.env.EMAIL_USER || !process.env.EMAIL_PASS;
    return NextResponse.json({ 
      success: true, 
      message: isMock ? `Approved! (Mock Email ID: ${institute.instituteId} | Pass: ${plainPassword})` : 'Institute approved and credentials dispatched.',
      credentials: isMock ? { id: institute.instituteId, pass: plainPassword } : undefined
    });

  } catch (error) {
    console.error('Approval/Rejection error:', error);
    return NextResponse.json({ success: false, error: 'Process failed' }, { status: 500 });
  }
}
