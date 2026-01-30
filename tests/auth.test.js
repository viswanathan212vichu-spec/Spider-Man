
import fs from 'fs';
import path from 'path';

console.log('🧪 Starting Authentication Tests...\n');

const tests = {
    passed: 0,
    failed: 0,
    results: []
};

function test(name, condition) {
    if (condition) {
        tests.passed++;
        tests.results.push(`✅ ${name}`);
    } else {
        tests.failed++;
        tests.results.push(`❌ ${name}`);
    }
}

async function runTests() {
    const rootDir = process.cwd();

    // Test 1: Check Firebase config exists and uses env vars
    try {
        const firebasePath = path.join(rootDir, 'firebase.ts');
        const content = fs.readFileSync(firebasePath, 'utf8');
        test('Firebase file exists', fs.existsSync(firebasePath));
        test('Firebase uses env vars', content.includes('import.meta.env'));
    } catch (e) {
        test('Firebase config check failed', false);
    }

    // Test 2: Check AuthContext exists
    try {
        const authPath = path.join(rootDir, 'context', 'AuthContext.tsx');
        test('AuthContext file exists', fs.existsSync(authPath));
    } catch (e) {
        test('AuthContext file exists', false);
    }

    // Test 3: Check SignIn/SignUp pages
    try {
        test('LoginPage exists', fs.existsSync(path.join(rootDir, 'pages', 'LoginPage.tsx')));
        test('SignUpPage exists', fs.existsSync(path.join(rootDir, 'pages', 'SignUpPage.tsx')));
    } catch (e) {
        test('Auth pages check failed', false);
    }

    // Test 4: Check ProtectedRoute
    try {
        const protectedRoutePath = path.join(rootDir, 'components', 'ProtectedRoute.tsx');
        test('ProtectedRoute exists', fs.existsSync(protectedRoutePath));
    } catch (e) {
        test('ProtectedRoute exists', false);
    }

    // Test 5: Check environment variables
    try {
        test('Environment file exists', fs.existsSync(path.join(rootDir, '.env.local')));
    } catch (e) {
        test('Environment file exists', false);
    }

    // Print results
    console.log('\n📊 TEST RESULTS:');
    console.log('================');
    tests.results.forEach(r => console.log(r));
    console.log('================');
    console.log(`Total: ${tests.passed + tests.failed} | Passed: ${tests.passed} | Failed: ${tests.failed}`);

    if (tests.failed > 0) {
        process.exit(1);
    }
}

runTests().catch(console.error);
