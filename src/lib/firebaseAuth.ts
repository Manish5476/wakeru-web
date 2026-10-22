const FIREBASE_API_KEY =
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'AIzaSyBlzEYaMWVGTudnfOgJ37JFD2ENPGl8OSo';

export interface FirebaseSignInResult {
  idToken: string;
  email: string;
  refreshToken: string;
  expiresIn: string;
  localId: string;
}

export async function firebaseSignIn(email: string, password: string): Promise<FirebaseSignInResult> {
  const url = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FIREBASE_API_KEY}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, returnSecureToken: true }),
  });

  const data = await res.json();
  if (!res.ok) {
    const errorMsg = data?.error?.message || 'Failed to sign in with email and password.';
    if (errorMsg === 'EMAIL_NOT_FOUND' || errorMsg === 'INVALID_PASSWORD' || errorMsg === 'INVALID_LOGIN_CREDENTIALS') {
      throw new Error('Invalid email or password.');
    }
    if (errorMsg === 'USER_DISABLED') {
      throw new Error('This account has been disabled.');
    }
    throw new Error(errorMsg);
  }

  return data;
}

export async function firebaseSignUp(email: string, password: string): Promise<FirebaseSignInResult> {
  const url = `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${FIREBASE_API_KEY}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, returnSecureToken: true }),
  });

  const data = await res.json();
  if (!res.ok) {
    const errorMsg = data?.error?.message || 'Failed to create account.';
    if (errorMsg === 'EMAIL_EXISTS') {
      throw new Error('An account with this email address already exists.');
    }
    if (errorMsg === 'WEAK_PASSWORD : Password should be at least 6 characters') {
      throw new Error('Password must be at least 6 characters.');
    }
    throw new Error(errorMsg);
  }

  return data;
}

export async function firebaseSendPasswordReset(email: string): Promise<void> {
  const url = `https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=${FIREBASE_API_KEY}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ requestType: 'PASSWORD_RESET', email }),
  });

  const data = await res.json();
  if (!res.ok) {
    const errorMsg = data?.error?.message || 'Failed to send password reset email.';
    if (errorMsg === 'EMAIL_NOT_FOUND') {
      throw new Error('No account found with this email address.');
    }
    throw new Error(errorMsg);
  }
}
