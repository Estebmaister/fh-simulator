
function draw(data = [], opts = {}) {
  const 
    svgHeight = window.innerHeight/1.5,
    svgWidth  = window.innerWidth * (1 -.02);

  const svg = d3.select("svg")
    .attr("width" , svgWidth)
    .attr("height", svgHeight)
    .attr("class" , "line-chart")
    .style("border", '1px solid lightgray')

  const margin = { top: 60, right: 40, bottom: 60, left: 60 };
  const innerHeight = svgHeight -margin.top  -margin.bottom;
  const innerWidth  = svgWidth  -margin.left -margin.right;

  innerDraw(opts.graphVar, 'm_fuel',0,0,
    {svg,data,margin,innerHeight,innerWidth}
  );
  innerDraw(opts.graphVar, 'efficiency',0,svgHeight/2,
    {svg,data,margin,innerHeight,innerWidth}
  );
  innerDraw(opts.graphVar, 'cnv_tg_out',svgWidth/2,0,
    {svg,data,margin,innerHeight,innerWidth}
  );
  innerDraw(opts.graphVar, 'rad_dist',svgWidth/2,svgHeight/2,
    {svg,data,margin,innerHeight,innerWidth}
  );
}

function innerDraw(
  xVar, yVar, xDisplace, yDisplace,
  {svg, data, margin, innerHeight, innerWidth}
  ) {

  innerHeight = innerHeight -margin.top  -margin.bottom;
  innerWidth = innerWidth -margin.left -margin.right;

  const xValue = d => d[xVar];
  let xAxisLabel = '', xTitle;
  switch (xVar) {
    case 'humidity':
      xTitle = 'Humidity';
      xAxisLabel = `${xTitle} [%]`;
      break;
    case 'air_excess':
      xTitle = 'Air Excess';
      xAxisLabel = `${xTitle} [%]`;
      break;
    case 'm_fluid':
      xTitle = 'Fluid mass flow';
      xAxisLabel = `${xTitle} [10³-BPD]`;
      break;
  
    default:
      xTitle = 'Fluid Outlet Temp';
      xAxisLabel = 'Temp [F]';
      break;
  }
  
  const yValue = d => d[yVar];
  let yAxisLabel = '', yTitle;
  switch (yVar) {
    case 'm_fuel':
      yTitle = 'Fuel mass flow';
      yAxisLabel = `${yTitle} [lb/h]`;
      break;
    case 'efficiency':
      yTitle = 'Efficiency';
      yAxisLabel = `${yTitle} [%]`;
      break;
    case 'cnv_tg_out':
      yTitle = 'Temp stack';
      yAxisLabel = `${yTitle} [F]`;
      break;
    case 'rad_dist':
      yTitle = 'Radiant dist.';
      yAxisLabel = `${yTitle} [%]`;
      break;
    default:
      break;
  }

  const title = `Heater: ${yTitle} vs. ${xTitle}`;
  const circleRadius = 3;

  const xExtent  = d3.extent(data, xValue)
  const xScale = d3.scaleLinear()
    .range([0, innerWidth/2])
    .domain(xExtent)
    .nice();
  const yExtent = d3.extent(data, yValue)
  const yScale = d3.scaleLinear()
    .range([innerHeight/2, 0])
    .domain(yExtent)
    .nice();

  const xAxis = d3.axisBottom(xScale)
    .tickSize(-innerHeight/2)
    .tickPadding(15);
  const yAxis = d3.axisLeft(yScale)
    .tickSize(-innerWidth/2)
    .tickPadding(10);
  
  const graphic = svg.append("g")
    .attr("transform", `translate(${xDisplace+margin.left},${yDisplace+margin.top})`)

  const xAxisG = graphic.append('g').call(xAxis)
    .attr('transform', `translate(0,${innerHeight/2})`);
  xAxisG.select('.domain').remove();
  xAxisG.selectAll('.tick').selectAll('line')
    .attr("stroke-dasharray", 3)
    .attr("stroke-width", 0.1);
  xAxisG.selectAll('.tick').selectAll('text')
    .attr('fill','#646a6c')
    .attr("font-size", "1.3em");
  xAxisG.append("text")
    .attr("class", "axis-label")
    .attr("y", -10)
    .attr("x", innerWidth/4)
    .attr("fill", "#8E8883")
    .attr("font-size", innerWidth>900 ? innerWidth*.016 : innerWidth*.03)
    .text(xAxisLabel)

  const yAxisG = graphic.append('g').call(yAxis)
  .attr("fill", "#FEF8F3");
  yAxisG.selectAll('.domain').remove();
  yAxisG.selectAll('.tick').selectAll('line')
    .attr("stroke-dasharray", 3)
    .attr("stroke-width", 0.1);
  yAxisG.selectAll('.tick').selectAll('text')
    .attr('fill','#646a6c')
    .attr("font-size", "1.3em");
  yAxisG.append("text")
    .attr("class", "axis-label")
    .attr("transform", "rotate(-90)")
    .attr("y", 30)
    .attr("x", -innerHeight/4)
    .attr("fill", "#8E8883")
    .attr("font-size", innerHeight *.055)
    .attr('text-anchor', 'middle')
    .text(yAxisLabel)


  graphic.selectAll('circle').data(data)
    .enter().append('circle')
      .attr("fill", "red")
      .attr("opacity", "0.3")
      .attr('cy', d => yScale(yValue(d)))
    .transition().duration(500).delay((_d, i) => i*10)
      .attr('cx', d => xScale(xValue(d)))
      .attr('r', circleRadius);

  const lineGenerator = d3.line()
    .x(d => xScale(xValue(d)))
    .y(d => yScale(yValue(d)))
    .curve(d3.curveBasis);

  const path = graphic.append("path")
  .attr("d", lineGenerator(data))
  .attr("fill", "none")
  .attr("stroke", "steelblue")
  .attr("stroke-linejoin", "round")
  .attr("stroke-linecap", "round")
  const pathLength = path.node().getTotalLength();
  path
    .attr("stroke-dashoffset", pathLength)
    .attr("stroke-dasharray", pathLength)
  .transition().duration(1000).ease(d3.easeSin)
    .attr("stroke-width", 2)
    .attr("stroke-dashoffset", 0);

  graphic.append('text')
  .attr('class', 'title')
  .attr("fill", "#635F5D")
  .attr('y', -10)
  .attr('x', innerWidth /4)
  .attr("font-size", innerWidth *.023)
  .attr('text-anchor', 'middle')
  .text(title);
}