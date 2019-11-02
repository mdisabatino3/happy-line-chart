import * as d3 from "d3";
// set the dimensions and margins of the graph
const margin = { top: 20, right: 20, bottom: 30, left: 50 };
var svgWidth = 960;
var svgHeight = 500;
var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

function setNewWidth(newSvgWidth) {
  svgWidth = newSvgWidth;
  width = newSvgWidth - margin.left - margin.right;
}
function setNewHeight(newSvgHeight) {
  svgHeight = newSvgHeight;
  height = newSvgHeight - margin.top - margin.bottom;
}
// function for parsing the date / time
const parseTime = d3.timeParse("%d-%b-%y");
const bisectDate = d3.bisector(d3.descending).left;

function draw() {
  // set the ranges for the data (width and height of the svg)
  const x = d3.scaleTime().range([0, width]);
  const y = d3.scaleLinear().range([height, 0]);

  // define the area
  var area = d3
    .area()
    .x(function(d) {
      return x(d.date);
    })
    .y0(height)
    .y1(function(d) {
      return y(d.close);
    });

  // define the line
  const valueline = d3
    .line()
    .x(d => x(d.date))
    .y(d => y(d.close));

  const happyDiv = d3.select(".happy-div").style("width", svgWidth + "px");
  // append the svg object to the body of the page
  // appends a 'group' element to 'svg'
  // moves the 'group element to the top left margin
  const svg = d3
    .select(".happy-div")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  // gridlines on x axis function
  function makeXGridlines() {
    return d3.axisBottom(x).ticks(5);
  }

  // gridlines on y axis function
  function makeYGridlines() {
    return d3.axisLeft(y).ticks(5);
  }
  //  add the x gridlines
  svg
    .append("g")
    .attr("class", "grid")
    .attr("transform", "translate(0," + height + ")")
    .call(
      makeXGridlines()
        .tickSize(-height)
        .tickFormat("")
    )
    .append("text")
    .attr("class", "axis-title")
    .attr("transform", "rotate(0)")
    .attr("y", -20)
    .attr("x", width - 30)
    .attr("dy", ".71em")
    .text("Date");

  // add y gridlines
  svg
    .append("g")
    .attr("class", "grid axis axis--y")
    .call(
      makeYGridlines()
        .tickSize(-width)
        .tickFormat("")
    )
    .append("text")
    .attr("class", "axis-title")
    .attr("transform", "rotate(-90)")
    .attr("y", 10)
    .attr("x", -10)
    .attr("dy", ".71em")
    .text("Price");

  const widthTextBox = d3
    .select(".happy-div")
    .append("div")
    .attr("class", "text-box-div")
    .append("input")
    .attr("class", "text-box form-control")
    .attr("type", "number")
    .attr("id", "width-text-box")
    .attr("min", 0)
    .attr("value", svgWidth)
    .attr("step", 10)
    .on("change", () => {
      let newWidth = d3.select("#width-text-box").property("value");
      setNewWidth(newWidth);
      tearDown();
      draw();
    });
  const textBoxDiv = d3.select(".text-box-div");

  textBoxDiv
    .style("width", svgWidth + "px")
    .style("padding-left", margin.left + "px")
    .style("padding-right", margin.right + "px");

  const heightTextBox = d3
    .select(".text-box-div")
    .append("input")
    .attr("class", "text-box form-control")
    .attr("type", "number")
    .attr("id", "height-text-box")
    .attr("min", 0)
    .attr("value", svgHeight)
    .attr("step", 10)
    .on("change", () => {
      let newHeight = d3.select("#height-text-box").property("value");
      setNewHeight(newHeight);
      tearDown();
      draw();
    });

  // get the data
  d3.csv("src/data.csv").then(function(data) {
    console.log(data);
    // format data
    data.forEach(d => {
      d.date = parseTime(d.date);
      d.close = +d.close;
    });

    // scale the range of the data
    x.domain(d3.extent(data.map(d => d.date)));
    y.domain([
      d3.min(data, d => d.close) / 1.05,
      d3.max(data, d => d.close) * 1.05
    ]);

    // add the area
    svg
      .append("path")
      .data([data])
      .attr("class", "area")
      .attr("d", area);
    // create the path and add valueline to path
    // add the valueline to the path
    svg
      .append("path")
      .data([data])
      .attr("class", "line")
      .attr("d", valueline);

    // create focus area
    const focus = svg
      .append("g")
      .attr("class", "focus")
      .style("display", "none");

    focus
      .append("line")
      .attr("class", "x-hover-line hover-line")
      .attr("y1", 0)
      .attr("y2", height);

    focus
      .append("line")
      .attr("class", "y-hover-line hover-line")
      .attr("x1", 0)
      .attr("x2", width);

    focus.append("circle").attr("r", 6);

    // backdrop for tooltip
    focus
      .append("rect")
      .attr("class", "tooltip")
      .attr("width", "200")
      .attr("height", "60")
      .attr("y", "-4em")
      .attr("x", "20")
      .attr("rx", "5")
      .attr("ry", "5");

    const focusText = focus.append("text").attr("class", "textBox");

    focusText
      .append("tspan")
      .attr("class", "tooltip-text")
      .attr("x", "25")
      .attr("dy", "-1em");

    focusText
      .append("tspan")
      .attr("class", "tooltip-text")
      .attr("x", "25")
      .attr("dy", "-1.2em");

    // append area for pulling mouseovers and calling function to display lines
    // and text boxes
    svg
      .append("rect")
      .attr("transform", "translate(" + 0 + "," + 0 + ")")
      .attr("class", "overlay")
      .attr("fill", "transparent")
      .attr("width", width)
      .attr("height", height)
      .on("mouseover", function() {
        focus.style("display", null);
      })
      .on("mouseout", function() {
        focus.style("display", "none");
      })
      .on("mousemove", mousemove);

    function mousemove() {
      const x0 = x.invert(d3.mouse(this)[0]);
      const i = bisectDate(data.map(d => d.date), x0);
      const d0 = data[i - 1];
      const d1 = data[i];
      const d = x0 - d0.date < d1.date - x0 ? d1 : d0;
      focus.attr(
        "transform",
        "translate(" + x(d.date) + "," + y(d.close) + ")"
      );
      focus.selectAll("tspan").nodes()[1].textContent = `Price: ${d.close}`;
      focus
        .selectAll("tspan")
        .nodes()[0].textContent = `Date: ${d.date.toDateString()}`;
      focus.select(".x-hover-line").attr("y2", height - y(d.close));
      focus.select(".y-hover-line").attr("x2", -x(d.date));
    }

    // add x axis
    svg
      .append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x).ticks(5));

    // add y axis
    svg.append("g").call(d3.axisLeft(y).ticks(5));
  });
}
draw();
function tearDown() {
  d3.select(".happy-div")
    .selectAll("*")
    .remove();
}
