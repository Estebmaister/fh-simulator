
function draw(data = [], opts = {}) {
  const 
    svgHeight = window.innerHeight/1.6,
    svgWidth  = window.innerWidth * (1 -.03);

  let graphPerRow = 1;
  if (svgWidth > 1300) graphPerRow = 2;
  
  const margin = { top: 100, right: 0, bottom: 80, left: 60 };
  const innerHeight = (svgHeight -margin.top  -margin.bottom)/graphPerRow;
  const innerWidth  = (svgWidth  -1.5*margin.left -margin.right)/graphPerRow;

  const svg = d3.select("svg")
    .attr("width" , svgWidth )
    .attr("height", 4*svgHeight/(graphPerRow**2))
    .attr("class" , "line-chart")
    .style("border", '1px solid lightgray')
  
  

  innerDraw(opts, 'm_fuel', 
    0, svgHeight*0,
    {svg,data,margin,innerHeight,innerWidth}
  );
  innerDraw(opts, 'efficiency', 
    graphPerRow == 1 ? 0 : svgWidth/2, 
    graphPerRow == 1 ? svgHeight*1 : 0,
    {svg,data,margin,innerHeight,innerWidth}
  );
  innerDraw(opts, 'cnv_tg_out', 0, 
    graphPerRow == 1 ? svgHeight*2 : svgHeight/2,
    {svg,data,margin,innerHeight,innerWidth}
  );
  innerDraw(opts, 'rad_dist', 
    graphPerRow == 1 ? 0 : svgWidth/2,
    graphPerRow == 1 ? svgHeight*3 : svgHeight/2,
    {svg,data,margin,innerHeight,innerWidth}
  );
}

function innerDraw(
  opts, yVar, xDisplace, yDisplace,
  {svg, data, margin, innerHeight, innerWidth}
  ) {

    innerWidth = innerWidth -margin.left;

  const xAxisFontSize = innerWidth > 1200 ? 
    "2.5em" : "2em";
  const yAxisFontSize = innerHeight *.08;
  const titleFontSize = innerWidth < 900 ?
    innerWidth*.062 : innerWidth*.032;

  const xValue = d => d[opts.graphVar];
  let xAxisLabel = '', xTitle;
  switch (opts.graphVar) {
    case 'humidity':
      xTitle = opts.lang == "es" ? 
        'Humedad' :
        'Humidity';
      xAxisLabel = `${xTitle} [%]`;
      break;
    case 'air_excess':
      xTitle = opts.lang == "es" ? 
        'Exceso de aire' :
        'Air Excess';
      xAxisLabel = `${xTitle} [%]`;
      break;
    case 'm_fluid':
      xTitle = opts.lang == "es" ? 
        'Flujo del fluido' : 
        'Fluid flow';
      xAxisLabel = `${xTitle} [10³-BPD]`;
      break;
  
    default:
      xTitle = opts.lang == "es" ? 
        'Temp. Salida del fluido' :
        'Fluid Outlet Temp';
      xAxisLabel = 'Temp [F]';
      break;
  }
  
  const yValue = d => d[yVar];
  let yAxisLabel = '', yTitle;
  switch (yVar) {
    case 'm_fuel':
      yTitle = opts.lang == "es" ? 
        'Flujo de comb.' :
        'Fuel mass flow';
      yAxisLabel = `${yTitle} [lb/h]`;
      break;
    case 'efficiency':
      yTitle = opts.lang == "es" ? 
      'Eficiencia' :
      'Efficiency';
      yAxisLabel = `${yTitle} [%]`;
      break;
    case 'cnv_tg_out':
      yTitle = opts.lang == "es" ? 
      'Temp. Chimenea' :
      'Temp stack';
      yAxisLabel = `${yTitle} [F]`;
      break;
    case 'rad_dist':
      yTitle = opts.lang == "es" ? 
      'Dist. Radiante' :
      'Radiant dist.';
      yAxisLabel = `${yTitle} [%]`;
      break;
    default:
      break;
  }

  const title = `${yTitle} vs. ${xTitle}`;
  const circleRadius = 3;

  const xExtent  = d3.extent(data, xValue)
  const xScale = d3.scaleLinear()
    .range([0, innerWidth])
    .domain(xExtent)
    .nice();
  const yExtent = d3.extent(data, yValue)
  const yScale = d3.scaleLinear()
    .range([innerHeight, 0])
    .domain(yExtent)
    .nice();

  const xAxis = d3.axisBottom(xScale)
    .tickSize(-innerHeight)
    .tickPadding(15);
  const yAxis = d3.axisLeft(yScale)
    .tickSize(-innerWidth)
    .tickPadding(10);
  
  const graphic = svg.append("g")
    .attr("transform", `translate(${xDisplace+margin.left*1.25},${yDisplace+margin.top/2})`)


  const xAxisG = graphic.append('g').call(xAxis)
    .attr('transform', `translate(0,${innerHeight})`);
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
    .attr("x", innerWidth*.5)
    .attr("fill", "#8E8883")
    .attr("font-size", xAxisFontSize)
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
    .attr("x", -innerHeight*.5)
    .attr("fill", "#8E8883")
    .attr("font-size", yAxisFontSize)
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
  .attr('x', innerWidth*.5)
  .attr("font-size", titleFontSize)
  .attr('text-anchor', 'middle')
  .text(title);
}