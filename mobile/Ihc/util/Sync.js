import {localData, serverData} from '../services/DataService';

// Download updates from the server, save them locally, then resolve Promise
// of all the patient keys that failed to download
export function downstreamSyncWithServer() {
  const lastSynced = localData.lastSynced();

  return serverData.getUpdatedPatients(lastSynced)
    .then((patients) => {
      const failedPatientKeys = localData.handleDownloadedPatients(patients);
      return {failedPatientKeys: failedPatientKeys};
    });
}
