import { auth, db, storage } from './firebase';
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
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const TEST_EMAIL = `test-${Date.now()}@loopit.com`;
const TEST_PASSWORD = 'TestPassword123!';

async function testFirebase() {
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
      console.log(`   - ${doc.id}: ${(doc.data() as any).title}`);
    });
    console.log();

    // Test 4: Firebase Storage - Upload Test
    console.log('📝 Test 4: Firebase Storage - Upload Test File');
    const testFileName = `test-${Date.now()}.txt`;
    const storageRef = ref(storage, `test/${testFileName}`);
    const testData = new Blob(['Test file content'], { type: 'text/plain' });
    await uploadBytes(storageRef, testData);
    const downloadURL = await getDownloadURL(storageRef);
    console.log(`✅ Test file uploaded: ${testFileName}`);
    console.log(`   Download URL: ${downloadURL.substring(0, 50)}...\n`);

    // Test 5: Authentication - Logout
    console.log('📝 Test 5: Firebase Authentication (Logout)');
    await signOut(auth);
    console.log(`✅ User logged out\n`);

    // Test 6: Authentication - Login
    console.log('📝 Test 6: Firebase Authentication (Login)');
    const loginResult = await signInWithEmailAndPassword(auth, TEST_EMAIL, TEST_PASSWORD);
    console.log(`✅ User logged in: ${loginResult.user.email}\n`);

    // Cleanup - Delete test document
    console.log('📝 Cleanup: Deleting test document');
    await deleteDoc(doc(db, 'products', testDoc.id));
    console.log(`✅ Test document deleted\n`);

    // Final logout
    await signOut(auth);

    console.log('═══════════════════════════════════════');
    console.log('✅ ALL TESTS PASSED - Firebase Connected!');
    console.log('═══════════════════════════════════════');
    console.log('\n📊 Summary:');
    console.log('   ✓ Authentication (Signup, Login, Logout)');
    console.log('   ✓ Firestore Database (Create, Read)');
    console.log('   ✓ Firebase Storage (Upload, Download)');
    console.log('\nYour Firebase setup is ready for deployment!');

  } catch (error: any) {
    console.error('\n❌ TEST FAILED');
    console.error('═══════════════════════════════════════');
    console.error('Error:', error.message);
    console.error('Code:', error.code);
    console.error('═══════════════════════════════════════');
    
    if (error.code === 'auth/email-already-in-use') {
      console.log('\n💡 Tip: Test email already exists. Run the test again with a fresh timestamp.');
    } else if (error.code === 'permission-denied') {
      console.log('\n💡 Tip: Check your Firestore security rules in Firebase Console.');
    } else if (error.code === 'storage/unauthenticated') {
      console.log('\n💡 Tip: Update Firebase Storage rules to allow authenticated uploads.');
    }
  }
}

// Run the test
testFirebase();
