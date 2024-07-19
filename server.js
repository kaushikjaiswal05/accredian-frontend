import express from 'express';
import { PrismaClient } from '@prisma/client';
import nodemailer from 'nodemailer';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();
const app = express();

app.use(cors());
app.use(express.json());

app.post('/api/referrals', async (req, res) => {
  const { referrerName, referrerEmail, refereeName, refereeEmail } = req.body;

  if (!referrerName || !referrerEmail || !refereeName || !refereeEmail) {
    return res.status(400).json({ success: false, message: 'All fields are required.' });
  }

  try {
    const referral = await prisma.referral.create({
      data: { referrerName, referrerEmail, refereeName, refereeEmail },
    });

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: refereeEmail,
      subject: 'Referral Program',
      text: `Hi ${refereeName},\n\n${referrerName} has referred you to our program. Join now and earn rewards!`,
    };

    await transporter.sendMail(mailOptions);

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'An error occurred. Please try again.' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
