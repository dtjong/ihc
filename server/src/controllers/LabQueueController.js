import LabRequestModel from '../models/LabRequest';

const LabQueueController = {

  AddToQueue: function(req, res) {
    LabRequestModel.findOne({patientKey: req.body.labRequest.patientKey, testType: req.body.labRequest.testType}, function(err, labRequest) {
      if (labRequest) {
        err = new Error(`A ${req.body.labRequest.testType} test request for patient ${req.body.labRequest.patientKey} was already enqueued`);
      }
      if (err) {
        res.json({status: false, error: err.message});
        return;
      }
      LabRequestModel.create(req.body.labRequest, function(err) {
        if (err) {
          res.json({status: false, error: err.message});
          return;
        }
        res.json({status: true});
        return;
      });
    });
  },

  RemoveFromQueue: function(req, res) {
    LabRequestModel.deleteMany({patientKey: req.body.labRequest.patientKey, testType: req.body.labRequest.testType}, function(err, labRequest) {
      if (!labRequest) {
        err = new Error(`A ${req.body.labRequest.testType} test request for patient ${req.body.labRequest.patientKey} does not exist in the queue`);
      }
      if (err) {
        res.json({status: false, error: err.message});
        return;
      }
      res.json({status: true});
      return;
    });
  },

  ClearQueue: function(req, res) {
    LabRequestModel.deleteMany({}, function(err, labRequest) {
      if (err) {
        res.json({status: false, error: err.message});
        return;
      }
      res.json({status: true});
      return;
    });
  },

  MarkComplete: function(req, res) {
    LabRequestModel.findOne({key: req.params.key}, function(err, labRequest) {
      if (!labRequest) {
        err = new Error(`The lab request ${req.params.key} does not exist in the queue`);
      }
      if (err) {
        res.json({status: false, error: err.message});
        return;
      }

      labRequest.dateCompleted = new Date();
      labRequest.save(function(err) {
        if(err) {
          res.json({status: false, error: err.message});
          return;
        }
        res.json({status: true});
        return;
      });
    });
  },

  MarkIncomplete: function(req, res) {
    LabRequestModel.findOne({key: req.params.key}, function(err, labRequest) {
      if (!labRequest) {
        err = new Error(`The lab request ${req.params.key} does not exist in the queue`);
      }
      if (err) {
        res.json({status: false, error: err.message});
        return;
      }

      labRequest.dateCompleted = null;
      labRequest.save(function(err) {
        if(err) {
          res.json({status: false, error: err.message});
          return;
        }
        res.json({status: true});
        return;
      });
    });
  },

  GetUpdatedLabRequests: function(req, res) {
    const timestamp = parseInt(req.params.lastUpdated);
    // couldn't convert properly
    if(isNaN(timestamp)) {
      res.json({status:false, error: 'Error converting lastUpdated to int'});
      return;
    }

    LabRequestModel.find({ lastUpdated: {$gt: timestamp} },function(err, labRequests){
      if(err){
        res.json({status:false, error: err.message});
        return;
      }
      res.json({status: true, labRequests: labRequests});
    });
  },

  UpdateLabRequests: function(req, res){
    const labRequests = req.body.labRequests;
    const errors = [];
    let addedCount = 0;
    let updatedCount = 0;

    if (labRequests != null) {
      labRequests.forEach(labRequest => {
        LabRequestModel.findOne({key: labRequest.key}, function(err, oldLabRequest) {
          if(err) {
            errors.push(err.message);
            return;
          }

          // If no lab request exists on the server, add it
          if(!oldLabRequest) {
            LabRequestModel.create(labRequest, function(err) {
              if(err)
                errors.push(err);
              else
                addedCount++;
            });
            return;
          }

          // For updates, make sure the incoming object is up to date
          if(oldLabRequest.lastUpdated > labRequest.lastUpdated) {
            errors.push('LabRequest sent is not up-to-date. Sync required.');
          }

          // TODO: Iterate through forms and update individually if lastUpdated
          // works out, instead of a blanket set() call
          oldLabRequest.set(labRequest);
          //saves it, callback function to handle error
          oldLabRequest.save(function(e) {
            if(e) {
              errors.push(e);
            } else {
              updatedCount++;
            }
          });
        });
      });
    }
    res.json({errors: errors, addedCount: addedCount, updatedCount: updatedCount});
    return;
  },

};

module.exports = LabQueueController;
