const JsonDatabase = require('./JsonDatabase');
const path = require('path');

async function testDb() {
    const dbPath = path.join(__dirname, 'test_db.json');
    const db = new JsonDatabase(dbPath);

    console.log('--- DB Initialization ---');
    await db.init();

    console.log('\n--- Inserting Data ---');
    await db.insert('users', { name: 'Alice', role: 'admin' });
    await db.insert('users', { name: 'Bob', role: 'user' });

    console.log('\n--- Finding Data ---');
    const admins = await db.find('users', { role: 'admin' });
    console.log('Admins found:', admins);

    console.log('\n--- Updating Data ---');
    await db.update('users', { name: 'Bob' }, { role: 'moderator' });
    const updatedBob = await db.find('users', { name: 'Bob' });
    console.log('Updated Bob:', updatedBob);

    console.log('\n--- Deleting Data ---');
    await db.delete('users', { name: 'Alice' });
    const remainingUsers = await db.find('users');
    console.log('Remaining users:', remainingUsers);

    console.log('\n--- Verification ---');
    console.log('Check backend/src/db/test_db.json for results.');
}

testDb().catch(console.error);
