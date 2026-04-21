import { auth, db } from './firebase';
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut
} from 'firebase/auth';
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  Timestamp
} from 'firebase/firestore';

const TEST_EMAIL = `test-${Date.now()}@loopit.com`;
const TEST_PASSWORD = 'TestPassword123!';

type FirebaseTestError = {
  code?: string;
  message?: string;
};

export async function runDatabaseTests() {
  console.log('🔄 Starting Firebase Connection Tests...\n');

  try {
    // Test 1: Authentication - Signup
    console.log('📝 Test 1: Firebase Authentication (Signup)');
    const signupResult = await createUserWithEmailAndPassword(auth, TEST_EMAIL, TEST_PASSWORD);
    const user = signupResult.user;
    console.log(`✅ User registered: ${user.email} (UID: ${user.uid})\n`);

    // Test 2: Firestore - Create Document
    console.log('📝 Test 2: Firestore - Create Test Document');
    const testDoc = await addDoc(collection(db, 'products'), {
      title: 'Test Product',
      description: 'This is a test product',
      price: 499,
      userId: user.uid,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    console.log(`✅ Document created: ${testDoc.id}\n`);

    // Test 3: Firestore - Read Documents
    console.log('📝 Test 3: Firestore - Read Documents');
    const productsSnapshot = await getDocs(collection(db, 'products'));
    console.log(`✅ Total products in database: ${productsSnapshot.size}`);
    productsSnapshot.forEach((doc) => {
      const data = doc.data();
      console.log(`   - ${doc.id}: ${data.title || 'Unknown'}`);
    });
    console.log();

    // Test 4: Cleanup - Delete test document
    console.log('📝 Test 4: Cleanup - Delete test document');
    await deleteDoc(doc(db, 'products', testDoc.id));
    console.log(`✅ Test document deleted\n`);

    // Test 5: Authentication - Logout
    console.log('📝 Test 5: Firebase Authentication (Logout)');
    await signOut(auth);
    console.log(`✅ User logged out\n`);

    // Test 6: Authentication - Login
    console.log('📝 Test 6: Firebase Authentication (Login)');
    const loginResult = await signInWithEmailAndPassword(auth, TEST_EMAIL, TEST_PASSWORD);
    console.log(`✅ User logged in: ${loginResult.user.email}\n`);

    // Final logout
    await signOut(auth);

    console.log('═══════════════════════════════════════');
    console.log('✅ ALL TESTS PASSED - Firebase Connected!');
    console.log('═══════════════════════════════════════');
    console.log('\n📊 Summary:');
    console.log('   ✓ Authentication (Signup, Login, Logout)');
    console.log('   ✓ Firestore Database (Create, Read, Delete)');
    console.log('\nYour Firebase setup is ready for deployment!');
    return true;

  } catch (error: unknown) {
    const firebaseError = error as FirebaseTestError;
    console.error('\n❌ TEST FAILED');
    console.error('═══════════════════════════════════════');
    console.error('Error:', firebaseError.message || 'Unknown error');
    console.error('═══════════════════════════════════════');
    
    if (firebaseError.code === 'auth/email-already-in-use') {
      console.log('\n💡 Tip: Test email already exists. Run the test again.');
    } else if (firebaseError.code === 'permission-denied') {
      console.log('\n💡 Tip: Check your Firestore security rules in Firebase Console.');
      console.log('   Navigate to: Firestore → Rules');
      console.log('   Current rules must allow authenticated users to read/write.');
    }
    return false;
  }
}
