/* eslint-disable */
// UNDER NEW SETUP, THIS FILE ISN'T USED
// BUT MAY BE USEFUL TO HAVE TO SEE HOW PREVIOUS SETUP WAS DONE.
// DELETE WHEN DONE
/* Wrapper class to handle all mongo db calls */
const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');

// Connection URL
// TODO: Move to config file
const url = 'mongodb://localhost:27017/data';

const dbName = 'ihc';
let db, myClient;

export function databaseConnect() {
  // Use connect method to connect to the database server
  console.log("Database connection check...");
  const options = {
    autoReconnect: true
  }

  MongoClient.connect(url, options, function(err, client) {
    if(err) {
      console.log("Database connection failed... Make sure database server is running (mongod)");
      process.exit();
    }
    console.log("Database connection successful!");

    db = client.db(dbName);
    myClient = client;
  });
}

export function patientExists(patientInfo, callback, next) {
  db.collection('patients').find({
      info: patientInfo
    })
    .next( (err,doc) => {
      try {
        assert.equal(null, err);
      } catch(e) {
        const msg = err ? err.message : e.message;
        next(new Error("Error for patientExists: " + msg));
        return;
      }
      callback(doc);
    });
}

export function createPatient(patientInfo, callback, next) {
  db.collection('patients').insertOne({info: patientInfo},
      function(err, r) {
        try {
          assert.equal(null, err);
          assert.equal(1, r.insertedCount);
        } catch(e) {
          const msg = err ? err.message : e.message;
          next(new Error("Error for createPatient: " + msg));
          return;
        }
        callback();
      });
}

export function patientSignin(patientInfo, callback, next) {
  updateStatus(patientInfo, newStatusObject(), callback, next);
}

export function updateStatus(patientInfo, newStatus, callback, next) {
  // Filter by finding matching identifying info
  db.collection('patients')
    .updateOne({info: patientInfo},
      { $set: { status: newStatus } },
      (err, r) => postUpdateFunction(err, r, callback, next, 'updateStatus', 1, 0));
}

export function updateSoap(patientInfo, newSoap, callback, next) {
  // Workaround to set the proper location
  const intermediaryUpdate = { $set : {} };
  intermediaryUpdate.$set['forms.soaps.' + newSoap.date] = newSoap;

  db.collection('patients')
    .updateOne(
      {
        info: patientInfo,
      },
      intermediaryUpdate,
      (err, r) => postUpdateFunction(err, r, callback, next, 'updateSoap', 1, 0));
}

export function updateTriage(patientInfo, newTriage, callback, next) {
  // Workaround to set the proper location
  const intermediaryUpdate = { $set : {} };
  intermediaryUpdate.$set['forms.triages.' + newTriage.date] = newTriage;

  db.collection('patients')
    .updateOne(
      {
        info: patientInfo,
      },
      intermediaryUpdate,
      (err, r) => postUpdateFunction(err, r, callback, next, 'updateTriage', 1, 0));
}

export function addGrowthChartUpdate(patientInfo, update, callback, next) {
  db.collection('patients')
    .updateOne(
      {
        info: patientInfo,
      },
      { $push: {'forms.growthchart.rows': update } },
      (err, r) => postUpdateFunction(err, r, callback, next, 'addGrowthChartUpdate', 1, 0));
}

export function signoutEveryone(callback, next) {
  db.collection('patients')
    .updateMany(
      {
        "status.active": true,
      },
      { $set: {'status.active': false} },
      (err, r) => postUpdateFunction(err, r, callback, next, 'signoutEveryone', -1, 0));
}

export function getPatients(returnOnlyCheckedInPatients, includeForms, callback, next) {
  if(returnOnlyCheckedInPatients) {
    var cursor = db.collection('patients').find({
      "status.active": true
    });
  } else {
    var cursor = db.collection('patients').find();
  }

  if(includeForms) {
    cursor = cursor.project({info: 1, status: 1, forms: 1});
  } else {
    cursor = cursor.project({info: 1, status: 1});
  }

  cursor.toArray().then( (documents) => {
    callback(documents);
  });
}

// Helper functions ===================================

function newStatusObject() {
  const statusObj = {};
  statusObj.active = true; // True if currently checked in
  statusObj.checkinTime = new Date().getTime();
  statusObj.triageCompleted = false;
  statusObj.doctorCompleted = false;
  statusObj.pharmacyCompleted = false;
  return statusObj;
}

