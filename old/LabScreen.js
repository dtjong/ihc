import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image
} from 'react-native';
let t = require('tcomb-form-native');
let Form = t.form.Form;
import {serverData} from '../services/DataService';
import Container from '../components/Container';
import Button from '../components/Button';
import Credentials from '../models/Credentials';


class LabScreen extends Component<{}> {
  render() {
    //TODO update rows
    return (
      <Text> Hello </Text>
    );
  }
}
