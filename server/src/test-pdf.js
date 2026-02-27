const pdf = require('pdf-parse');
console.log('Type:', typeof pdf);
console.log('Value:', pdf);
console.log('Keys:', Object.keys(pdf));
if (typeof pdf === 'object') {
  console.log('Default:', pdf.default);
}
