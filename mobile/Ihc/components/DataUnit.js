import React, { Component, useImperativeHandle } from 'react';
import { Text, StyleSheet } from 'react-native';

class DataUnit extends Component<{}> {

    constructor(props) {
        super(props);
    }

    static convertVolume(dataUnit, impToMetric) {
        if (impToMetric && !dataUnit.isMetric) {
            dataUnit.measurement = dataUnit.measurement * 473.16;
            dataUnit.units = MetricUnits.Milliliters;
        }
        if (!impToMetric && dataUnit.isMetric) {
            dataUnit.measurement = dataUnit.measurement / 473.16;
            dataUnit.units = ImpUnits.Pint;
        }

        return dataUnit;
    }

    static convertLength(dataUnit, impToMetric) {
        if (impToMetric && !dataUnit.isMetric) {
            dataUnit.measurement = dataUnit.measurement * 0.305;
            dataUnit.units = MetricUnits.Meters;
        }
        if (!impToMetric && dataUnit.isMetric) {
            dataUnit.measurement = dataUnit.measurement / 0.305;
            dataUnit.units = ImpUnits.Feet;
        }

        return dataUnit;
    }

    static convertWeight(dataUnit, impToMetric) {
        if (impToMetric && !dataUnit.isMetric) {
            dataUnit.measurement = dataUnit.measurement * 0.436;
            dataUnit.units = MetricUnits.Kilograms;
        }
        if (!impToMetric && dataUnit.isMetric) {
            dataUnit.measurement = dataUnit.measurement / 0.436;
            dataUnit.units = ImpUnits.Pounds;
        }

        return dataUnit;
    }
}

ImpUnits = {
    Pint: 0,
    Feet: 1,
    Pounds: 2
};

MetricUnits = {
    Milliliters: 3,
    Meters: 4,
    Kilograms: 5
};

DataUnit.schema = {
    name = 'DataUnit',
    measurement = 'double',
    units = 'int',
    isMetric = 'bool'
};