/*
 * Function called after many of the db interactions
 * Encapsulates error checking
 * If expectedXXXCount is negative, then don't check
 */
function postUpdateFunction(err, r, callback, next, functionName = "",
    expectedModifiedCount = 0, expectedInsertCount = 0) {
  try {
    assert.equal(null, err);
    if(r.modifiedCount !== null ) {
      if( expectedModifiedCount > 0 && expectedModifiedCount !== r.modifiedCount) {
        throw new Error(`Modified count expected to be ${expectedModifiedCount} but was ${r.modifiedCount}`);
      }
    }

    if(r.insertedCount !== null ) {
      if( expectedInsertCount > 0 && expectedInsertCount != r.insertedCount) {
        throw new Error(`Inserted count expected to be ${expectedInsertCount} but was ${r.insertedCount}`);
      }
    }
  } catch(e) {
    const msgBegin = functionName ? `Error for ${functionName}: ` : 'Error: ' ;
    const msg = err ? err.message : e.message;
    next(new Error(msgBegin + msg));
    return;
  }
  callback(r.result.ok === 1);
}



// OLD FIREBASE STUFF BELOW, delete when not necessary

import {userHash, extractUser, extractUpdateToSave} from './utility/UserUtil';

// Helper functions ===================================

// Gets a new update key and then adds the update
function addUpdate(update, updatesTimestampRef, groupId, database) {
  // Get new update key for each update
  const updateKey = updatesTimestampRef.push(true).key;
  update = extractUpdateToSave(update, update.user);

  // TODO: Error handling of this set call
  const updateRef = database.ref(`/groups/${groupId}/updates/${updateKey}`);
  updateRef.set(update)
    .catch(error => console.log('Error while calling Firebase set()', error));

  const userUpdatesRef = database.ref(`/groups/${groupId}/user/${update.user}/${updateKey}`);
  userUpdatesRef.set(true);

  const usersRef = database.ref(`/groups/${groupId}/users/${update.user}`);
  usersRef.child('lastupdated').set(new Date().getTime());
}

// Returns a promise that resolves when all users are confirmed to be added to
// the database
// Also updates the updates objects to include the user:userKey key/value pair
function addNewUsers(updates, groupId, database) {
  const usersRef = database.ref(`/groups/${groupId}/users`);
  const promises = [];
  const newUpdates = [];

  updates.forEach(update => {
    const hash = userHash(update);
    const getUserKeyPromise = getUserKey(hash, groupId, database).then(userKey => {
      // User doesn't exist yet
      if(!userKey) {
        // Add them
        const pushRef = usersRef.push();
        userKey = pushRef.key;
        const promise = pushRef.child('data').set(hash);
        const promise2 = pushRef.child('lastupdated').set(new Date().getTime());
        promises.push(promise);
        promises.push(promise2);
      }
      const newUpdate = Object.assign({}, update);
      newUpdate.user = userKey;
      newUpdates.push(newUpdate);
    });
    promises.push(getUserKeyPromise);
  });
  return Promise.all(promises).then(() => newUpdates);
}

// Returns a promise of userKey
function getUserKey(hash, groupId, database) {
  const usersRef = database.ref(`/groups/${groupId}/users`);
  return usersRef.orderByChild('data').equalTo(hash).once('value')
    .then(snapshot => snapshot.val())
    .then(keyObj => keyObj ? Object.keys(keyObj)[0] : null);
}

// public functions ===================================

/*
 * Adds updates for list of users
 * If timestamp is not defined, will create one
 */
export function addUpdates(updates, groupId, database, timestamp) {
  if(!Array.isArray(updates)) {
    throw new Error('addUpdates(updates): Non-array type passed in as updates');
  }
  if(!timestamp)
    timestamp = new Date().getTime();

  const groupRef = database.ref(`/groups/${groupId}/`);

  // Add timestamp and extract its generated key
  const newTimestampRef = groupRef.child('timestamps').push(timestamp);
  const timestampKey = newTimestampRef.key;
  const updatesTimestampRef = database.ref(`/groups/${groupId}/updates/timestamp/${timestampKey}`);

  // Add any new users, returns updates with the userKey
  return addNewUsers(updates, groupId, database)
    .catch(() => {throw new Error('addNewUsers() failed');})
    .then(updates => {
      updates.forEach(update => {
        addUpdate(update, updatesTimestampRef, groupId, database);
      });
    });
}

/* eslint-enable */
