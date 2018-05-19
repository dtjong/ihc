'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.expandDate = expandDate;
/* Takes in date with form yyyymmdd and returns yyyy-mm-dd */
function expandDate(date) {
  return date.slice(0, 4) + '-' + date.slice(4, 6) + '-' + date.slice(6);
}