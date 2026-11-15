import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getDashboardGreeting,
  getUserDisplayName,
} from '../src/utils/userGreeting.js';

test('dashboard greeting prefers the signed-in user full name', () => {
  const user = {
    email: 'account@example.invalid',
    user_metadata: { full_name: 'Taylor Example' },
  };

  assert.equal(getUserDisplayName(user), 'Taylor Example');
  assert.equal(getDashboardGreeting(user), 'Good morning, Taylor Example');
});

test('dashboard greeting falls back to the email username', () => {
  assert.equal(
    getDashboardGreeting({ email: 'taylor@example.invalid', user_metadata: { full_name: '  ' } }),
    'Good morning, taylor',
  );
});

test('dashboard greeting uses a friendly default when profile data is absent', () => {
  assert.equal(getDashboardGreeting(null), 'Good morning, friend');
  assert.equal(getDashboardGreeting({ email: ' ' }), 'Good morning, friend');
});
