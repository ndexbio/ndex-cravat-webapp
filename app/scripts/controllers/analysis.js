'use strict';

/**
 * @ngdoc function
 * @name ndexCravatWebappApp.controller:AnalysisCtrl
 * @description
 * # AnalysisCtrl
 * Controller of the ndexCravatWebappApp
 */
angular.module('ndexCravatWebappApp').controller('AnalysisCtrl',

    function ($scope, $http, sharedProperties, webServices, fileInputService) {

       $scope.rankedNetworksList = {};
       var rankedNetworksList = $scope.rankedNetworksList;
       rankedNetworksList.responseJSON = undefined;

       //rankedNetworksList.geneList = 'LAMB2, LAMB3, CD81, TSP2, TSP1, BRAF, UB2D3, EWS, CSTF1, CDK2';
       rankedNetworksList.geneList = 'AURKB, BRCA1, PCNA, AKT1, ITGB2';

        // eSets should be filled dynamically
       rankedNetworksList.eSets = ['cravat_nci', 'rudi_test'];
       rankedNetworksList.eSetSelected = rankedNetworksList.eSets[0];

        $scope.fileContent = undefined;
        $scope.fileContentInJSON = undefined;
        $scope.uploadedFileName = undefined;
        $scope.currentCravatFileName = sharedProperties.getCravatFileName();

        $scope.submit = function() {

          var list = rankedNetworksList.geneList.split(',');

          for (var i = 0; i < list.length; i++) {
             list[i] = list[i].trim();
          }
           
          var myObj = {'ids': list, 'eset': rankedNetworksList.eSetSelected };

          var myJsonString = JSON.stringify(myObj);

          var req = {
             'method': 'POST',
             'url': webServices.getEnrichmentServiceURL(),
             'headers': {
                'Content-Type': 'application/json'
             },
             'data': myJsonString
          };

          $http( req

          ).success(
              function( response ) {

                  rankedNetworksList.responseJSON = $scope.buildListOfEnrichedNetworks(response);
                  var responseScores = $scope.normalizeResponseScores(response.scores);
                  sharedProperties.setResponseScores(responseScores);

              }
          ).error (
             function( response ) {

                // process error here
                console.log(response);

             }
          );

       };

        $scope.normalizeResponseScores = function(scores) {
            var retScores = {};

            if (!scores) {
                return retScores;
            }

            for (var i = 0; i < scores.length; i++) {

                var scoresObj = scores[i];
                var key = scoresObj.set_id;

                if (!(key in retScores)) {
                    retScores[key] = scoresObj;
                }
            }

            return retScores;
        };

        $scope.normalizeArrayOfGenes = function(arrayOfGenes, key) {
            var mapOfGenes = {};

            if (!arrayOfGenes) {
                return mapOfGenes;
            }

            for (var i = 0; i < arrayOfGenes.length; i++) {

                var entry = arrayOfGenes[i];

                if (key in entry) {
                    mapOfGenes[entry[key]] = entry;
                }
            }

            return mapOfGenes;
        };

       $scope.clearInput = function() {
          rankedNetworksList.geneList = undefined;
          rankedNetworksList.responseJSON = undefined;
          rankedNetworksList.eSetSelected = rankedNetworksList.eSets[0];
       };

        $scope.clearFileContent = function() {
            $scope.fileContent = undefined;
            $scope.fileContentInJSON = undefined;
            $scope.uploadedFileName = undefined;
        };
        
        $scope.unloadCravatData = function() {
            sharedProperties.removeItemFromSessionStorage('cravatFileName');
            sharedProperties.removeItemFromSessionStorage('cravatData');
            $scope.currentCravatFileName = sharedProperties.getCravatFileName();
        };

       $scope.buildListOfEnrichedNetworks = function(response) {

           //console.log('in buildListOfEnrichedNetworks');

          if ((!response) || (!response.scores)  || (response.scores.length === 0)) {
             return 'no networks found';
          }

          var list = '<br />';

          for (var i = 0; i < response.scores.length; i++) {
             var scoreEntry  = response.scores[i];
             var networkName = scoreEntry.set_name;
             var networkUUID = scoreEntry.set_id;
             var networkPV   = scoreEntry.pv;
             var networkOverlap = '';


             if (scoreEntry.overlap) {

                var allKeys = Object.keys(scoreEntry.overlap);

                for (var j = 0; j <  allKeys.length; j++) {

                   var value = allKeys[j];

                    var arrayOfOverlappedIDs = scoreEntry.overlap[value];

                    var stringOfOverlappedIDs = '';

                    for (var k = 0; k < arrayOfOverlappedIDs.length; k++) {
                        var overlappedID = arrayOfOverlappedIDs[k];

                        if (k > 0) {
                            stringOfOverlappedIDs = stringOfOverlappedIDs + ', ';
                        }
                        stringOfOverlappedIDs = stringOfOverlappedIDs + overlappedID;
                    }

                    if (j > 0) {
                        networkOverlap = networkOverlap + ', ';
                    }

                    networkOverlap = networkOverlap + value + '(IDs: ' + stringOfOverlappedIDs + ')';
                }
             }

             if (i > 0) {
                list = list + '<br /><br />';
             }

             list = list + '<strong>                PV : </strong>' + networkPV   + '<br />' +
                           '<strong>              Name : </strong>' + networkName + '<br />' +
                           '<strong>              UUID : </strong>' + networkUUID + '<br />' +

     ((networkOverlap) ? ( '<strong>           Overlap : </strong>' + networkOverlap + '<br />') : ('')) +


//                           '<strong>          Retrieve : </strong><a target="_blank" href="http://dev2.ndexbio.org/rest/network/' +
//                                networkUUID + '/asCX">Get Network in CX format</a>' + '<br />' +

//                           '<strong>         Translate : </strong><a target="_blank" href="#/viewnicecx/' +
//                                networkUUID + '">Translate network to Nice CX format</a>' + '<br />' +

//                           '<strong>        Mark Nodes : </strong><a target="_blank" href="#/markNiceCX/' +
//                                networkUUID + '">Mark inQuery Nodes in Nice CX </a>' + '<br />' +

//                           '<strong> Nice CX -> Raw CX : </strong><a target="_blank" href="#/niceCXtoRawCX/' +
//                                networkUUID + '">Translate Nice CX with Marked Nodes back to Raw CX </a>' + '<br />' +

                   //        '<strong>Visualize Original : </strong><a target="_blank" href="#/visualizeOriginal/' + networkUUID + '">' +
                   //            'View Original Network</a>' + '<br />' +

                           '<strong>         Visualize : </strong><a target="_blank" href="#/visualizeEnriched/' + networkUUID + '">' +
                               'View Network</a>';
          }

          return list;
       };

        $scope.onFileUpload = function (inputElement) {
            $scope.$apply(function () {
                var file = inputElement.files[0];

                // clear a file input name from Angular JS ; we need to clear it
                // because Chrome (unlike FireFox) will not load the same file 2 times in row
                // unless we set the input element value to null
                angular.element(inputElement).val(null);

                fileInputService.readFileAsync(file).then(function (fileInputContent) {

                    $scope.fileContent = fileInputContent;

                    // find where actual CRAVAT data begins... it begins with the "HUGO symbol" substring
                    var index = fileInputContent.toLowerCase().indexOf('hugo symbol');

                    if (index < 0) {
                        $scope.fileContentInJSON = undefined;
                        return;
                    }

                    // this is part of Cravat TSV file stripped off the headers that begins with "HUGO symbol"
                    // string which is header of the first column
                    var cravatPureData = fileInputContent.substring(index);
                    var d3ParsedArray = d3.tsv.parse(cravatPureData);


                    // use Lodash function _.map() to get values of 'HUGO symbol' key from all objects in d3ParsedArray.
                    // This gives us array of genes.
                    var arrayOfGenes = _.map(d3ParsedArray, 'HUGO symbol');

                    // initialize Find Related Networks by Gene List panel with the genes extracted from CRAVAT file
                    var resultString = arrayOfGenes.toString();
                    rankedNetworksList.geneList = resultString;


                    // translate array of genes to map of genes with "HUGO symbol" values as keys
                    var mapOfGenes = $scope.normalizeArrayOfGenes(d3ParsedArray, 'HUGO symbol');
                    sharedProperties.setCravatData(mapOfGenes);

                    sharedProperties.setCravatFileName(file.name);
                    $scope.currentCravatFileName = sharedProperties.getCravatFileName();

                    $scope.fileContentInJSON = JSON.stringify(mapOfGenes, null, 3);

                    $scope.submit();
                });

                $scope.uploadedFileName = file.name;

            });
        };


   });
