// Code goes here


app = angular.module('abas-web', ['ui.bootstrap'])

app.controller('DocumentBrowser', [
        '$scope','$http', function($scope, $http) {
            $scope.tree_data = []
            $scope.expanding_property =  {
                field: "label",
                displayName: "Name",
                width: "70%"
            };
            
              /*  $(document).mousedown(function (e)
									{
									    var container = $("#arcTreeID");
									    if (!container.is(e.target) // if the target of the click isn't the container...
									        && container.has(e.target).length === 0) // ... nor a descendant of the container
									    {
									        container.hide();
									    }
									});*/
            $scope.col_defs = [];
            $scope.init = function(property_id) {
                var source_url = 'data.json';
                $http.get(source_url).success(function(data, status, headers, config) {
                angular.forEach(data.orgUnits[0].architectures,function(row){ 
                  
                    $scope.col_defs.push({
                        field: row.name,
                        displayName: row.name,
                        width: "50%"
                    })
                });
                
                
                $scope.tree_data = data.orgUnits;
                });
            };
            $scope.getdata= function(){
                var expand_child_org_units;
                $scope.tree_data_copy = [];
                $scope.selectedArchitectureList = [];
                console.log($scope.tree_data);
                angular.copy($scope.tree_data,$scope.tree_data_copy)
                console.log($scope.tree_data_copy)
                expand_child_org_units = function (b) {
                      var child, _i, _len, _ref, _results;
                      if (b.children != null) {
                          _ref = b.children;
                          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                              child = _ref[_i];
                              if(child.itemSelected){
                                angular.forEach(child.architectures,function(architectureKey,architectureValue){
                                  var architectureItem = ($scope.selectedArchitectureList).filter(function(item, idx) {
                						         return item.id == architectureKey.id;
                                  })
                                  console.log(architectureItem);
                                  if(!architectureItem.length){
                                    if(architectureKey.selected){
                                      $scope.selectedArchitectureList.push(architectureKey);
                                    }
                                  }
                                  else{
                                    architectureKey.productFamilys = architectureItem.productFamilys;
                                    architectureKey.showAll = false;
                                  }
                                })
                              }
                              expand_child_org_units(child)
                          }
                      }
                   };
                   
                angular.forEach($scope.tree_data_copy,function(key,value){
                  if(key.itemSelected){
                    angular.forEach(key.architectures,function(architectureKey,architectureValue){
                     if(architectureKey.selected){
                        $scope.selectedArchitectureList.push(architectureKey);
                      }
                    })
                  }
                  expand_child_org_units(key);
                })
            }
        }
    ]);
    
