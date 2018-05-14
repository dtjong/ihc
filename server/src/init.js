import config from './config';
import app from './app';

// Can customize port on CLI by doing `node build/init.js PORT_NUMBER`
const port = process.argv[2] || config.port;

// Tablets should fetch from the computer's IP Address, i.e. 192.168.1.100
//Express application will listen to port mentioned in our configuration
app.listen(port, function(err){
  if(err) throw err;
  /* eslint-disable no-console */
  console.log('App listening on port '+port);
  /* eslint-enable no-console */
});
