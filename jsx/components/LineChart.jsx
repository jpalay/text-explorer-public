import React from 'react'
import ReactFauxDom from 'react-faux-dom'
import * as d3 from 'd3'

import LoadingGif from './LoadingGif.jsx'

export default class LineChart extends React.Component {
  smoothData (data, smoothing) {
    var keys = this.objectKeys(data[0])
    var series = keys.filter(s => s !== '__date')

    var runningTotals = {}
    var i
    for (i = 0; i < series.length; i++) {
      runningTotals[series[i]] = 0
    }

    var textsInChunk = 0

    var j
    for (i = 0; i < smoothing && i < data.length; i++) {
      textsInChunk += data[i].__total

      for (j = 0; j < series.length; j++) {
        runningTotals[series[j]] += data[i][series[j]]
      }
    }

    var smoothedData = []
    for (i = 0; i < data.length; i++) {
      var newDatapoint = {
        __date: data[i].__date
      }

      if (i > smoothing) {
        textsInChunk -= data[i - smoothing - 1].__total
      }

      if (i < data.length - smoothing) {
        textsInChunk += data[i + smoothing].__total
      }

      for (j = 0; j < series.length; j++) {
        if (i < data.length - smoothing) {
          runningTotals[series[j]] += data[i + smoothing][series[j]]
        }

        if (i > smoothing) {
          runningTotals[series[j]] -= data[i - smoothing - 1][series[j]]
        }

        newDatapoint[series[j]] = runningTotals[series[j]] / textsInChunk
      }

      smoothedData.push(newDatapoint)
    }

    return smoothedData
  }

  makeChart (chartElement, rawData, smoothing) {
    // Set the dimensions of the canvas / graph
    var margin = {top: 20, right: 80, bottom: 30, left: 50}
    var width = 900 - margin.left - margin.right
    var height = 500 - margin.top - margin.bottom

    // Parse the date / time
    var parseDate = d3.time.format('%Y-%m-%d').parse

    // Set the ranges
    var x = d3.time.scale()
      .range([0, width])

    var y = d3.scale.linear()
        .range([height, 0])

    var color = d3.scale.category10()

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient('bottom')
        .tickFormat(function (d) {
          return d3.time.format('%b %y')(d)
        })

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient('left')

    var line = d3.svg.line()
        .x(function (d) { return x(d.__date) })
        .y(function (d) { return y(d.occurrences) })

    var svg = d3.select(chartElement).append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
      .append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

    rawData.forEach(function (d) {
      d.__date = parseDate(d.__date)
    })

    var data = this.smoothData(rawData, smoothing)

    console.log('data:')
    console.log(data)

    // Scale the range of the data
    color.domain(d3.keys(data[0]).filter(function (key) { return key !== '__date' && key !== '__total' }))

    var words = color.domain().map(function (name) {
      console.log('name: ' + name)
      return {
        name: name,
        values: data.map(function (d) {
          return {__date: d.__date, occurrences: d[name]}
        })
      }
    })

    var nanCount = 0
    for (var i = 0; i < words.length; i++) {
      for (var j = 0; j < words[i].values.length; j++) {
        if (isNaN(words[i].values[j].occurrences)) {
          nanCount++
        }
      }
    }

    console.log('nanCount: ' + nanCount)
    console.log('words:')
    console.log(words)

    x.domain(d3.extent(data, (d) => d.__date))
    y.domain([
      d3.min(words, function (w) { return d3.min(w.values, function (v) { return v.occurrences }) }),
      d3.max(words, function (w) { return d3.max(w.values, function (v) { return v.occurrences }) })
    ])

    svg.append('g')
        .attr('class', 'x axis')
        .attr('transform', 'translate(0,' + height + ')')
        .call(xAxis)

    svg.append('g')
        .attr('class', 'y axis')
        .call(yAxis)
      .append('text')
        .attr('transform', 'rotate(-90)')
        .attr('y', 6)
        .attr('dy', '.71em')
        .style('text-anchor', 'end')
        .text(this.props.yaxis)

    var word = svg.selectAll('.ngram-word')
        .data(words)
      .enter().append('g')
        .attr('class', 'ngram-word')

    word.append('path')
      .attr('class', 'line')
      .attr('d', function (d) { return line(d.values) })
      .style('stroke', function (d) { return color(d.name) })

    word.append('text')
        .datum(function (d) { return {name: d.name, value: d.values[d.values.length - 1]} })
        .attr('transform', function (d) { return 'translate(' + x(d.value.__date) + ',' + y(d.value.occurrences) + ')' })
        .attr('x', 3)
        .attr('dy', '.35em')
        .text(function (d) { return d.name })

    return chartElement
  }

  objectLength (obj) {
    return this.objectKeys(obj).length
  }

  objectKeys (obj) {
    var keys = []
    for (var key in obj) {
      if (obj.hasOwnProperty(key)) {
        keys.push(key)
      }
    }

    return keys
  }

  render () {
    if (this.objectLength(this.props.data) !== 0) {
      var div = ReactFauxDom.createElement('div')
      var chart = this.makeChart(div, this.props.data, this.props.smoothing)

      return (
        <div>
          {chart.toReact()}
        </div>
      )
    }
    else {
      return (<LoadingGif/>)
    }
  }
}

LineChart.propTypes = {
  data: React.PropTypes.array.isRequired,
  yaxis: React.PropTypes.string.isRequired,
  smoothing: React.PropTypes.number
}

LineChart.defaultProps = {
  smoothing: 0
}
