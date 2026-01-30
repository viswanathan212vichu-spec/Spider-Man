const fs = require('fs');
const path = require('path');

console.log('🧪 Testing Task B3: Admin Dashboard CRUD\n');
console.log('='.repeat(50));

const results = { passed: 0, failed: 0 };

function test(name, condition) {
    if (condition) {
        results.passed++;
        console.log(`✅ ${name}`);
    } else {
        results.failed++;
        console.log(`❌ ${name}`);
    }
}

function fileContains(filePath, searchString) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        return content.includes(searchString);
    } catch {
        return false;
    }
}

const dashboardPath = path.join(process.cwd(), 'pages', 'AdminDashboard.tsx');

// Test 1: Imports eventService
test('Imports eventService', fileContains(dashboardPath, "from '../services/eventService'"));

// Test 2: Imports EventForm
test('Imports EventForm', fileContains(dashboardPath, 'EventForm'));

// Test 3: useEffect for fetching
test('useEffect for data fetching', fileContains(dashboardPath, 'useEffect'));

// Test 4: getEvents call
test('getEvents function used', fileContains(dashboardPath, 'getEvents'));

// Test 5: createEvent call
test('createEvent function used', fileContains(dashboardPath, 'createEvent'));

// Test 6: updateEvent call
test('updateEvent function used', fileContains(dashboardPath, 'updateEvent'));

// Test 7: deleteEvent call
test('deleteEvent function used', fileContains(dashboardPath, 'deleteEvent'));

// Test 8: Delete confirmation
test('Delete confirmation present', fileContains(dashboardPath, 'confirm'));

// Test 9: Loading state
test('Loading state handled', fileContains(dashboardPath, 'setLoading'));

// Test 10: Error state
test('Error state handled', fileContains(dashboardPath, 'setError'));

// Test 11: Success message
test('Success message handling', fileContains(dashboardPath, 'successMessage'));

// Test 12: Edit modal functionality
test('Edit modal functionality', fileContains(dashboardPath, 'editingEvent'));

console.log('\n' + '='.repeat(50));
console.log(`📊 Results: ${results.passed}/${results.passed + results.failed} tests passed`);

if (results.failed === 0) {
    console.log('\n🎉 Task B3 validated successfully!');
    fs.unlinkSync(__filename);
    console.log('🧹 Test script cleaned up.');
    process.exit(0);
} else {
    console.log('\n❌ Some tests failed. Please review.');
    process.exit(1);
}
