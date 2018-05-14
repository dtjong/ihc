/* eslint-disable */
import React from 'react';
import PropTypes from 'prop-types';

import {
    View,
    Text,
    StyleSheet,
    Image,
    Dimensions
} from 'react-native';

import Dot from './ScatterPlotComponents/Dot';
import HorizontalLine from './ScatterPlotComponents/HorizontalLine';

const propTypes = {
    data: PropTypes.arrayOf(
        PropTypes.shape({
            color: PropTypes.string,
            unit: PropTypes.string,
            values: PropTypes.arrayOf(
                PropTypes.arrayOf(
                    PropTypes.number
                )
            )

        })
    ), // takes array of series of data (array of arrays of {x, y})
    chartWidth: PropTypes.oneOfType([
      PropTypes.number, // by default uses entire width of the device
      PropTypes.string]),
    chartHeight: PropTypes.oneOfType([
      PropTypes.number, // by default uses entire height of the device
      PropTypes.string]),
    backgroundColor: PropTypes.string, // 'white' by default
    colors: PropTypes.arrayOf(PropTypes.string), // specify the colors for each series of data
    minY: PropTypes.number.isRequired,
    maxY: PropTypes.number.isRequired,
    minX: PropTypes.number.isRequired,
    maxX: PropTypes.number.isRequired,
    title: PropTypes.string,
    unitX: PropTypes.string,
    unitY: PropTypes.string,
    horizontalLinesAt: PropTypes.arrayOf(PropTypes.number),
    verticalLinesAt: PropTypes.arrayOf(PropTypes.number),
}
const defaultProps = {
    chartHeight: Dimensions.get('window').height,
    chartWidth: Dimensions.get('window').width,
    backgroundColor: 'white',
    unitX: '',
    unitY: '',
    title: ''
}

