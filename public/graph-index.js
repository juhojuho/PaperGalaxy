var w = 1000;   // Width for SVG container
var h = 600;    // Height for SVG container 
var radius = 5; // Radius of each circle for nodes
var linkDistance = 50; // length of each edge
var colors = d3.scale.category10(); // A categorical scheme with 10 colors.
var database = firebase.database(); // Get a reference to the database service
var databaseRef = database.ref();   // Get a reference to the database service

// create SVG container to hold the visualization to graph-index in index.html
var svg = d3.select("#graph-index").append("svg").attr({
  "width": w,
  "height": h
});

var not_first = false;
// Read data from a Database. 
// Callback will be triggered for the initial data and again whenever the data changes.
databaseRef.on('value', function (snapshot) {

  // If SVG container has already been added, remove and create it again.
  if (not_first) {
    console.log("not_first");
    d3.select("svg").remove();
    svg = d3.select("#graph-index").append("svg").attr({
      "width": w,
      "height": h
    });
  }

  var nodes = []; // List of nodes 
  var edges = []; // List of edges
  var data = snapshot.val(); // Data of the whole graph
  
  // Iterate through data['nodes'] and push information of each node into nodes
  data['nodes'].forEach(function (item, index, array) {
    nodes.push({
      'name': item,
      'author': data['authors'][index]
    });
  });

  // Iterate through data['connections'] and push information of each edge into edges 
  for (var key in data['connections']) {
    var inserted = false;
    var item = data['connections'][key];

    // If an edge with same source and target has already been pushed to edges,
    // just add additinal info to the corresponding edge.
    edges.forEach(function (value, index, array) {

      // Two symmetrical cases with source and target of connection - case 1
      if (value.source == item['paper1'] && value.target == item['paper2']) {
        inserted = true;
        value.info.push({
          'label': item['relationship'],
          'description': item['description'],
          'name': item['name'],
          'uid': item['uid'],
          'plus': item['plus'],
          'minus': item['minus'],
          'key': key
        });
      }

      // Two symmetrical cases with source and target of connection - case 2
      if (value.source == item['paper2'] && value.target == item['paper1']) {
        inserted = true;
        value.info.push({
          'label': item['relationship'],
          'description': item['description'],
          'name': item['name'],
          'uid': item['uid'],
          'plus': item['plus'],
          'minus': item['minus'],
          'key': key
        });
      }
    });

    // If the information of corresponding edge has not been yet pushed to edges yet,
    // push information of each edge into edges.
    if (!inserted) {
      edges.push({
        'source': item['paper1'],
        'target': item['paper2'],
        'info': [{
          'label': item['relationship'],
          'description': item['description'],
          'name': item['name'],
          'uid': item['uid'],
          'plus': item['plus'],
          'minus': item['minus'],
          'key': key

        }],
      });
    }
  }

  // Dataset of entire graph including nodes and edges
  var dataset = {
    'nodes': nodes,
    'edges': edges
  };

  //create a force layout object and define its properties.
  var force = d3.layout.force()
    .size([w, h])
    .linkDistance([linkDistance])
    .charge([-100]);

  // Now let's bind the nodes and edges to the SVG container.
  // We begin with the edges. The order here is important, 
  // because we want the nodes to appear "on top of" the edges.

  // Bind each edge to line
  var edges = svg.selectAll("line")
    .data(dataset.edges)          // For each edge in dataset.edges
    .enter().append("line")       // Append line
    .attr("class", "dim")         // With class = "dim"
    .attr("id", function (d, i) { // With id =  "edgei"
      return 'edge' + i
    })
    .style("stroke", "#ccc");     

  // Bind each node to circle
  var nodes = svg.selectAll("circle")
    .data(dataset.nodes)            // For each node in dataset.nodes
    .enter().append("circle")       // Append circle
    .attr("r", function (d) { return radius - .75; }) // With cirtain radius
    .attr("class", "dim")           // With class "dim"
    .on('mouseover', function (d) { // When mouse-over, change cursor to pointer and show text 
      document.body.style.cursor = 'pointer';
      d3.select(d3.selectAll("text")[0][d.index]).style("visibility", "visible");
    })
    .on('mouseout', function (d) {  // When mouse-out, change cursor to default and hide text
      document.body.style.cursor = 'default';
      d3.select(d3.selectAll("text")[0][d.index]).style("visibility", "hidden");
    })
    .on('click', function (d, i) {  // When Clicked, Show result.html page with corresponding id
      window.location = 'result.html?pid=' + i;
    })
    .style("fill", function (d, i) {  // Fill circles with colors(i)
      return colors(i);
    })
    .call(force.drag); 

  var nodelabels = svg.selectAll(".nodelabel")
    .data(dataset.nodes)
    .enter()
    .append("text")
    .text(function (d) {
      return d.name;
    })
    .style("text-anchor", "middle")
    .style("font-size", 12)
    .attr({
      'visibility': function (d) { return "hidden" }
    });

  // Everything is set up now so it's time to turn
  // things over to the force layout. Here we go.
  force
    .nodes(dataset.nodes)
    .links(dataset.edges)
    .on("tick", tick)
    .start();

  // This function is executed when force layout calculations are concluded. 
  // The layout will have set various properties in our nodes and edges objects 
  // that we can use to position them within the SVG container.
  function tick() {

    // First let's reposition the nodes. As the force layout runs, 
    // it updates the `x` and `y` properties that define where the node should be centered.
    // To move the node, we set the appropriate SVG
    // attributes to their new values. We also have to
    // give the node a non-zero radius so that it's visible
    // in the container.

    nodes.attr("cx", function (d) {
        return d.x = Math.max(radius + 200, Math.min(w - radius - 200, d.x));
      })
      .attr("cy", function (d) {
          return d.y = Math.max(radius + 10, Math.min(h - radius, d.y));
      });

    edges.attr({
      "x1": function (d) {return d.source.x;},
      "y1": function (d) {return d.source.y;},
      "x2": function (d) {return d.target.x;},
      "y2": function (d) {return d.target.y;}
    });

    nodelabels
      .attr("x", function (d) {return d.x;})
      .attr("y", function (d) {return d.y - 10;
    });
  }

  // end of the loop
  not_first = true;
});

