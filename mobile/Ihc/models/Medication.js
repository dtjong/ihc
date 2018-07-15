export default class Medication {
  //for testing purposes
  static getInstance(drugName = 'ibuprofen', expirationDate = '20180101', quantity = 500, dosage = 200, units = 'mg') {
    return {drugName, expirationDate, dosage, quantity, units};
  }

}

Medication.schema = {
  name: 'Medication',
  properties: {
    //TODO: maybe have a category property (i.e. painkillers, antibiotics, dietary supplements, etc)
    //      mainly so that you can search for all drugs in a certain category
    drugName: 'string',
    expirationDate: 'string', //to distinguish between different shipments
    quantity: 'int',
    dosage: 'int',
    units: 'string',
    comments: 'string?', //Consider keeping track of multiple comments (array of strings)
  }
};
