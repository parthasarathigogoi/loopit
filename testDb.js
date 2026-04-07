import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, Timestamp } from 'firebase/firestore';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAoD0pER39z2ye63Jx65vHnfjrfuxW5pRY",
  authDomain: "loopit-572b5.firebaseapp.com",
  projectId: "loopit-572b5",
  storageBucket: "loopit-572b5.firebasestorage.app",
  messagingSenderId: "813099703704",
  appId: "1:813099703704:web:91a19d62bc330b5854dfed"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

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
    process.exit(0);

  } catch (error) {
    console.error('\n❌ TEST FAILED');
    console.error('═══════════════════════════════════════');
    console.error('Error:', error.message);
    console.error('Code:', error.code);
    console.error('═══════════════════════════════════════');
    
    if (error.code === 'auth/email-already-in-use') {
      console.log('\n💡 Tip: Test email already exists. Run the test again.');
    } else if (error.code === 'permission-denied') {
      console.log('\n💡 Tip: Check your Firestore security rules in Firebase Console.');
      console.log('   Allow authenticated reads/writes for testing.');
    }
    process.exit(1);
  }
}

// Run the test
testFirebase();