app.directive('treeGrid', ['$timeout','$http',
        function ($timeout,$http) {
            return {
                restrict: 'E',
                //templateUrl:'tree-grid-template.html',
                //template:"<div><table class=\"table table-bordered table-striped tree-grid\"><thead class=\"text-primary\"><tr><th>{{expandingProperty.displayName || expandingProperty.field || expandingProperty}}</th><th ng-repeat=\"col in colDefinitions\">{{col.displayName || col.field}}</th></tr></thead><tbody><tr ng-repeat=\"row in tree_rows | filter:{visible:true} track by row.branch.uid\" ng-class=\"'level-' + {{ row.level }} + (row.branch.selected ? ' active':'')\" class=\"tree-grid-row\"><td class=\"text-primary\"><a ng-click=\"user_clicks_branch(row.branch)\"><i ng-class=\"row.tree_icon\" ng-click=\"row.branch.expanded = !row.branch.expanded\" class=\"indented tree-icon\"></i></a><span class=\"indented tree-label\">{{row.branch[expandingProperty.field] || row.branch[expandingProperty]}}</span></td><td ng-repeat=\"col in colDefinitions\">{{row.branch[col.field]}}</td></tr></tbody><table></div>",
                template: "<div style=\"font-size:12px\"><div class=\"table-responsive\">\
              <table class=\"table tree-grid tree-grid-analysis\">\
                  <thead>\
                  <tr>\
                      <th>{{expandingProperty.displayName || expandingProperty.field || expandingProperty}}<input type=\"text\" name=\"search\" placeholder=\"Enter\" ng-model=\"searchText\" ng-keyup=\"search($event,true,'')\"></th>\
                      <th>Special Project<input type=\"text\" name=\"search\" placeholder=\"Enter\" ng-model=\"searchSpecialProjectList\" ng-keyup=\"searchSpecialProject($event)\"></th>\
                        <th ng-repeat=\"col in colDefinitions\">{{col.displayName || col.field}}</th>\
                  </tr>\
                  </thead>\
                  <tbody>\
                  <tr ng-repeat=\"row in tree_rows | filter:{visible:true} track by row.branch.uid\"\
                      ng-class=\"'level-' + {{ row.level }} + (row.branch.selected ? ' active':'')\" class=\"tree-grid-row\">\
                      <td><a ng-click=\"countNum = 0;user_clicks_branch(row.branch)\"><i ng-class=\"row.tree_icon\"\
                                 ng-click=\"changeExpansion(row.branch)\"\
                                 class=\"indented tree-icon\"></i>\
                          </a><span class=\"indented tree-label\">\
                            <input type=\"checkbox\" ng-click=\"user_checks_unchecks(row.branch,1)\" ng-model=\"row.branch.itemSelected\" ng-checked=\"row.branch.itemSelected\">{{row.branch.name}}</span>\
                      </td>\
                      <td><span ng-class=\"(data.highlight)?'boldText':''\" ng-repeat=\"data in row.branch.specialProjects\" ng-include=\"'tree_item.html'\"></span></td>\
                     <td ng-repeat=\"archs in row.branch.architectures\" ng-class=\"(archs.overlay == true)?'overlay':''\"><span ng-if=\"archs.accessible\"><input type=\"checkbox\" ng-click=\"checkchildarchs(archs,row.branch,1)\" ng-model=\"archs.selected\" ng-checked=\"archs.selected\" ng-disabled=\"!archs.accessible || !row.branch.itemSelected\"><input id=\"{{archs.id}}\" type=\"button\"  ng-disabled=\"!archs.accessible || !row.branch.itemSelected\" value=\"a\" ng-click=\"getarchs(row,archs)\"></span><span ng-if=\"!archs.accessible\">-</span></td>\
                  </tr>\
                  </tbody>\
              </table>\
          </div>\
          <ul id=\"arcTreeID\" class=\"dropdown\">\
            <li data-ng-repeat=\"productFamily in productFamilys\">\
            <input type=\"checkbox\" ng-click=\"productFamily.selected = !productFamily.selected\" ng-checked=\"productFamily.selected\" name=\"{{productFamily.parentID}}_{{productFamily.id}}_{{productFamily.name}}\"\
                id=\"{{productFamily.parentID}}_{{productFamily.id}}_{{productFamily.name}}\" /><label for=\"{{productFamily.parentID}}_{{productFamily.id}}_{{productFamily.name}}\"></label><span\
                >{{productFamily.name}}</span>\
                <ul>\
                    <li data-ng-repeat=\"project in productFamily.projects\"><input\
                        type=\"checkbox\" id=\"{{productFamily.parentID}}_{{productFamily.name}}_{{project.name}}\" name=\"{{productFamily.parentID}}_{{productFamily.name}}_{{project.name}}\"\
                        ng-click=\"project.selected = !project.selected\" ng-checked=\"project.selected\" /><label\
                        for=\"{{productFamily.parentID}}_{{productFamily.name}}_{{project.name}}\"></label><span\
                        >{{project.name}}</span>\
                        <ul>\
                            <li data-ng-repeat=\"carline in project.carlines\"><input\
                                type=\"checkbox\" ng-checked=\"carline.selected\"\
                                id=\"{{productFamily.parentID}}_{{productFamily.name}}_{{project.name}}_{{carline.name}}\" name=\"{{productFamily.parentID}}_{{productFamily.name}}_{{project.name}}_{{carline.name}}\"\
                                ng-click=\"carline.selected = !carline.selected\" /><label\
                                for=\"{{productFamily.parentID}}_{{productFamily.name}}_{{project.name}}_{{carline.name}}\"></label><span>{{carline.name}}</span></li>\
                        </ul></li>\
                </ul></li>\
        </ul>",
                replace: true,
                scope: {
                    nodes   : '=',
                    treeData: '=',
                    colDefs: '=',
                    expandOn: '=',
                    onSelect: '&',
                    initialSelection: '@',
                    treeControl: '='
                },
                link: function (scope, element, attrs) {
                    var error, expandingProperty, expand_all_parents, expand_level, for_all_ancestors,expand_child_org_units,expand_special_projects, for_each_branch, get_parent, n, on_treeData_change, select_branch, selected_branch, tree, get_first_branch;
                    var architectureList = []
                    var architecturelistcopy = [];
                    scope.searchText = '';
                    var n = []
                    error = function (s) {
                        console.log('ERROR:' + s);
                        debugger;
                        return void 0;
                    }
                    scope.countNum = 0;
                     //Object to hold user input
                     scope.changeExpansion = function(branchexpand){
                       scope.countNum = 0;
                       branchexpand.expanded = !branchexpand.expanded
                     }
                    scope.search = function (event,status,branch1) {
                      if (event.keyCode == 13) {
                        scope.expandedList = [];
                        if(scope.searchText == ''){
                          if(scope.searchSpecialProjectList == ''){
                            scope.countNum = 0;
                            for_each_branch(function (b) {
                              if (b.userOrgUnit) {
                                 b.expanded = true;
                                 expand_all_parents(b);
                                 expand_child_org_units(b);
                              }
                              else{
                                if(b.type == "PLANT"){
                                  b.expanded = false;
                                }
                              }
                            });
                            on_treeData_change()
                          }
                          else{
                            scope.searchSpecialProject({keyCode:13});
                          }
                        }
                        else{
                          scope.countNum = 1;
                          for_each_branch(function (b) {
                            var string = b.name,
                            substring = scope.searchText;
                            var temp = new Array()
                            temp = b.path.split("|");
                            if((string.toLowerCase().indexOf(substring.toLowerCase()) !== -1)||(temp.indexOf(substring) > -1)){
                              b.expanded = true;
                              b.itemSelected = true;
                              expand_all_parents(b);
                              scope.user_checks_unchecks(b,1,false,true)
                              expand_child_org_units(b);
                            }
                            else{
                              b.expanded = false;
                            }
                          });
                          for(var i = 0;i<scope.tree_rows.length;i++){
                            if((scope.tree_rows[i]).branch.expanded == false){
                              (scope.tree_rows[i]).visible = false
                            }
                          }
                        }
                      }
                    }
                    scope.searchSpecialProject = function(){
                       if (event.keyCode == 13) {
                           //scope.expandedList = [];
                        if(scope.searchSpecialProjectList == ''){
                          //scope.countNum = 0;
                           if(scope.searchText == ''){
                             for_each_branch(function (b) {
                            if(b.specialProjects.length){
                              for(var i=0;i<b.specialProjects[0].children.length;i++){
                                b.specialProjects[0].children[i].highlight = false
                                  if(b.specialProjects[0].children[i].children.length){
                                    for(var j=0;j<b.specialProjects[0].children[i].children.length;j++){
                                      b.specialProjects[0].childrenVisible = false;
                                         b.specialProjects[0].children[i].childrenVisible = false;
                                         b.specialProjects[0].children[i].highlight = false;
                                         b.specialProjects[0].children[i].children[j].highlight = false;
                                    }
                                  }
                              }
                            }
                            if (b.userOrgUnit) {
                               b.expanded = true;
                               expand_all_parents(b);
                               expand_child_org_units(b)
                            }
                            else{
                              if(b.type == "PLANT"){
                                b.expanded = false;
                              }
                            }
                          });
                          on_treeData_change()
                           }
                           else{
                             for_each_branch(function (b) {
                            if(b.specialProjects.length){
                              for(var i=0;i<b.specialProjects[0].children.length;i++){
                                b.specialProjects[0].children[i].highlight = false
                                  if(b.specialProjects[0].children[i].children.length){
                                    for(var j=0;j<b.specialProjects[0].children[i].children.length;j++){
                                      b.specialProjects[0].childrenVisible = false;
                                         b.specialProjects[0].children[i].childrenVisible = false;
                                         b.specialProjects[0].children[i].highlight = false;
                                         b.specialProjects[0].children[i].children[j].highlight = false;
                                    }
                                  }
                              }
                            }
                             });
                             scope.search({keyCode:13},true,'')
                           }
                          
                        }
                        else{
                          //scope.countNum = 1
                          
                          if(scope.searchText == ''){
                            for_each_branch(function(b){
                              if(b.specialProjects.length){
                              for(var i=0;i<b.specialProjects[0].children.length;i++){
                                b.specialProjects[0].children[i].highlight = false
                                  if(b.specialProjects[0].children[i].children.length){
                                    for(var j=0;j<b.specialProjects[0].children[i].children.length;j++){
                                      b.specialProjects[0].children[i].children[j].highlight = false;
                                       var string = b.specialProjects[0].children[i].children[j].name,
                                       substring = scope.searchSpecialProjectList;
                                       if(string.toLowerCase().search(substring.toLowerCase()) !== -1){
                                         b.specialProjects[0].childrenVisible = true;
                                         b.specialProjects[0].children[i].childrenVisible = true;
                                         b.specialProjects[0].children[i].children[j].highlight = true;
                                         //b.expanded = true;
                                         expand_all_parents(b)
                                       }
                                    }
                                  }
                                  else{
                                    
                                       var string = b.specialProjects[0].children[i].name,
                                       substring = scope.searchSpecialProjectList;
                                       if(string.toLowerCase().search(substring.toLowerCase()) !== -1){
                                         console.log(i,j)
                                         b.specialProjects[0].childrenVisible = true;
                                         b.specialProjects[0].children[i].highlight = true;
                                         //b.expanded = true;
                                         expand_all_parents(b)
                                       }
                                  }
                              }
                            }
                            else{
                              b.expanded = false;
                            }
                            })
                             for(var i = 0;i<scope.tree_rows.length;i++){
                            if((scope.tree_rows[i]).branch.expanded == false){
                              (scope.tree_rows[i]).visible = false
                            }
                          }
                          }
                          else{
                            
                          for_each_branch(function (b) {
                             if(b.expanded){
                                if(b.specialProjects.length){
                             
                              for(var i=0;i<b.specialProjects[0].children.length;i++){
                                b.specialProjects[0].children[i].highlight = false
                                  if(b.specialProjects[0].children[i].children.length){
                                    for(var j=0;j<b.specialProjects[0].children[i].children.length;j++){
                                      b.specialProjects[0].children[i].children[j].highlight = false;
                                       var string = b.specialProjects[0].children[i].children[j].name,
                                       substring = scope.searchSpecialProjectList;
                                       if(string.toLowerCase().search(substring.toLowerCase()) !== -1){
                                         b.specialProjects[0].childrenVisible = true;
                                         b.specialProjects[0].children[i].childrenVisible = true;
                                         b.specialProjects[0].children[i].children[j].highlight = true;
                                         if(scope.searchText == ''){
                                          expand_all_parents(b);
                                         }
                                       }
                                    }
                                  }
                                  else{
                                     var string = b.specialProjects[0].children[i].name,
                                     substring = scope.searchSpecialProjectList;
                                     if(string.toLowerCase().search(substring.toLowerCase()) !== -1){
                                       b.specialProjects[0].childrenVisible = true;
                                       b.specialProjects[0].children[i].highlight = true;
                                       
                                     }
                                  }
                              }
                            }
                              }
                          });
                          }
                        }
                       }
                    }
                    function checkParent(item) {
                      for (var i in item.children) {
                        item.children[i].childrenVisible = !item.childrenVisible;
                        if (item.children[i].children) {
                          checkParent(item.children[i])
                        }
                      }
                    }
                    scope.toggleChildren = function(data) {
                        data.childrenVisible = !data.childrenVisible;
                        if (data.children) {
                          checkParent(data);
                        }
                    };
                    function parentCheckChange(item) {
                      for (var i in item.children) {
                        item.children[i].checked = item.checked;
                        if (item.children[i].children) {
                          parentCheckChange(item.children[i]);
                        }
                      }
                    }
                    scope.checkChange = function(data){
                        if (data.children) {
                          parentCheckChange(data);
                        }
                    }
                    scope.checkchildarchs = function(archs,row,number){
                      var chck_parent;
                      var selectedParent = [];
                      var n = row.children;
                     /* chck_parent = function (row) {
                         var parent;
                         parent = get_parent(row);
                         if(typeof(parent)!='undefined'){
                           if(parent.itemSelected == false){
                             chck_parent(parent);
                           }
                           else{
                             selectedParent.push(parent);
                           }
                         }
                      };
                      if(number == 1){
                        chck_parent(row);
                      }
                      if(!selectedParent.length){*/
                        if(n.length){
                          for(var i=0;i<n.length;i++){
                            var archItem = n[i].architectures.filter(function(item, idx) {
          						         return item.id == archs.id;
                            })
                            archItem[0].overlay = !archs.selected;
                            archItem[0].selected = !archs.selected;
                            scope.checkchildarchs(archs,n[i],2)
                          }
                         }
                      /*}*/
                    }
                    
                    scope.getarchs = function(a,b){
                        //to be used for showing the architectures on click
                       /* angular.element('#arcTreeID').show();
        							  var top = angular.element(this).offset().top;
        							  var left = angular.element(this).offset().left;
        							  console.log(top,left);
        							  $('#arcTreeID').css({'top':top-150+'px','left':left+46+'px', 'position':'absolute'});*/
                        if(!b.productFamilys.length){
                             var architectureItem = [];
                             b.showAll = false;
                             if(architectureList.length){
                                 architectureItem = architecturelistcopy.filter(function(item, idx) {
            						         return item.architectures.id == b.id;
            				         });
                             }
                             if(!architectureItem.length){
                                //MRA3(414) ARCHITECTURE3.JSON,MFA1(401) ARCHITECTURE1.JSON, MRA2(413) ARCHITECTURE2.JSON
                                 if(b.id == 414){
                                     $http.get('architecture3.json').success(function(data, status, headers, config) {
                                       architecturelistcopy.push(data);
                                        var dataCopy = angular.copy(data);
                                        architectureList.push(dataCopy);
                                        scope.productFamilys = dataCopy.architectures.productFamilys;
                                        b.productFamilys =  dataCopy.architectures.productFamilys;
                                        b.productFamilys.parentID = a.branch.ID
                                     });
                                 }
                                 else if(b.id == 401){
                                     $http.get('architecture1.json').success(function(data, status, headers, config) {
                                        architecturelistcopy.push(data);
                                        var dataCopy = angular.copy(data);
                                        architectureList.push(dataCopy);
                                        scope.productFamilys = dataCopy.architectures.productFamilys;
                                        b.productFamilys =  dataCopy.architectures.productFamilys;
                                        b.productFamilys.parentID = a.branch.ID
                                     });
                                 }
                                 else if(b.id == 413){ 
                                     $http.get('architecture2.json').success(function(data, status, headers, config) {
                                        architecturelistcopy.push(data);
                                        var dataCopy = angular.copy(data);
                                        architectureList.push(dataCopy);
                                        scope.productFamilys = dataCopy.architectures.productFamilys;
                                        b.productFamilys =  dataCopy.architectures.productFamilys;
                                        b.productFamilys.parentID = a.branch.ID
                                     });
                                 }
                            }
                            else{ 
                              var dataCopy = angular.copy(architectureItem);
                              scope.productFamilys = dataCopy[0].architectures.productFamilys;
                              b.productFamilys = dataCopy[0].architectures.productFamilys;
                              b.productFamilys.parentID = a.branch.ID
                            }
                        }
                        else{
                           scope.productFamilys = b.productFamilys;
                        }
                    }
                    /*attrs.iconExpand = attrs.iconExpand ? attrs.iconExpand : 'icon-plus  glyphicon glyphicon-plus  fa fa-plus';
                    attrs.iconCollapse = attrs.iconCollapse ? attrs.iconCollapse : 'icon-minus glyphicon glyphicon-minus fa fa-minus';
                    attrs.iconLeaf = attrs.iconLeaf ? attrs.iconLeaf : 'icon-file  glyphicon glyphicon-file  fa fa-file';
                    attrs.expandLevel = attrs.expandLevel ? attrs.expandLevel : '3';
                    expand_level = parseInt(attrs.expandLevel, 10);*/

                    for_each_branch = function (f) {
                        var do_f, root_branch, _i, _len, _ref, _results;
                        do_f = function (branch, level) {
                            var child, _i, _len, _ref, _results;
                            f(branch, level);
                            if (branch.children != null) {
                                _ref = branch.children;
                                _results = [];
                                for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                                    child = _ref[_i];
                                    _results.push(do_f(child, level + 1));
                                }
                                return _results;
                            }
                        };
                        _ref = scope.treeData;
                        _results = [];
                        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                            root_branch = _ref[_i];
                            _results.push(do_f(root_branch, 1));
                        }
                        return _results;
                    };
                    if (!scope.treeData) {
                        alert('No data was defined for the tree, please define treeData!');
                        return;
                    }
                    if (attrs.expandOn) {
                        expandingProperty = scope.expandOn;
                        scope.expandingProperty = scope.expandOn;
                    } else {
                        if(scope.treeData.length) {
                            var _firstRow = scope.treeData[0],
                                _keys = Object.keys(_firstRow);
                            for (var i = 0, len = _keys.length; i < len; i++) {
                                if (typeof (_firstRow[_keys[i]]) === 'string') {
                                    expandingProperty = _keys[i];
                                    break;
                                }
                            }
                            if (!expandingProperty) expandingProperty = _keys[0];
                            scope.expandingProperty = expandingProperty;
                        }
                    }

                    if (!attrs.colDefs) {
                        if(scope.treeData.length) {
                            var _col_defs = [],
                                _firstRow = scope.treeData[0],
                                _unwantedColumn = ['children', 'level', 'expanded', expandingProperty];
                            for (var idx in _firstRow) {
                                if (_unwantedColumn.indexOf(idx) === -1) {
                                    _col_defs.push({
                                        field: idx
                                    });
                                }
                            }
                            scope.colDefinitions = _col_defs;
                        }
                    } else {
                        scope.colDefinitions = scope.colDefs;
                    }

                    selected_branch = null;
                    select_branch = function (branch) {
                        if (!branch) {
                            if (selected_branch != null) {
                                selected_branch.selected = false
                            }
                            selected_branch = null;
                            return;
                        }
                        if (branch !== selected_branch) {
                            if (selected_branch != null) {
                                selected_branch.selected = false;
                            }
                            branch.selected = true;
                            selected_branch = branch;
                            expand_all_parents(branch);
                            if (branch.onSelect != null) {
                                return $timeout(function () {
                                    return branch.onSelect(branch);
                                });
                            } else {
                                if (scope.onSelect != null) {
                                    return $timeout(function () {
                                        return scope.onSelect({
                                            branch: branch
                                        });
                                    })
                                }
                            }
                        }
                    };
                    scope.user_clicks_branch = function (branch) {
                      scope.countNum = 0;
                      if (branch !== selected_branch) {
                          return select_branch(branch)
                      }
                    };
                    var selectedstatus;
                    scope.user_checks_unchecks = function(branch1,number,exist,init) {
                      var chck_parent;
                      var selectedParent = [];
                      var n = branch1.children;
                      var architectureList = [];
                      chck_parent = function (branch1) {
                         var parent;
                         parent = get_parent(branch1);
                         if(typeof(parent)!='undefined'){
                           if(parent.itemSelected == false || typeof(parent.itemSelected) == 'undefined'){
                             chck_parent(parent);
                           }
                           else{
                             selectedParent.push(parent);
                           }
                         }
                      };
                      if(number == 1){
                        chck_parent(branch1);
                        scope.architectureList = branch1.architectures;
                      }
                      var n = branch1.children;
                      if(!selectedParent.length && ((typeof(exist) == 'undefined') || (exist==false))){
                        if(number == 1){
                          selectedstatus = !branch1.itemSelected;
                          if(init == true){
                            selectedstatus = true
                          }
                           for(var j=0;j<branch1.architectures.length;j++){
                             branch1.architectures[j].selected = selectedstatus
                           }
                        }
                        if(n.length){
                            for(var i=0;i<n.length;i++){
                              for(var k=0;k<n[i].architectures.length;k++){
                                if(scope.architectureList.length){
                                  n[i].architectures[k].overlay = selectedstatus;
                                  n[i].architectures[k].selected = selectedstatus;
                                }
                              }
                              n[i].itemSelected = selectedstatus;
                              scope.user_checks_unchecks(n[i],2)
                            }
                        }
                      }
                      else{
                         if(number == 1){
                            selectedstatus = !branch1.itemSelected;
                         }
                         if(n.length){
                            for(var i=0;i<n.length;i++){
                              n[i].itemSelected = selectedstatus;
                              scope.user_checks_unchecks(n[i],2,true)
                            }
                         }
                      }
                    }
                    get_parent = function (child) {
                        var parent;
                        parent = void 0;
                        if (child.parent_uid) {
                            for_each_branch(function (b) {
                                if (b.uid === child.parent_uid) {
                                    return parent = b;
                                }
                            });
                        }
                        return parent;
                    };
                    for_all_ancestors = function (child, fn) {
                        var parent;
                        parent = get_parent(child);
                        if (parent != null) {
                            fn(parent);
                            return for_all_ancestors(parent, fn);
                        }
                    };
                    expand_all_parents = function (child) {
                        return for_all_ancestors(child, function (b) {
                            return b.expanded = true;
                        });
                    }
                    
                    
                    get_child = function (child) {
                        var parent;
                        parent = void 0;
                        if (child.parent_uid) {
                            for_each_branch(function (b) {
                                if (b.uid === child.parent_uid) {
                                    return parent = b;
                                }
                            });
                        }
                        return parent;
                    };
                    for_all_children = function (child, fn) {
                        var parent;
                        parent = get_child(child);
                        if (parent != null) {
                            fn(parent);
                            return for_all_children(parent, fn);
                        }
                    };
                    expand_all_children = function (child) {
                        return for_all_children(child, function (b) {
                            return b.expanded = true;
                        });
                    }
                    scope.tree_rows = []
                    scope.user_click_branch = ''
                    on_treeData_change = function () {
                        var add_branch_to_list, root_branch, _i, _len, _ref, _results;
                        //to set branch uid
                        for_each_branch(function (b, level) {
                            if (!b.uid) {
                                return b.uid = "" + Math.random();
                            }
                        });
                        //to get all children and their corresponding parent relation
                        for_each_branch(function (b) {
                            var child, _i, _len, _ref, _results;
                            if (angular.isArray(b.children)) {
                                _ref = b.children;
                                _results = [];
                                for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                                    child = _ref[_i];
                                    _results.push(child.parent_uid = b.uid);
                                }
                                return _results;
                            }
                        });
                        scope.tree_rows = [];
                        for_each_branch(function (branch) {
                            var child, f;
                            if (branch.children) {
                                if (branch.children.length > 0) {
                                    f = function (e) {
                                        if (typeof e === 'string') {
                                            return {
                                                label: e,
                                                children: []
                                            };
                                        } else {
                                            return e;
                                        }
                                    };
                                    return branch.children = (function () {
                                        var _i, _len, _ref, _results;
                                        _ref = branch.children;
                                        _results = [];
                                        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                                            child = _ref[_i];
                                            _results.push(f(child));
                                        }
                                        return _results;
                                    })();
                                }
                            } else {
                                return branch.children = [];
                            }
                        });
                        
                        add_branch_to_list = function (level, branch, visible) {
                            var child, child_visible, tree_icon, _i, _len, _ref, _results;
                            if (branch.expanded == null || (visible == false)) {
                                branch.expanded = false
                            }
                            
                            if (!branch.children || branch.children.length === 0) {
                                tree_icon = attrs.iconLeaf;
                            } else {
                                if (branch.expanded) {
                                    tree_icon = attrs.iconCollapse;
                                } else {
                                    tree_icon = attrs.iconExpand;
                                }
                            }
                            branch.level = level;
                            if(branch.userOrgUnit){
                              scope.tree_rows.push({
                                level: level,
                                branch: branch,
                                label: branch[expandingProperty],
                                tree_icon: tree_icon,
                                visible: visible,
                                name:branch.name,
                                userLevelUnit:true
                              });
                            }
                            else{
                               scope.tree_rows.push({
                                level: level,
                                branch: branch,
                                label: branch[expandingProperty],
                                tree_icon: tree_icon,
                                visible: visible,
                                name:branch.name
                              });
                            }
                            if (branch.children != null) {
                                _ref = branch.children;
                                _results = [];
                                for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                                    child = _ref[_i];
                                    child_visible = visible && branch.expanded
                                    if(scope.searchText != ''){
                                      if((child.expanded == false)&&(scope.countNum == 1)&&(child.children.length)){
                                         scope.expandedList.push(child.id)
                                        _results.push(add_branch_to_list(level + 1, child, false));
                                      }
                                      else{
                                        if((scope.expandedList.indexOf(child.id) > -1)&&(child.children.length)){
                                          _results.push(add_branch_to_list(level + 1, child, false));
                                        }
                                        else{
                                           _results.push(add_branch_to_list(level + 1, child, child_visible));
                                        }
                                        
                                      }
                                    }
                                    else{
                                      _results.push(add_branch_to_list(level + 1, child, child_visible)); 
                                    }
                                    
                                }
                                return _results;
                            }
                        };
                        _ref = scope.treeData;
                        _results = [];
                        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                            root_branch = _ref[_i];
                            if(scope.searchText != ''){
                              if((root_branch.expanded == false)&&(scope.countNum == 1)&&(root_branch.children.length)){
                                scope.expandedList.push(root_branch.id)
                                _results.push(add_branch_to_list(1, root_branch, false));
                              }
                              else{
                                if((scope.expandedList.indexOf(root_branch.id) > -1)&&(root_branch.children.length)){
                                  _results.push(add_branch_to_list(1, root_branch, false));
                                }
                                else{
                                   _results.push(add_branch_to_list(1, root_branch, true));
                                }
                                
                              }
                            }
                            else{
                              _results.push(add_branch_to_list(1, root_branch, true)); 
                            }
                        }
                        return _results
                    };
                    scope.$watch('treeData', on_treeData_change, true);
                    if (attrs.initialSelection != null) {
                        for_each_branch(function (b) {
                            if (b.label === attrs.initialSelection) {
                                return $timeout(function () {
                                    return select_branch(b);
                                });
                            }
                        });
                    }
                   expand_child_org_units = function (b) {
                      var child, _i, _len, _ref, _results;
                      if (b.children != null) {
                          _ref = b.children;
                          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                              child = _ref[_i];
                              child.expanded = true;
                              expand_child_org_units(child)
                          }
                      }
                   };
                   expand_special_projects = function (b) {
                      var child, _i, _len, _ref, _results;
                      if (b.children != null) {
                          _ref = b.children;
                          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                              child = _ref[_i];
                              child.childrenVisible = true;
                              expand_special_projects(child)
                          }
                      }
                   };
                    $timeout(function () {
                        for_each_branch(function (b) {
                          for(var i=0; i<b.architectures.length; i++){
                            b.architectures[i].showAll = true;
                          }
                          if (b.userOrgUnit) {
                             b.expanded = true;
                             b.itemSelected = true;
                             expand_all_parents(b);
                             scope.user_checks_unchecks(b,1,false,true)
                             expand_child_org_units(b)
                            /* if(b.specialProjects.length){
                                b.specialProjects[0].childrenVisible = true;
                                expand_special_projects(b.specialProjects[0]);
                             }*/
                          }
                        });
                    },1000)
                    n = scope.treeData.length;
                }
            };
    }
  ]);
  
 /* app.directive('treeView', function($compile) {
  return {
    restrict : 'E',
    scope : {
      localNodes : '=model',
      localClick : '&click'
    },
    link : function (scope, tElement, tAttrs, transclude) {
      
      var maxLevels = (angular.isUndefined(tAttrs.maxlevels)) ? 10 : tAttrs.maxlevels; 
      var hasCheckBox = (angular.isUndefined(tAttrs.checkbox)) ? false : true;
      scope.showItems = [];
      
      scope.showHide = function(ulId) {
        var hideThis = document.getElementById(ulId);
        var showHide = angular.element(hideThis).attr('class');
        angular.element(hideThis).attr('class', (showHide === 'show' ? 'hide' : 'show'));
      }
      
      scope.showIcon = function(node) {
        if (!angular.isUndefined(node.children)) return true;
      }
      
      scope.checkIfChildren = function(node) {
        if (!angular.isUndefined(node.children)) return true;
      }

      /////////////////////////////////////////////////
      /// SELECT ALL CHILDRENS
      // as seen at: http://jsfiddle.net/incutonez/D8vhb/5/
      function parentCheckChange(item) {
        for (var i in item.children) {
          item.children[i].checked = item.checked;
          if (item.children[i].children) {
            parentCheckChange(item.children[i]);
          }
        }
      }
     
      scope.checkChange = function(node) {
        if (node.children) {
          parentCheckChange(node);
        }
      }
      /////////////////////////////////////////////////

      function renderTreeView(collection, level, max) {
        var text = '';
        text += '<li ng-repeat="n in ' + collection + '" >';
        text += '<span ng-show=showIcon(n) class="show-hide" ng-click=showHide(n.id)><i ng-class="n.folderClass" class="glyphicon glyphicon-folder-open"></i></span>';
        text += '<span ng-show=!showIcon(n) style="padding-right: 13px"></span>';
       
        if (hasCheckBox) {
          text += '<input class="tree-checkbox" type=checkbox ng-model=n.checked ng-change=checkChange(n)>';
        }
        


        
        text += '<label>{{n.name}}</label>';
       
        if (level < max) {
          text += '<ul id="{{n.id}}" class="hide" ng-if=checkIfChildren(n)>'+renderTreeView('n.children', level + 1, max)+'</ul></li>';
        } else {
          text += '</li>';
        }
        
        return text;
      }// end renderTreeView();
      
      try {
        var text = '<ul class="tree-view-wrapper">';
        text += renderTreeView('localNodes', 1, maxLevels);
        text += '</ul>';
        tElement.html(text);
        $compile(tElement.contents())(scope);
      }
      catch(err) {
        tElement.html('<b>ERROR!!!</b> - ' + err);
        $compile(tElement.contents())(scope);
      }
    }
  };
});*/


