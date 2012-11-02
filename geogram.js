var width = 960,
    height = 500,

    chartHeight = 300,
    margin2 = {top: 40, right: 20, bottom: 70, left: 60},
    height2 = chartHeight - (margin2.top + margin2.bottom),
    centered;

var x = d3.scale.ordinal()
    .rangeRoundBands([0, width - (margin2.left + margin2.right)], .1);

var y = d3.scale.linear()
    .range([height2 + 40, 0]);

var projection = d3.geo.albersUsa()
    .scale(width)
    .translate([0, 0]);

var path = d3.geo.path()
    .projection(projection);

var mapsvg = d3.select("#map_svg")
    .attr("width", width)
    .attr("height", height);

var chartsvg = d3.select("#chart_svg")
    .attr("width", width)
    .attr("height", height);

var map = mapsvg.append("g")
    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")")
  .append("g")
    .attr("id", "states");

var chart = chartsvg.append("g")
  .attr("transform", "translate(" + margin2.left + "," + margin2.top + ")")
  .attr("width", width - (margin2.left + margin2.right));

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");

var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left");  

d3.json("readme.json", function(collection) {
  map.selectAll("path")
      .data(collection.features)
    .enter().append("path")
      .attr("d", path)
      .on("click", click);
});

function click(d) {
  var x = 0,
      y = 0,
      k = 1;

  if (d && centered !== d) {
    var centroid = path.centroid(d);
    x = -centroid[0];
    y = -centroid[1];
    k = 4;
    centered = d;
  } else {
    centered = null;
  }

  map.selectAll("path")
      .classed("active", centered && function(d) { return d === centered; });

  map.transition()
      .duration(1000)
      .attr("transform", "scale(" + k + ")translate(" + x + "," + y + ")")
      .style("stroke-width", 1.5 / k + "px");
}

d3.json("cityphotos.json", function(json) {
  var g = map.selectAll("g").data(json.cities)
              .enter().append("g");
  g.selectAll("rect").data(function(d) { return d.location; })
      .enter().append("rect")
        .attr("x", function(d) {
                      var coords = projection([d.lng, d.lat]);
                      console.log(coords[0])
                       return coords[0];
                    })
        .attr("y", function(d) {
                      var coords = projection([d.lng, d.lat]);
                      console.log(coords[0])
                      return coords[1];
                    })
        .attr("width", 4)
        .attr("height", 4)
        .style("fill", "green")
        .on("mouseover", citymouseover);

  g.selectAll("circle").data(function(d) { return d.media; })
      .enter().append("circle")
        .attr("cx", function(d) {
                      var coords = projection([d.location.lng, d.location.lat]);
                       return coords[0];
                    })
        .attr("cy", function(d) {
                      var coords = projection([d.location.lng, d.location.lat]);
                      return coords[1];
                    })
        .attr("r", 2)
        .style("fill", "red")
        .on("mouseover", mouseover)
        .on("mouseout", mouseout);

  function mouseover(d) {
    var projection = d3.geo.albers()
    var coords = projection([d.location.lng, d.location.lat]);
    mapsvg.append("image")
        .attr("xlink:href", d.image_thumb)
        .attr("width", 100)
        .attr("height", 100)
        .attr("x", coords[0])
        .attr("y", coords[1]);
  }

  function mouseout (d) {
    mapsvg.select("image").remove();
  }

  function citymouseover (d) {
    console.log(d);
    mapsvg.select("#"+d.name).style("fill", "red");
  }

  var likes = [];
  var maxLikes = 0;
  json.cities.forEach(function (city) {
    var likeCount = 0;
    var y0 = 0;
    var individualLikes = [];
    city.media.forEach(function (media) {
      individualLikes.push({y0: y0, y1: y0 += media.likes, image: media.image_thumb});
      likeCount += media.likes;
    });
    var name = city.name;
    maxLikes = Math.max(maxLikes, likeCount);
    console.log(city.name + " like count: " + likeCount);
    var dict = {'name':city.name, 'likes':likeCount, 'location':city.location, 'individualLikes':individualLikes};
    likes.push(dict);
  });

  // sort by increasing longitude
  likes.sort(function (a, b) {
    var lngA = a.location[0].lng;
    var lngB = b.location[0].lng;
    return lngA < lngB ? -1 : lngA > lngB ? 1 : 0;
  });

  var color = d3.scale.category20();
  var indices = new Array(25);
  for (var i = 0; i < 25; i++) {
    indices[i] = i;
  };
  console.log(indices);
  color.domain(indices);

  x.domain(likes.map(function(d) { return d.name; }));
  console.log(y.domain([0, d3.max(likes, function(d) { return d.likes; })]));

  var city = chart.selectAll(".city")
                    .data(likes)
                    .enter().append("g")
                    .attr("class", "g")
                    .attr("transform", function(d) { console.log(d); return "translate(" + x(d.name) + ",0)"; })
                    .attr("fill", "Clear");


  chart.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + (height2 + 40) + ")")
        .call(xAxis)
        .selectAll("text").attr("transform", function(d) {
          return "rotate(-90) translate(-" + (this.getBBox().width/2 + 10) + ", -" +
              (this.getBBox().height/2 + 8) + ")";});

  chart.append("g")
      .attr("class", "y axis")
      .call(yAxis)
    .append("text")
      .attr("transform", "rotate(-90) translate(-20, -60)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("Likes");

  city.selectAll(".bar")
        .data(function(d) { return d.individualLikes; })
      .enter().append("rect")
        // .attr("id", function (d) { return d.name })
        .attr("class", "bar")
        // .attr("x", function(d, i) { return x(d.name); })
        .attr("width", x.rangeBand())
        .attr("y", function(d, i) { return y(d.y1) + 0; })
        .attr("height", function(d, i) { return y(d.y0) - y(d.y1); })
        .style("fill", function(d, i) { return color(i)})
        .on("mouseover", barOver)
        .on("mouseout", barOut);

  function barOver (d) {
    this.style.opacity= 0.2;
    var coords = d3.mouse(this.parentNode.parentNode);
    chart.append("image")
        .attr("xlink:href", d.image)
        .attr("width", 100)
        .attr("height", 100)
        .attr("x", coords[0] + 5)
        .attr("y", coords[1] + 5);
  }
  function barOut (d) {
    this.style.opacity= 1.0;
    chart.select("image").remove();
  }

  var title = chart.append("g")
                .append("text")
                .attr("class", "title")
                .text("Total Likes per City")
                .attr("transform", function(d) {
                    return "translate(" + (width/2 - this.getBBox().width/2 - 50) + ", -" +
                        (this.getBBox().height/2 + 5) + ")";});

});