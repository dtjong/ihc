'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.userHash = userHash;
exports.extractUser = extractUser;
exports.extractUpdateToSave = extractUpdateToSave;
/*
 * This file contains helper functions involved with the User class
 */

/*
 *  Takes in an object with birthday, firstname, lastname fields
 */
function userHash(obj) {
  return obj.birthday + obj.firstname + '&' + obj.lastname;
}

/**
 * Takes in string hash that matches form from above userHash function,
 * converts back to a user
 */
function extractUser(obj) {
  var hash = obj.data;
  var bday = hash.slice(0, 8); // First 8 chars are bday format yyyymmdd
  var firstname = hash.slice(8, hash.indexOf('&'));
  var lastname = hash.slice(hash.indexOf('&') + 1);
  return {
    firstname: firstname,
    lastname: lastname,
    birthday: bday,
    lastupdated: obj.lastupdated
  };
}

/*
 * Take out firstname, lastname, and birthday fields and replace with user key
 */
function extractUpdateToSave(update, userKey) {
  var copy = Object.assign({}, update);
  copy.user = userKey;
  delete copy.firstname;
  delete copy.lastname;
  delete copy.birthday;
  return copy;
}