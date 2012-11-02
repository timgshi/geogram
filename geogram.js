var width = 960,
    height = 500,

    margin2 = {top: 550, right: 10, bottom: 20, left: 40},
    height2 = 500 - margin2.top - margin2.bottom,
    centered;

var x = d3.scale.ordinal()
    .rangeRoundBands([0, width], .1);

var y = d3.scale.linear()
    .range([height2, 0]);

var projection = d3.geo.albersUsa()
    .scale(width)
    .translate([0, 0]);

var path = d3.geo.path()
    .projection(projection);

var svg = d3.select("svg")
    .attr("width", width)
    .attr("height", height);

var map = svg.append("g")
    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")")
  .append("g")
    .attr("id", "states");

var chart = svg.append("g")
  .attr("transform", "translate(" + margin2.left + "," + margin2.top + ")");;    

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
                      //var projection = path.projection();
                      var coords = projection([d.lng, d.lat]);
                      console.log(coords[0])
                       return coords[0];
                    })
        .attr("y", function(d) {
                      //var projection = projection();
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
    svg.append("image")
        .attr("xlink:href", d.image_thumb)
        .attr("width", 100)
        .attr("height", 100)
        .attr("x", coords[0])
        .attr("y", coords[1]);
  }

  function mouseout (d) {
    svg.select("image").remove();
  }

  function citymouseover (d) {
    console.log(d);
    svg.select("#"+d.name).style("fill", "red");
  }

  var likes = [];
  json.cities.forEach(function (city) {
    var likeCount = 0;
    city.media.forEach(function (media) {
      likeCount += media.likes;
    });
    var name = city.name;
    // likes.push({key:'city.name', value:likeCount});
    var dict = {'name':city.name, 'likes':likeCount};
    likes.push(dict);
  });
  console.log(likes);

  x.domain(json.cities.map(function(d) { return d.name; }));
  y.domain([0, d3.max(likes, function(d) { return d.likes; })]);

  chart.selectAll(".bar")
        .data(likes)
      .enter().append("rect")
        .attr("id", function (d) { return d.name })
        .attr("class", "bar")
        .attr("x", function(d, i) { return x(d.name); })
        .attr("width", x.rangeBand())
        .attr("y", function(d, i) { return height2+40 - d.likes; })
        .attr("height", function(d, i) { return d.likes; });

});