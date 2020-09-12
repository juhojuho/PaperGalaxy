var w = 1000;       // Width for SVG container
var h = 600;        // Height for SVG container 
var radius = 10;    // Radius of each circle for nodes
var linkDistance = 200;    // length of each edge
var colors = d3.scale.category10(); // A categorical scheme with 10 colors.
var database = firebase.database(); // Get a reference to the database service
var databaseRef = database.ref();

// create SVG container to hold the visualization to graph in result.html
var svg = d3.select("#graph").append("svg").attr({
  "width": w,
  "height": h
});

var not_first = false;
// 
databaseRef.on('value', function (snapshot) {

  // If SVG container has already been added, remove and create it again.
  if (not_first) {
    d3.select("svg").remove();
    svg = d3.select("#graph").append("svg").attr({
      "width": w,
      "height": h
    });
  }

  var nodes = []; // List of nodes 
  var edges = []; // List of edges 
  var data = snapshot.val();  // Data of the whole graph

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

  var filteredNodes = []; // List of filtered nodes that are relevant to result
  var filteredEdges = []; // List of filtered edges that are relevant to result
  var searchResult = document.getElementById('search-result');
  var result = getJsonFromUrl();  // 

  // Push the 
  filteredNodes.push({
    'orig_idx': Number(result.pid),
    'name': nodes[Number(result.pid)].name,
    'author': nodes[Number(result.pid)].author,
  });

  var i = 1;
  // if one of the 
  edges.forEach(function (value) {
    if (value['source'] == result.pid) {
      filteredEdges.push({
        source: 0,
        target: i,
        info: value.info
      });
      filteredNodes.push({
        'orig_idx': value.target,
        'name': nodes[Number(value['target'])].name,
        'author': nodes[Number(value['target'])].author
      });
      i++;
    } else if (value['target'] == result.pid) {
      filteredEdges.push({
        source: i,
        target: 0,
        info: value.info
      });
      filteredNodes.push({
        'orig_idx': value.source,
        'name': nodes[Number(value['source'])].name,
        'author': nodes[Number(value['source'])].author
      });
      i++;
    }
  });

  // Dataset of graph including filtered nodes and filtered edges
  var dataset = {
    'nodes': filteredNodes,
    'edges': filteredEdges
  };

  var paper1 = document.getElementById('paper1');
  var paper2 = document.getElementById('paper2');

  for (var i = 0; i < nodes.length; i++) {
    paper1.insertAdjacentHTML('beforeend', '<option value="' + i + '">' + nodes[i].name + '</option>');
    paper2.insertAdjacentHTML('beforeend', '<option value="' + i + '">' + nodes[i].name + '</option>');
  }

  var force = d3.layout.force()
    .size([w, h])
    .linkDistance([linkDistance])
    .charge([-700]);

  // Bind each edge to line
  var edges = svg.selectAll("line")
    .data(dataset.edges)          // For each edge in dataset.edges
    .enter().append("line")       // Append line
    .attr("class", "dim")         // With class = "dim"
    .attr("id", function (d, i) { // With id =  "edgei"
      return 'edge' + i
    })
    .style("stroke-width", 3)
    .style("stroke", function (d) { 

      // Give diffrent color to edges based on the number of info it contains
      // Darker if the number is higher
      if (d.info.length < 3) {      
        return "#ddd";
      } else if (d.info.length < 6) {
        return "#aaa";
      } else if (d.info.length < 9) {
        return "#888";
      } else {
        return "#444";
      }
    })
    .on('mouseenter', function (d) {  // When mouse-enter, change cursor to pointer
      document.body.style.cursor = 'pointer';
    })
    .on('mouseleave', function (d) {  // When mouse-leave, change cursor to default
      document.body.style.cursor = 'default';
    })
    .on('click', function (d, i) {    // When clicked

      if (document.getElementById('tableContent') != null) {

        document.getElementById('tableConnection').removeChild(document.getElementById('tableContent'));
      }
      var random = Math.random().toString().replace('.', 'a');
      tableContent = '';
      d.info.forEach(function (value, index, array) {
        tableContent += '<tr class="striped--light-gray">';
        if (value.label == 0) {
          tableContent += '<td class="pv2 ph3">No Response</td>';
        } else if (value.label == 1) {
          tableContent += '<td class="pv2 ph3">Similar Motivation</td>';
        } else if (value.label == 2) {
          tableContent += '<td class="pv2 ph3">Similar Technique</td>';
        } else if (value.label == 3) {
          tableContent += '<td class="pv2 ph3">Similar Workflow</td>';
        }
        tableContent +=
          '<td class="pv2 ph3">' + value.description + '</td>' +
          '<td id="plus' + random + index + '" class="pv2 ph3 green grow">+' + value.plus + '</td>' +
          '<td id="minus' + random + index + '" class="pv2 ph3 dark-red grow">-' + value.minus + '</td>' +
          '</tr>';
      });
      document.getElementById('tableConnection').insertAdjacentHTML('beforeend',
        '<table id="tableContent" class="collapse ba br2 b--black-10 pv2 ph3">' +
        '<tbody>' +
        '<tr class="striped--light-gray">' +
        '<th class="pv2 ph3 tl f6 fw6 ttu">Relation</th>' +
        '<th class="pv2 ph3 tl f6 fw6 ttu">Description</th>' +
        '<th class="pv2 ph3 tl f6 fw6 ttu">Plus</th>' +
        '<th class="pv2 ph3 tl f6 fw6 ttu">Minus</th>' +
        '</tr>' +
        tableContent +
        '</tbody>' +
        '</table>'
      );
      d.info.forEach(function (value, index, array) {
        var user = firebase.auth().currentUser;
        var currentUserUID = firebase.auth().currentUser.uid;
        document.getElementById('plus' + random + index).addEventListener('click', function () {
          if (user) {
            var pushed = false;
            database.ref('connections/' + value.key + '/plusUsers').once('value', function (snapshot) {
              var data = snapshot.val();
              for (var key in data) {
                if (data[key].uid == currentUserUID) {
                  pushed = true;
                }
              }
            });
            if (!pushed) {
              var updates = {};
              updates['/connections/' + value.key + '/plus'] = value.plus + 1;
              database.ref().update(updates);
              document.getElementById('plus' + random + index).innerText = '+' + (value.plus + 1);
              var score;
              database.ref('users/' + value.uid + '/score').once('value', function (snapshot) {
                if (snapshot.val() == undefined) {
                  score = 0;
                } else {
                  score = snapshot.val();
                }
              });
              updates = {};
              updates['users/' + value.uid + '/score'] = score + 10;
              updates['/users/' + value.uid + '/name'] = value.name;
              database.ref().update(updates);
              database.ref('connections/' + value.key + '/plusUsers').push().set({
                uid: currentUserUID
              })
            }
          } else {
            alert("Please Sign-Up");
          }
        });

        document.getElementById('minus' + random + index).addEventListener('click', function () {
          if (user) {
            var pushed = false;
            database.ref('connections/' + value.key + '/minusUsers').once('value', function (snapshot) {
              var data = snapshot.val();
              for (var key in data) {
                if (data[key].uid == currentUserUID) {
                  pushed = true;
                }
              }
            });
            if (!pushed) {
              var updates = {};
              updates['/connections/' + value.key + '/minus'] = value.minus + 1;
              database.ref().update(updates);
              document.getElementById('minus' + random + index).innerText = '-' + (value.minus + 1);
              var score;
              database.ref('users/' + value.uid + '/score').once('value', function (snapshot) {
                if (snapshot.val() == undefined) {
                  score = 0;
                } else {
                  score = snapshot.val();
                }
              });
              updates = {};
              updates['users/' + value.uid + '/score'] = score - 10;
              updates['/users/' + value.uid + '/name'] = value.name;
              database.ref().update(updates);
              database.ref('connections/' + value.key + '/minusUsers').push().set({
                uid: currentUserUID
              })
            }
          } else {
            alert("Please Sign-Up");
          }
        });

      })
      document.getElementById("modal-show-connection").classList.remove('dn');
    });
  
  // Bind each node to circle
  var nodes = svg.selectAll("circle")
    .data(dataset.nodes)        // For each node in dataset.nodes
    .enter().append("circle")   // Append circle
    .attr("r", function (d) {   // With cirtain radius as following
      if (d.orig_idx == result.pid) { //if the node is the searched node
        return 15;
      } else {                        // else if the node is relevant to searched node
        return radius - .75;
      }
    })
    .attr("class", "dim")       // With class "dim"
    .on('mouseover', function (d) {
      document.body.style.cursor = 'pointer';
      d3.select(d3.selectAll("text")[0][d.index]).style("visibility", "visible");
    })
    .on('mouseout', function (d) {
      document.body.style.cursor = 'default';
      if (d.orig_idx != result.pid) {
        d3.select(d3.selectAll("text")[0][d.index]).style("visibility", "hidden");
      }
    })
    .on('click', function (d, i) {
      if (document.getElementById('paperTitle') != null) {
        document.getElementById('modal-show-paper-content').removeChild(document.getElementById('paperTitle'));
      }
      if (document.getElementById('paperAuthor') != null) {
        document.getElementById('modal-show-paper-content').removeChild(document.getElementById('paperAuthor'));
      }
      document.getElementById("paperInfoTitle").insertAdjacentHTML('afterend', '<p id="paperTitle">' + d.name + '</p>');
      document.getElementById("paperInfoAuthor").insertAdjacentHTML('afterend', '<p id="paperAuthor">' + d.author + '</p>');
      document.getElementById("modal-show-paper").classList.remove('dn');
    })
    .style("fill", function (d, i) {
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
      'visibility': function (d) {
        if (d.orig_idx == result.pid) {
          return "visible"
        } else {
          return "hidden"
        }
      }
    });



  var edgelabels = svg.selectAll(".edgelabel")
    .data(dataset.edges)
    .enter()
    .append('text')
    .style("pointer-events", "none")
    .attr({
      'class': 'edgelabel',
      'id': function (d, i) {
        return 'edgelabel' + i
      },
      'dx': 80,
      'dy': 0,
      'font-size': 10,
      'fill': '#aaa'
    });

  edgelabels.append('textPath')
    .attr('xlink:href', function (d, i) {
      return '#edgepath' + i
    })
    .style("pointer-events", "none")
    .text(function (d) {
      return d.label
    });

  force
    .nodes(dataset.nodes)
    .links(dataset.edges)
    .on("tick", tick)
    .start();


  svg.append('defs').append('marker')
    .attr({
      'id': 'arrowhead',
      'viewBox': '-0 -5 10 10',
      'refX': 25,
      'refY': 0,
      //'markerUnits':'strokeWidth',
      'orient': 'auto',
      'markerWidth': 10,
      'markerHeight': 10,
      'xoverflow': 'visible'
    })
    .append('svg:path')
    .attr('d', 'M 0,-5 L 10 ,0 L 0,5')
    .attr('fill', '#ccc')
    .attr('stroke', '#ccc');


  function tick() {
    nodes.attr("cx", function (d) {
        if (d.orig_idx == result.pid) {
          return d.x = w / 2;
        } else {
          return d.x = Math.max(radius + 200, Math.min(w - radius - 200, d.x));
        }
      })
      .attr("cy", function (d) {
        if (d.orig_idx == result.pid) {
          return d.y = h / 2;
        } else {
          return d.y = Math.max(radius + 10, Math.min(h - radius, d.y));
        }
      });


    edges.attr({
      "x1": function (d) {
        return d.source.x;
      },
      "y1": function (d) {
        return d.source.y;
      },
      "x2": function (d) {
        return d.target.x;
      },
      "y2": function (d) {
        return d.target.y;
      }
    });


    nodelabels.attr("x", function (d) {
        return d.x;
      })
      .attr("y", function (d) {
        if (d.orig_idx == result.pid) {
          return d.y - 20;
        } else {
          return d.y - 10;
        }
      });

    edgelabels.attr('transform', function (d, i) {
      if (d.target.x < d.source.x) {
        bbox = this.getBBox();
        rx = bbox.x + bbox.width / 2;
        ry = bbox.y + bbox.height / 2;
        return 'rotate(180 ' + rx + ' ' + ry + ')';
      } else {
        return 'rotate(0)';
      }
    });

  }

  not_first = true;

});



function getJsonFromUrl() {
  var query = location.search.substr(1);
  var result = {};
  query.split("&").forEach(function (part) {
    var item = part.split("=");
    result[item[0]] = decodeURIComponent(item[1]);
  });
  return result;
}