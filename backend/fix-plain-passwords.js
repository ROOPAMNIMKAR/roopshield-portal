/**
 * fix-plain-passwords.js
 * Stores plain_password for all existing users so admin panel can display them.
 * Run once: node fix-plain-passwords.js
 */
require('dotenv').config();
const bcrypt = require('bcryptjs');
const db = require('./db');

// Known passwords from seed + add-interns output
const knownPasswords = {
  'admin-001': 'Admin@2025',
  'hr-001': 'HR@2025',
  'intern-001': 'Rahul@123',
  'intern-002': 'Sneha@456',
  'intern-003': 'Arjun@789',
  'intern-004': 'Priya@321',
  'intern-005': 'Kiran@654',
};

// For the 12 new interns, look up by email
const emailPasswords = {
  'swayambhope9@gmail.com': 'Swayam@3985',
  'riddhitekade25@gmail.com': 'Riddhi@8537',
  'gokhalenandini9@gmail.com': 'Nandini@1501',
  'gajbhiyeshujal233@gmail.com': 'Shujal@8220',
  'pritambaramu@gmail.com': 'Pritam@6440',
  'shreyashdhote362@gmail.com': 'Shreyash@9449',
  'rohinigokhale15@gmail.com': 'Rohini@1989',
  'poojananhe3@gmail.com': 'Pooja@8998',
  'tijareshreyash47@gmail.com': 'Shreyash@8746',
  'yograjkakadey@gmail.com': 'Hardik@6782',
  'naineethedaoo@gmail.com': 'Naineet@9389',
  'rushikeshkawadkar9@gmail.com': 'Rushikesh@5286',
};

const users = db.get('users').value();
let updated = 0;

users.forEach((u) => {
  let plain = knownPasswords[u.id] || emailPasswords[u.email];
  if (plain && !u.plain_password) {
    db.get('users').find({ id: u.id }).assign({ plain_password: plain }).write();
    console.log(`✅ ${u.name} (${u.email}) → ${plain}`);
    updated++;
  }
});

console.log(`\nUpdated ${updated} user(s).`);
