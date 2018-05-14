export function formatDate(date) {
  var monthNames = [
    'January', 'February', 'March',
    'April', 'May', 'June', 'July',
    'August', 'September', 'October',
    'November', 'December'
  ];

  var day = date.getDate();
  var monthIndex = date.getMonth();
  var year = date.getFullYear();

  return day + ' ' + monthNames[monthIndex] + ' ' + year;
}

// Convert yyyymmdd to mm/dd/yy
export function shortDate(date) {
  return date.slice(4,6) + '/' + date.slice(6) + '/' + date.slice(2,4);
}

// Given a Date object, returns string in format yyyymmdd
// We use strings as dates to make equality checks easier
// i.e. if the date is 20180301
// Otherwise the normal date object equality check includes hours and minutes
// etc. I think
export function stringDate(dateObj) {
  const month = dateObj.getMonth()+1 < 10 ? '0' + (dateObj.getMonth()+1) : dateObj.getMonth()+1;
  const date = dateObj.getDate()+1 < 10 ? '0' + (dateObj.getDate()+1) : dateObj.getDate()+1;
  return `${dateObj.getFullYear()}${month}${date}`;
}
