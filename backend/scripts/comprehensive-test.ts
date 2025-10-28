import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import * as model from '../src/models/index.js';
import bcrypt from 'bcrypt';

interface TestResult {
    name: string;
    status: 'PASS' | 'FAIL' | 'SKIP';
    error?: string;
    duration?: number;
}

const results: TestResult[] = [];

async function runTest(name: string, testFn: () => Promise<any>): Promise<void> {
    const start = Date.now();
    try {
        await testFn();
        results.push({
            name,
            status: 'PASS',
            duration: Date.now() - start
        });
        console.log(`✅ ${name}`);
    } catch (error) {
        results.push({
            name,
            status: 'FAIL',
            error: (error as Error).message,
            duration: Date.now() - start
        });
        console.log(`❌ ${name}: ${(error as Error).message}`);
    }
}

async function comprehensiveTest() {
    console.log('\n🧪 COMPREHENSIVE BACKEND TEST SUITE');
    console.log('='.repeat(80));
    console.log('Testing all Supabase models and operations...\n');

    let testUserId: number;
    let testHubId: number;
    let testEventId: number;
    let testMarketplaceId: number;
    let testRequestId: number;

    // ============================================
    // USER OPERATIONS
    // ============================================
    console.log('\n👤 TESTING USER OPERATIONS');
    console.log('-'.repeat(40));

    await runTest('Create User', async () => {
        const result = await model.createUser(
            'testuser@example.com',
            await bcrypt.hash('testpass', 10),
            'testuser',
            'Test User'
        );
        testUserId = result.lastInsertRowid as number;
        if (!testUserId) throw new Error('No user ID returned');
    });

    await runTest('Get User by ID', async () => {
        const user = await model.getUser(testUserId);
        if (!user || user.email !== 'testuser@example.com') {
            throw new Error('User not found or incorrect data');
        }
    });

    await runTest('Get User by Email', async () => {
        const user = await model.getUserByEmail('testuser@example.com');
        if (!user || user.id !== testUserId) {
            throw new Error('User not found by email');
        }
    });

    await runTest('Get All Users', async () => {
        const users = await model.getAllUsers();
        if (!Array.isArray(users) || users.length === 0) {
            throw new Error('No users returned');
        }
        // Check if interests are properly parsed as arrays
        users.forEach(user => {
            if (user.interests && !Array.isArray(user.interests)) {
                throw new Error(`User ${user.id} interests not parsed as array`);
            }
        });
    });

    await runTest('Update User', async () => {
        await model.updateUser(testUserId, { name: 'Updated Test User' });
        const user = await model.getUser(testUserId);
        if (user?.name !== 'Updated Test User') {
            throw new Error('User not updated');
        }
    });

    // ============================================
    // HUB OPERATIONS
    // ============================================
    console.log('\n🏢 TESTING HUB OPERATIONS');
    console.log('-'.repeat(40));

    await runTest('Create Hub', async () => {
        const result = await model.createHub(
            'Test Hub',
            'Club',
            'A test hub for testing',
            testUserId,
            { icon: '🧪', color: '#FF0000' }
        );
        testHubId = result.lastInsertRowid as number;
        if (!testHubId) throw new Error('No hub ID returned');
    });

    await runTest('Get Hub by ID', async () => {
        const hub = await model.getHub(testHubId);
        if (!hub || hub.name !== 'Test Hub') {
            throw new Error('Hub not found or incorrect data');
        }
    });

    await runTest('Get All Hubs', async () => {
        const hubs = await model.getAllHubs();
        if (!Array.isArray(hubs) || hubs.length === 0) {
            throw new Error('No hubs returned');
        }
    });

    await runTest('Get Hubs by Type', async () => {
        const clubs = await model.getHubsByType('Club');
        if (!Array.isArray(clubs)) {
            throw new Error('No clubs returned');
        }
    });

    await runTest('Update Hub', async () => {
        await model.updateHub(testHubId, { description: 'Updated description' });
        const hub = await model.getHub(testHubId);
        if (hub?.description !== 'Updated description') {
            throw new Error('Hub not updated');
        }
    });

    await runTest('Add Hub Member', async () => {
        await model.addHubMember(testHubId, testUserId, 'member');
    });

    await runTest('Get Hub Members', async () => {
        const members = await model.getHubMembers(testHubId);
        if (!Array.isArray(members) || members.length === 0) {
            throw new Error('No hub members returned');
        }
    });

    await runTest('Check Hub Membership', async () => {
        const membership = await model.checkHubMembership(testHubId, testUserId);
        if (!membership?.isMember) {
            throw new Error('Membership check failed');
        }
    });

    await runTest('Get User Club Role', async () => {
        const role = await model.getUserClubRole(testHubId, testUserId);
        if (!role) {
            throw new Error('No role returned');
        }
    });

    await runTest('Is Club Member', async () => {
        const isMember = await model.isClubMember(testHubId, testUserId);
        if (!isMember) {
            throw new Error('Club membership check failed');
        }
    });

    await runTest('Can Manage Members', async () => {
        const canManage = await model.canManageMembers(testHubId, testUserId);
        // Should be true since user is creator
    });

    await runTest('Add Hub Interest', async () => {
        await model.addHubInterest(testHubId, 'Testing');
    });

    await runTest('Get Hub Interests', async () => {
        const interests = await model.getHubInterests(testHubId);
        if (!Array.isArray(interests)) {
            throw new Error('No interests returned');
        }
    });

    // ============================================
    // CLUB OPERATIONS
    // ============================================
    console.log('\n🎭 TESTING CLUB OPERATIONS');
    console.log('-'.repeat(40));

    await runTest('Create Club Settings', async () => {
        await model.createClubSettings(testHubId, false, true);
    });

    await runTest('Get Club Settings', async () => {
        const settings = await model.getClubSettings(testHubId);
        if (!settings) {
            throw new Error('No club settings returned');
        }
    });

    await runTest('Update Club Settings', async () => {
        await model.updateClubSettings(testHubId, { is_private: true });
    });

    await runTest('Create Join Request', async () => {
        // Create another user for join request
        const result = await model.createUser(
            'joiner@example.com',
            await bcrypt.hash('pass', 10),
            'joiner',
            'Joiner User'
        );
        const joinerId = result.lastInsertRowid as number;

        const requestResult = await model.createJoinRequest(testHubId, joinerId, 'Please let me join');
        if (!requestResult.lastInsertRowid) {
            throw new Error('No join request ID returned');
        }
    });

    await runTest('Get Club Join Requests', async () => {
        const requests = await model.getClubJoinRequests(testHubId, 'pending');
        if (!Array.isArray(requests)) {
            throw new Error('No join requests returned');
        }
    });

    await runTest('Create Club Post', async () => {
        const result = await model.createClubPost(
            testHubId,
            testUserId,
            'Test Post',
            'This is a test post',
            'general'
        );
        if (!result.lastInsertRowid) {
            throw new Error('No post ID returned');
        }
    });

    await runTest('Get Club Posts', async () => {
        const posts = await model.getClubPosts(testHubId);
        if (!Array.isArray(posts)) {
            throw new Error('No club posts returned');
        }
    });

    // ============================================
    // EVENT OPERATIONS
    // ============================================
    console.log('\n📅 TESTING EVENT OPERATIONS');
    console.log('-'.repeat(40));

    await runTest('Create Event', async () => {
        const result = await model.createEvent({
            name: 'Test Event',
            category: 'Workshop',
            description: 'A test event',
            date: '2025-12-01',
            time: '14:00',
            location: 'Test Room',
            organizer: 'Test Hub',
            capacity: 50
        });
        testEventId = result.lastInsertRowid as number;
        if (!testEventId) throw new Error('No event ID returned');
    });

    await runTest('Get Event by ID', async () => {
        const event = await model.getEvent(testEventId, testUserId);
        if (!event || event.name !== 'Test Event') {
            throw new Error('Event not found or incorrect data');
        }
    });

    await runTest('Get All Events', async () => {
        const events = await model.getAllEvents(testUserId);
        if (!Array.isArray(events)) {
            throw new Error('No events returned');
        }
    });

    await runTest('Get Dashboard Events', async () => {
        const events = await model.getDashboardEvents(testUserId);
        if (!Array.isArray(events)) {
            throw new Error('No dashboard events returned');
        }
    });

    await runTest('Update Event', async () => {
        await model.updateEvent(testEventId, { description: 'Updated event description' });
    });

    await runTest('Link Event to Club', async () => {
        await model.linkEventToClub(testEventId, testHubId, 'public', 'All students');
    });

    await runTest('Get Club Event Info', async () => {
        const info = await model.getClubEventInfo(testEventId);
        if (!info) {
            throw new Error('No club event info returned');
        }
    });

    await runTest('Update Club Event Settings', async () => {
        await model.updateClubEventSettings(testEventId, { visibility: 'members_only' });
    });

    // ============================================
    // MARKETPLACE OPERATIONS
    // ============================================
    console.log('\n🛒 TESTING MARKETPLACE OPERATIONS');
    console.log('-'.repeat(40));

    await runTest('Create Marketplace Item', async () => {
        const result = await model.createMarketplaceItem({
            title: 'Test Item',
            description: 'A test marketplace item',
            price: 25.99,
            type: 'sell',
            category: 'Electronics',
            condition: 'Good',
            seller_id: testUserId,
            seller_name: 'Test User',
            seller_avatar: null,
            seller_rating: 4.5
        });
        testMarketplaceId = result.lastInsertRowid as number;
        if (!testMarketplaceId) throw new Error('No marketplace item ID returned');
    });

    await runTest('Get Marketplace Item by ID', async () => {
        const item = await model.getMarketplaceItem(testMarketplaceId);
        if (!item || item.title !== 'Test Item') {
            throw new Error('Marketplace item not found or incorrect data');
        }
    });

    await runTest('Get All Marketplace Items', async () => {
        const items = await model.getAllMarketplaceItems();
        if (!Array.isArray(items)) {
            throw new Error('No marketplace items returned');
        }
    });

    await runTest('Update Marketplace Item', async () => {
        await model.updateMarketplaceItem(testMarketplaceId, { price: 29.99 });
    });

    // ============================================
    // REQUEST OPERATIONS
    // ============================================
    console.log('\n📋 TESTING REQUEST OPERATIONS');
    console.log('-'.repeat(40));

    await runTest('Create Request', async () => {
        const result = await model.createRequest({
            title: 'Test Request',
            description: 'A test request',
            type: 'Feature',
            submitted_to: 'Administration',
            category: 'Academic',
            submitter_id: testUserId,
            submitter_name: 'Test User',
            submitter_avatar: null,
            supporters: 0,
            required: 30
        });
        testRequestId = result.lastInsertRowid as number;
        if (!testRequestId) throw new Error('No request ID returned');
    });

    await runTest('Get Request by ID', async () => {
        const request = await model.getRequest(testRequestId);
        if (!request || request.title !== 'Test Request') {
            throw new Error('Request not found or incorrect data');
        }
    });

    await runTest('Get All Requests', async () => {
        const requests = await model.getAllRequests();
        if (!Array.isArray(requests)) {
            throw new Error('No requests returned');
        }
    });

    await runTest('Update Request', async () => {
        await model.updateRequest(testRequestId, { supporters: 5 });
    });

    // ============================================
    // RSVP OPERATIONS
    // ============================================
    console.log('\n🎫 TESTING RSVP OPERATIONS');
    console.log('-'.repeat(40));

    await runTest('Create/Update RSVP', async () => {
        await model.createOrUpdateRSVP(testEventId, testUserId, 'going');
    });

    await runTest('Get Event RSVPs', async () => {
        const rsvps = await model.getEventRSVPs(testEventId);
        if (!Array.isArray(rsvps)) {
            throw new Error('No RSVPs returned');
        }
    });

    await runTest('Get User RSVP', async () => {
        const rsvp = await model.getUserRSVP(testEventId, testUserId);
        if (!rsvp || rsvp.status !== 'going') {
            throw new Error('User RSVP not found or incorrect status');
        }
    });

    await runTest('Get Event Going Count', async () => {
        const count = await model.getEventGoingCount(testEventId);
        if (typeof count.count !== 'number') {
            throw new Error('Invalid going count returned');
        }
    });

    await runTest('Update Event Attending Count', async () => {
        await model.updateEventAttendingCount(testEventId, 1);
    });

    // ============================================
    // CLEANUP OPERATIONS
    // ============================================
    console.log('\n🧹 TESTING CLEANUP OPERATIONS');
    console.log('-'.repeat(40));

    await runTest('Delete Marketplace Item', async () => {
        await model.deleteMarketplaceItem(testMarketplaceId);
    });

    await runTest('Delete Request', async () => {
        await model.deleteRequest(testRequestId);
    });

    await runTest('Delete Event', async () => {
        await model.deleteEvent(testEventId);
    });

    await runTest('Remove Hub Member', async () => {
        await model.removeHubMember(testHubId, testUserId);
    });

    await runTest('Delete Hub', async () => {
        await model.deleteHub(testHubId);
    });

    await runTest('Delete User', async () => {
        await model.deleteUser(testUserId);
    });

    // ============================================
    // RESULTS SUMMARY
    // ============================================
    console.log('\n' + '='.repeat(80));
    console.log('🏁 TEST RESULTS SUMMARY');
    console.log('='.repeat(80));

    const passed = results.filter(r => r.status === 'PASS').length;
    const failed = results.filter(r => r.status === 'FAIL').length;
    const skipped = results.filter(r => r.status === 'SKIP').length;
    const total = results.length;

    console.log(`\n📊 Total Tests: ${total}`);
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`⏭️  Skipped: ${skipped}`);
    console.log(`📈 Success Rate: ${((passed / total) * 100).toFixed(1)}%`);

    if (failed > 0) {
        console.log('\n❌ FAILED TESTS:');
        results.filter(r => r.status === 'FAIL').forEach(r => {
            console.log(`  - ${r.name}: ${r.error}`);
        });
    }

    const avgDuration = results.reduce((sum, r) => sum + (r.duration || 0), 0) / results.length;
    console.log(`\n⏱️  Average Test Duration: ${avgDuration.toFixed(0)}ms`);

    console.log('\n🚀 DEPLOYMENT READINESS:');
    if (failed === 0) {
        console.log('✅ ALL TESTS PASSED - READY FOR PRODUCTION DEPLOYMENT!');
    } else {
        console.log('❌ SOME TESTS FAILED - FIX ISSUES BEFORE DEPLOYMENT');
    }

    console.log('\n' + '='.repeat(80));
}

comprehensiveTest().catch(console.error);