class ScatterPlot extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            ratioX: undefined,
            ratioY: undefined,
            minX: undefined,
            maxX: undefined,
            minY: undefined,
            maxY: undefined,
            horizontalLinesAt: undefined
        };
    }

    render() {
        const { data, chartHeight, chartWidth, backgroundColor, colors, title,
          unitX, unitY } = this.props;
        const { minY, maxY, minX, maxX, horizontalLinesAt, verticalLinesAt } = this.state;
        const { getX, getY } = this;
        const windowHeight = Dimensions.get('window').height;
        const windowWidth = Dimensions.get('window').width;

        const labelPairs = [['black', 'Patient'], ['red', 'P3'], ['orange', 'P5'],
          ['purple', 'P10'],
          ['green', 'P25'], ['blue', 'P50'], ['purple', 'P75'], ['orange', 'P90'],
          ['red', 'P95']].reverse();

        const dotLabels = labelPairs.map( pair => {
          return (
            <View key={`${pair[0]}${pair[1]}`} style={styles.dotLabelContainer}>
              <Dot position="relative" color={pair[0]} />
              <Text style={styles.dotLabel}>{pair[1]}</Text>
            </View>
          )
        });

        const horizontalLines = horizontalLinesAt ?
            horizontalLinesAt.map((line, idx) => {
                return (
                  <HorizontalLine key={idx} bottom={getY(line)} width={chartWidth}
                      displayText={`${line} ${unitY}`} />
                )
              }) : undefined;
        const verticalLines = verticalLinesAt ?
            verticalLinesAt.map((line, idx) => {
              return (
                <View key={idx}
                  style={{
                    opacity: .5,
                    backgroundColor: 'gray',
                    width: 1,
                    height: chartHeight,
                    bottom: 0,
                    left: getX(line),
                    position: 'absolute' }} />
              )
            }) : undefined;

        let points = [];

        if (data) {
            for (let dataSeries of data) {
                // const dataSeries = data[i];
                for (let j = 0; j < dataSeries.values.length; j++) {
                    const point = dataSeries.values[j];
                    points.push(<Dot key={`${data.indexOf(dataSeries)}_${j}`} left={getX(point[0])} bottom={getY(point[1])} color={dataSeries.color} />)
                }
            }
        }

        return (
            <View style={{ height: chartHeight, width: chartWidth, backgroundColor: backgroundColor }}>
                <Text style={styles.title}>{title}</Text>
                <Text style={styles.leftAxisLabel}>{unitY}</Text>
                <Text style={styles.bottomAxisLabel}>{unitX}</Text>
                {dotLabels}
                {points}
                {horizontalLines}
                {verticalLines}
            </View>
        );
    }

    componentWillReceiveProps(nextProps) {
        this.computeAxes(nextProps);
    }

    componentWillMount() {
        this.computeAxes(this.props);
    }

    computeAxes = async (props) => {
        const { data, minX, minY, maxX, maxY, chartWidth, chartHeight } = props;
        let { horizontalLinesAt, verticalLinesAt } = props;

        if (!data) { return; }

        horizontalLinesAt || (horizontalLinesAt = []);
        const _horizontalLinesAt = [];
        for (let i = 0; i < horizontalLinesAt.length; i++) {
            const current = horizontalLinesAt[i];
            if (current >= minY && current <= maxY) { _horizontalLinesAt.push(current) }
        }
        horizontalLinesAt = [..._horizontalLinesAt];

        await this.setState({
            minX: minX,
            maxX: maxX,
            minY: minY,
            maxY: maxY,
            ratioX: chartWidth / (maxX - minX),
            ratioY: chartHeight / (maxY - minY),
            horizontalLinesAt,
            verticalLinesAt
        });
    }

    getX = v => {
        const { minX, ratioX } = this.state;
        return (v - minX) * ratioX;
    }

    getY = v => {
        const { minY, ratioY } = this.state;
        return (v - minY) * ratioY;
    }

    // return min and max values, not used if min and max props are required
    dataExtremes = () => {
      const { data, minX, minY, maxX, maxY } = props;
      let seriesMinX = [], seriesMaxX = [], seriesMinY = [], seriesMaxY = [];
      data.forEach(dataSeries => {
          const xArr = dataSeries.values.map(point => point[0]);
          seriesMinX.push(Math.min.apply(null, xArr));
          seriesMaxX.push(Math.max.apply(null, xArr));
          const yArr = dataSeries.values.map(point => point[1]);
          seriesMinY.push(Math.min.apply(null, yArr));
          seriesMaxY.push(Math.max.apply(null, yArr));
      });
      const _minX = typeof minX !== 'undefined' ?
          Math.min.apply(null, [minX, ...seriesMinX]) : Math.min.apply(null, seriesMinX);
      const _maxX = typeof maxX !== 'undefined' ?
          Math.max.apply(null, [maxX, ...seriesMaxX]) : Math.max.apply(null, seriesMaxX);
      const _minY = typeof minY !== 'undefined' ?
          Math.min.apply(null, [minY, ...seriesMinY]) : Math.min.apply(null, seriesMinY);
      const _maxY = typeof maxY !== 'undefined' ?
          Math.max.apply(null, [maxY, ...seriesMaxY]) : Math.max.apply(null, seriesMaxY);
      const obj = { minX: _minX, maxX: _maxX, minY: _minY, maxY: _maxY };
      return obj;
    }
}

const styles = StyleSheet.create({
  title: {
    margin: 4,
  },
  dotLabel: {
    marginLeft: 4,
    maxHeight: 20,
    bottom: 8,
  },
  dotLabelContainer: {
    paddingTop: 4,
    marginLeft: 4,
    width: 50,
    height: 20,
    flexDirection: 'row',
    alignContent: 'center',
  },
  leftAxisLabel: {
    position: 'absolute',
    left: -8,
    bottom: 100,
    transform: [{ rotate: '90deg'}]
  },
  bottomAxisLabel: {
    position: 'absolute',
    bottom: 0,
    left: 85,
  },
});

ScatterPlot.propTypes = propTypes;
ScatterPlot.defaultProps = defaultProps
export default ScatterPlot;
/* eslint-enable */
