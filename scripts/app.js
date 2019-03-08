// refer to
// https://github.com/idekerlab/cyjs-export-full/blob/master/app/scripts/controllers/main.js

"use strict";

var app = angular.module("cyViewerApp", [
  "ngCookies",
  "ngResource",
  "ngSanitize",
  "ngRoute",
  "ngAnimate",
  "ui.bootstrap",
  "angular-underscore",
  "colorpicker.module",
  "angularSpinner",
]);

app.controller("cyCtrl", function($scope, $http) {

  // Name of network tag in the DOM
  var NETWORK_SECTION_ID = '#network';
  var removedEles = {};

  // Application global objects
  $scope.networks = networks;
  $scope.toolbarState = { show: !0 };
  $scope.overlayState = { show: !0 };
  $scope.networkNames = Object.keys(networks);
  $scope.currentNetworkName = $scope.networkNames[0];
  $scope.LAYOUTS = ["preset", "cola", "random", "grid", "circle", "concentric", "breadthfirst", "cose"];
  $scope.currentLayout = "circle";

  $http({
    method: 'GET',
    url: '/sbc'
  }).then(function successCallback(response) {
      console.log("success: ", response);
    }, function errorCallback(response) {
      console.log("error: ", response);
  });

  updateLayout();
  refreshNetwork();
/*
  var cy = cytoscape({
    container: document.getElementById('network'),
    elements: [
            { data: { id: 'a' } },
            { data: { id: 'b' } },
            { data: { id: 'ab', source: 'a', target: 'b' }
    }],
    style: [{
        selector: 'node',
        style: {
            shape: 'square',
            'background-color': 'green',
            label: 'data(id)'
        }
    }]
  });
  cy.layout({name: 'circle'}).run();
*/
  $scope.switchNetwork = function() {   
    updateLayout();
    refreshNetwork();   
  }
  $scope.switchLayout = function() {
    console.log("switchLayout to", $scope.currentLayout);
    var options = {
      name: $scope.currentLayout
    };
    //$scope.cy.layout(options).run();
    $scope.cy.layout(options);
  }

  $scope.toggleToolbar = function() {
    $scope.toolbarState.show = !$scope.toolbarState.show
  }
  $scope.toggleOverlay = function() {
    $scope.overlayState.show = !$scope.overlayState.show
  }
  $scope.fit = function() {
    $scope.cy.fit();
  }

  /////////////////////////////////////////////////////////////////////////////
  function refreshNetwork() {
    var network = $scope.networks[$scope.currentNetworkName];
    var style = styles[0];
    //var cy = cytoscape({
    //    container: $(NETWORK_SECTION_ID),
    angular.element(NETWORK_SECTION_ID).cytoscape({
        layout: {
            name: $scope.currentLayout,
            //padding: 1,
        },
        boxSelectionEnabled: !0,
        ready: function() {
            console.log(this);
            $scope.cy = this;
            //this.add(network.elements);
            this.load(network.elements);
            var o = e("default", style);
            null === o && (o = style), this.style().fromJson(o.style).update();
 
            // setEventListeners
            this.nodes().on('click', callbackNodeClick);
        }
    });
    //$scope.cy.layout({name: $scope.currentLayout}).run();
    //$scope.cy.nodes().on('click', callbackNodeClick);
  }

  function updateLayout(network) {
    var network = $scope.networks[$scope.currentNetworkName];
    if (!!network.data["layout"] && network.data["layout"] != "") {
      $scope.currentLayout = network.data["layout"];
    } else {
      $scope.currentLayout = "circle";
    }
  }

  function e(e, n) {
      for (var t = n.length, o = 0; t >= o; o++) {
          var s = n[o].title;
          if (s === e) return n[o]
      }
      return null
  }

  function callbackNodeClick(e) {
    console.log(e);
    var cy = $scope.cy;
    var clickedNode = e.cyTarget;
    var nodeId = clickedNode.id();
    console.log(clickedNode);

    // double click
    var nowTimeStamp = e.timeStamp;
    var lastTimeStamp = removedEles[nodeId] ? removedEles[nodeId]["timeStamp"] : 0;
    if (!removedEles[nodeId]) {
      removedEles[nodeId] = {};
    }
    removedEles[nodeId]["timeStamp"] = nowTimeStamp;
    if (lastTimeStamp == 0 || (nowTimeStamp - lastTimeStamp) > 300) {
      console.log(nowTimeStamp, lastTimeStamp);
      return;
    }

    // restore nodes and edges
    if (removedEles[nodeId] && removedEles[nodeId]["nodes"]) {
      console.log("restore child nodes for " + nodeId);
      removedEles[nodeId]["nodes"].restore();
      removedEles[nodeId]["edges"].restore();
      clickedNode.style("color", removedEles[nodeId]["color"]);
      removedEles[nodeId] = null;
      return;
    }

    // remove all connected edges and orphan nodes
    console.log("remove child nodes for " + nodeId);
    //console.log(clickedNode.isNode());
    //console.log(clickedNode.id());
    //console.log(clickedNode.data());
    //console.log(clickedNode.isParent());
    
    var edges = cy.elements('edge[source="' + nodeId + '"]');
    console.log(edges);
    var childNodes = edges.targets();
    console.log(childNodes);

    if (childNodes.length == 0) {
      console.log("End node!");
      return;
    }

    for (var i = 0; i < childNodes.length; i++) {
      var childNode = childNodes[i];
      var childEdges = cy.elements('edge[source="' + childNode.id() + '"]');
      if (childEdges.length > 0) {
        console.log("child node also has child node! CAN NOT be removed!");
        return;
      }
    }

    edges.remove();            
    var orphanNodes = childNodes.filter(function( i ){
      //console.log("filter nodes");
      //console.log(childNodes[i]);
      var node = childNodes[i];
      var edges = cy.elements('edge[target="' + node.id() + '"]');
      for (var i = 0; i < edges.length; i++) {
        if (!edges[i].removed()) {
          return false;
        }
      }
      return true; // all edges are removed
    });

    orphanNodes.remove();
    removedEles[nodeId]["nodes"] = childNodes;
    removedEles[nodeId]["edges"] = edges;
    
    // update removed style
    removedEles[nodeId]["color"] = clickedNode.style("color");
    clickedNode.style("color", "rgb(255, 0, 0)");
  }
});

