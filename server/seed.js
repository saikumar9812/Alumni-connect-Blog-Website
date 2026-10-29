import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

import { getMongoURL } from './database/db.js';
import User from './model/user.js';
import Post from './model/post.js';

// Idempotent: users are matched by username and posts by title, existing documents are never modified
const SEED_PASSWORD = process.env.SEED_PASSWORD || 'Alumni@123';

const users = [
    { name: 'Priya Sharma', username: 'priya.sharma', role: 'alumni', graduationYear: 2019, currentCompany: 'Google', currentRole: 'Software Engineer' },
    { name: 'Rahul Verma', username: 'rahul.verma', role: 'alumni', graduationYear: 2016, currentCompany: 'Microsoft', currentRole: 'Product Manager' },
    { name: 'Ananya Iyer', username: 'ananya.iyer', role: 'alumni', graduationYear: 2020, currentCompany: 'Amazon', currentRole: 'Data Scientist' },
    { name: 'Arjun Mehta', username: 'arjun.mehta', role: 'student', graduationYear: 2027 },
    { name: 'Sneha Reddy', username: 'sneha.reddy', role: 'student', graduationYear: 2026 }
];

const posts = [
    {
        title: 'How I cracked the Google SWE interview',
        username: 'priya.sharma',
        company: 'Google',
        role: 'Software Engineer',
        categories: ['Interview Experience'],
        description: 'Four rounds: two DSA, one system design (lite, since it was an L3 role) and one Googleyness round. I practised ~250 LeetCode problems over four months, focusing on graphs and DP. The biggest lesson: talk through your approach before you code, and always test with edge cases out loud. Happy to do mock interviews for final-year students - drop a comment.'
    },
    {
        title: 'Moving from engineering to product management at Microsoft',
        username: 'rahul.verma',
        company: 'Microsoft',
        role: 'Product Manager',
        categories: ['Career Advice'],
        description: 'I spent three years as a developer before switching to PM. What helped: volunteering to write specs for my team, sitting in on customer calls, and learning to frame every feature as a user problem. If you are a student curious about PM, start by writing teardown notes of products you use daily.'
    },
    {
        title: 'Amazon is hiring Data Science interns for summer',
        username: 'ananya.iyer',
        company: 'Amazon',
        role: 'Data Science Intern',
        categories: ['Job Openings'],
        description: 'Our team in Bengaluru is opening summer internship slots for pre-final-year students. Expect an online assessment (SQL + probability + Python) followed by two technical interviews. Comment with your resume link and I can refer a few candidates from our college.'
    },
    {
        title: 'My Amazon Data Scientist loop: what to expect',
        username: 'ananya.iyer',
        company: 'Amazon',
        role: 'Data Scientist',
        categories: ['Interview Experience'],
        description: 'The loop had five interviews, each mapped to Leadership Principles. Technical depth covered A/B testing, ML fundamentals (bias-variance, regularisation) and a live SQL exercise. Prepare 2-3 STAR stories per principle - they will dig deep into "Dive Deep" and "Ownership".'
    },
    {
        title: 'Resume tips for software roles from a hiring panelist',
        username: 'priya.sharma',
        company: 'Google',
        role: 'Software Engineer',
        categories: ['Career Advice'],
        description: 'Keep it to one page, lead every bullet with impact ("reduced latency by 40%"), and put projects above coursework if you have no internship yet. Link your GitHub only if the repos have READMEs. Avoid skill bars and photos.'
    },
    {
        title: 'Looking for guidance: SDE internship prep at Microsoft',
        username: 'arjun.mehta',
        company: 'Microsoft',
        role: 'Software Engineer Intern',
        categories: ['Career Advice'],
        description: 'I am a third-year CSE student targeting the Microsoft SDE internship this cycle. Could alumni share which topics were asked in the online assessment and how much system design is expected at the intern level? Any referral advice would also help.'
    }
];

const seed = async () => {
    await mongoose.connect(getMongoURL(), { useNewUrlParser: true });
    console.log('Connected to database');

    const hashedPassword = await bcrypt.hash(SEED_PASSWORD, 10);
    const roleByUsername = {};
    let createdUsers = 0;

    for (const user of users) {
        roleByUsername[user.username] = user.role;
        const result = await User.updateOne(
            { username: user.username },
            { $setOnInsert: { ...user, password: hashedPassword } },
            { upsert: true }
        );
        createdUsers += result.upsertedCount;
    }

    let createdPosts = 0;
    const now = Date.now();

    for (const [index, post] of posts.entries()) {
        const result = await Post.updateOne(
            { title: post.title },
            { $setOnInsert: { ...post, authorRole: roleByUsername[post.username], createdDate: new Date(now - index * 86400000) } },
            { upsert: true }
        );
        createdPosts += result.upsertedCount;
    }

    console.log(`Users: ${createdUsers} created, ${users.length - createdUsers} already existed`);
    console.log(`Posts: ${createdPosts} created, ${posts.length - createdPosts} already existed`);
};

seed()
    .catch(error => {
        console.error('Seeding failed:', error.message);
        process.exitCode = 1;
    })
    .finally(() => mongoose.disconnect());
