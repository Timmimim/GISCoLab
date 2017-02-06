(function() {

    angular
        .module('giscolab')
        .controller('currentCtrl', currentCtrl);
    currentCtrl.$inject = ['$location', 'meanData', 'userService', '$scope', 'leafletDrawEvents', 'projectService', '$rootScope'];
    function currentCtrl($location, meanData, userService, $scope, leafletDrawEvents, projectService, $rootScope) {
        console.log("current Controller is running!!!");

       var vm = this;

        vm.project = {};

        var pid = projectService.getID();

        if(pid !== undefined) {
            meanData.getProject(pid)
                .success(function (data) {
                    vm.project = data;
                    var proKey = vm.project.uniqueKey;
                    $rootScope.uniKey = proKey;
                    loadnewjson();
                })
                .error(function (e) {
                    console.log(e);
                });
        } else {
        alert("kein Projekt ausgewählt. Bitte erst eins auswählen!");
        };

        var loadnewjson = function () {
            $.ajax({
                url: "api/loadTreedata/" + $rootScope.uniKey,
                type: "Get",
                success: function (data) {
                    var old = JSON.stringify(data).replace(/children/g, "data"); //convert to JSON string
                    var newjson = JSON.parse(old); //convert back to array
                    console.log(newjson);

                    $rootScope.newjson = newjson;
                },
                error: function (msg) { alert(msg); }
            });
        };

        /* start leaflet */
        var drawnItems = new L.FeatureGroup();
        angular.extend(vm, {
            center: {
                lat: 51.964711,
                lng: 7.628496,
                zoom: 12
            },
            layers: {
                baselayers: {
                    osm: {
                        name: 'OpenStreetMap',
                        url: 'http://{s}.tile.osm.org/{z}/{x}/{y}.png',
                        type: 'xyz'
                    },
                    hotosm: {
                        name: 'Humanitarian OSM',
                        url: 'http://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',
                        type: 'xyz'
                    }
                },
                overlays:{

                }
            },

            drawOptions: {
                position: "bottomright",
                draw: {
                    polyline: false,
                    polygon: {
                        metric: false,
                        showArea: true,
                        drawError: {
                            color: '#b00b00',
                            timeout: 1000
                        },
                        shapeOptions: {
                            color: 'blue'
                        }
                    },
                    circle: false,
                    marker: false
                },
                edit: {
                    featureGroup: drawnItems,
                    remove: true
                }
            }
        });

        var handle = {
            created: function(e,leafletEvent, leafletObject, model, modelName) {

                var layerJSON = leafletEvent.layer.toGeoJSON();
                console.log(layerJSON);

                drawnItems.addLayer(leafletEvent.layer.bindPopup(
                    "top left corner: " + layerJSON.geometry.coordinates["0"]["0"].toString() +"\n" +
                    "top right corner: " + layerJSON.geometry.coordinates["0"]["1"].toString() +"\n" +
                    "bottom left corner: " + layerJSON.geometry.coordinates["0"]["2"].toString() +"\n" +
                    "bottom right corner: " + layerJSON.geometry.coordinates["0"]["3"].toString()
                    )
                );
            },
            edited: function(arg) {},
            deleted: function(arg) {
                var layers;
                layers = arg.layers;
                drawnItems.removeLayer(layer);
            },
            drawstart: function(arg) {},
            drawstop: function(arg) {},
            editstart: function(arg) {},
            editstop: function(arg) {},
            deletestart: function(arg) {},
            deletestop: function(arg) {}
        };
        var drawEvents = leafletDrawEvents.getAvailableEvents();
        drawEvents.forEach(function(eventName){
            $scope.$on('leafletDirectiveDraw.' + eventName, function(e, payload) {
                //{leafletEvent, leafletObject, model, modelName} = payload
                var leafletEvent, leafletObject, model, modelName; //destructuring not supported by chrome yet :(
                leafletEvent = payload.leafletEvent, leafletObject = payload.leafletObject, model = payload.model,
                    modelName = payload.modelName;
                handle[eventName.replace('draw:','')](e,leafletEvent, leafletObject, model, modelName);
            });
        });

        $scope.download = function(key){
            window.open('/api/download/'+key);
        };

        // Treeview

        setTimeout(function () {
            console.log($rootScope.uniKey);
            console.log($rootScope.newjson);
        }, 500);


        var tree = new webix.ui({
            container:"treebox",
            id: "myTree",
            view:"tree",
            select:"true",
            on: {"itemClick": function () {alert("item has just been clicked");}},
            template:"{common.icon()} {common.folder()} <span onclick='treeData();'>#name#<span>",
            data: $rootScope.newjson
        });

        treeData = function(){
            var id = tree.getSelectedId();
            var item = tree.getItem(id);
            var path = item.path;
            var itemname = item.name;
            var ending = item.extension;
            if(ending == ".txt"){
                var txtstring = "/txtFiles/";
            }
            else
                if(ending == '.r'){
                var txtstring = "/rScripts/";
            }
            else
                if(ending == '.png'){
                var txtstring = "/Layers/";
            }

            console.log(txtstring);
            console.log(id);
            console.log(item);
            console.log(path);
            console.log(ending);
            if(ending !== undefined){
                $.ajax({
                    type: "GET",
                    url: "api/loadTreedata2/" + $rootScope.uniKey +  txtstring + itemname,
                    success: function (data) {
                        if(ending == '.r'){
                            $('#codearea').html(data);
                            console.log(data);
                            itemname = itemname.replace(".R", "");
                            $('#fileName').html(itemname);
                        }else
                            if(ending == '.txt'){
                                $('#txtview').html(data);
                                console.log(data);
                                itemname = itemname.replace(".txt", "");
                                $('#noteFName').html(itemname);
                            }
                            else
                                if(ending == '.png'){
                                // vm.layers.overlays.push({name : {name : itemname , data : data , type: "image/png"}})
                                vm.layers.overlays[itemname] =  {name: itemname, type:'xyz', url: "api/loadTreedata2/" + $rootScope.uniKey +  txtstring + itemname, layerParams: {
                                    format: 'image/png',
                                    transparent: true
                                }};
                                console.log(vm.layers);
                            }
                    }
                })
            }
        };

        /*
         xyz,geoJSON,geoJSONShape,geoJSONAwesomeMarker,geoJSONVectorMarker,cartodbTiles,cartodbUTFGrid,cartodbInteractive,wms,wmts,group,featureGroup,markercluster,imageOverlay,iip,custom,cartodb,ags,agsBase,agsClustered,agsDynamic,agsFeature,agsHeatmap,agsImage,agsTiled,bing,china,google,heat,here,mapbox,mapboxGL,utfGrid,webGLHeatmap,wfs,yandex
        */

        $scope.buttonCodeToggle = function(){
            angular.element( document.querySelector('#code')).addClass('active');
            angular.element( document.querySelector('#otherdata')).removeClass('active');
            angular.element( document.querySelector('#txt')).removeClass('active');
            angular.element( document.querySelector('#options')).removeClass('active');
        };
        $scope.buttonTreeToggle = function(){
            angular.element( document.querySelector('#code')).removeClass('active');
            angular.element( document.querySelector('#otherdata')).addClass('active');
            angular.element( document.querySelector('#txt')).removeClass('active');
            angular.element( document.querySelector('#options')).removeClass('active');
        };
        $scope.buttonTxtToggle = function(){
            angular.element( document.querySelector('#code')).removeClass('active');
            angular.element( document.querySelector('#otherdata')).removeClass('active');
            angular.element( document.querySelector('#txt')).addClass('active');
            angular.element( document.querySelector('#options')).removeClass('active');
        }
        $scope.buttonOptionsToggle = function(){
            angular.element( document.querySelector('#code')).removeClass('active');
            angular.element( document.querySelector('#otherdata')).removeClass('active');
            angular.element( document.querySelector('#txt')).removeClass('active');
            angular.element( document.querySelector('#options')).addClass('active');

        }

    }
})();