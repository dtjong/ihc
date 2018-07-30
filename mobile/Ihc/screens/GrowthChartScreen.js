import {localData} from '../services/DataService';
import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View
} from 'react-native';
import ScatterPlot from '../components/ScatterPlot';
import Container from '../components/Container';

const boysWeightData = require('../growthchartdata/boys_weights.json');
const girlsWeightData = require('../growthchartdata/girls_weights.json');
const boysHeightData = require('../growthchartdata/boys_heights.json');
const girlsHeightData = require('../growthchartdata/girls_heights.json');

const infantBoysWeightData = require('../growthchartdata/infant_boys_weights.json');
const infantGirlsWeightData = require('../growthchartdata/infant_girls_weights.json');
const infantBoysHeightData = require('../growthchartdata/infant_boys_heights.json');
const infantGirlsHeightData = require('../growthchartdata/infant_girls_heights.json');

const PLOT_HEIGHT = 400;
const PLOT_WIDTH = 400;

class GrowthChartScreen extends Component<{}> {
  /*
   * Props:
   * patientKey
   */
  constructor(props) {
    super(props);
    this.state = {
      patient: {},
      weightData: [],
      heightData: []
    };
  }

  extractData(data) {
    const arr = [];
    arr.push({ color: 'red', unit: '%', values: data['P3']});
    arr.push({ color: 'orange', unit: '%', values: data['P5']});
    arr.push({ color: 'purple', unit: '%', values: data['P10']});
    arr.push({ color: 'green', unit: '%', values: data['P25']});
    arr.push({ color: 'blue', unit: '%', values: data['P50']});
    arr.push({ color: 'purple', unit: '%', values: data['P75']});
    arr.push({ color: 'orange', unit: '%', values: data['P90']});
    arr.push({ color: 'red', unit: '%', values: data['P95']});
    return arr;
  }

  loadPatient = () => {
    this.props.setLoading(true);

    let patient = {};
    try {
      patient = localData.getPatient(this.props.patientKey);
    } catch(err) {
      this.props.setErrorMessage(err.message);
      this.props.setLoading(false);
      return;
    }

    let weightData, heightData;
    if (patient.isMale && patient.isInfant) {
      weightData = this.extractData(infantBoysWeightData);
      heightData = this.extractData(infantBoysHeightData);
    } 
    else if (patient.isMale && !patient.isInfant) {
      weightData = this.extractData(boysWeightData);
      heightData = this.extractData(boysHeightData);
    } 
    else if (!patient.isMale && patient.isInfant) {
      weightData = this.extractData(infantGirlsWeightData);
      heightData = this.extractData(infantGirlsHeightData);
    }
    else if (!patient.isMale && !patient.isInfant) {
      weightData = this.extractData(girlsWeightData);
      heightData = this.extractData(girlsHeightData);
    }
    
    const growthChartData = patient.growthChartData;
    weightData.push({ color: 'black', unit: '%', values: growthChartData.weights});
    heightData.push({ color: 'black', unit: '%', values: growthChartData.heights});

    this.setState({patient: patient, weightData: weightData, heightData: heightData});
    this.props.setLoading(false);
  }

  componentDidMount() {
    this.loadPatient();
  }

  render() {
    if (!this.state.patient) {
      return (
        <Container>
          <Text style={styles.title}>Growth Chart</Text>
          <Text>No patient exists</Text>
        </Container>
      );
    }

    // Mark every 2 yrs
    const arrYears = Array.from({length: 10}, (v,i) => i * 24 ); 
    // Mark every 25 cm
    const arrCm = Array.from({length: 10}, (v,i) => i * 25 ); 
    // Mark every 25 kg
    const arrKg = Array.from({length: 5}, (v,i) => i * 25 ); 

    return (
      // TODO: Label the grid lines
      <Container>
        <Text style={styles.title}>Growth Chart</Text>

        <View style={styles.plotsContainer}>
          <View style={styles.plotContainer}>
            <ScatterPlot
              data={this.state.weightData}
              chartHeight={PLOT_HEIGHT}
              chartWidth={PLOT_WIDTH}
              minX={0}
              maxX={this.state.patient.isInfant ? 26 : 240}
              minY={0}
              maxY={this.state.patient.isInfant ? 20 : 125}
              horizontalLinesAt={arrKg}
              verticalLinesAt={arrYears}
              title='Weight Growth Chart'
              unitX='Age'
              unitY='Weight' />
          </View>

          <View style={styles.plotContainer}>
            <ScatterPlot
              chartHeight={PLOT_HEIGHT}
              chartWidth={PLOT_WIDTH}
              data={this.state.heightData}
              minX={0}
              maxX={this.state.patient.isInfant ? 26 : 240}
              minY={0}
              maxY={this.state.patient.isInfant ? 105 : 200}
              horizontalLinesAt={arrCm}
              verticalLinesAt={arrYears}
              title='Height Growth Chart'
              unitX='Age'
              unitY='Height' />
          </View>

        </View>
      </Container>
    );
  }
}

const styles = StyleSheet.create({
  plotsContainer: {
    flex: 1,
    margin: 8,
  },
  plotContainer: {
    height: PLOT_HEIGHT + 20,
    margin: 4,
    padding: 8,
    backgroundColor: '#ededed'
  },
  title: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
});

// Redux
import { setLoading, setErrorMessage } from '../reduxActions/containerActions';
import { connect } from 'react-redux';

const mapDispatchToProps = dispatch => ({
  setLoading: val => dispatch(setLoading(val)),
  setErrorMessage: val => dispatch(setErrorMessage(val))
});

export default connect(null, mapDispatchToProps)(GrowthChartScreen);
