'use strict';

/**
 * @ngdoc service
 * @name ndexCravatWebappApp.utils
 * @description
 * # utils
 * Service in the ndexCravatWebappApp.
 */
angular.module('ndexCravatWebappApp')
  .service('utils', function (sharedProperties, cxNetworkUtils) {
    // AngularJS will instantiate a singleton by calling "new" on this function

      const CRAVAT_ATTRIBUTES_MAP = {
          'hugo symbol': 'HUGO_symbol',
          'variants': 'Variants',
          'number of variants': 'Number_of_variants',
          'mupit link': 'MuPIT_Link',
          'has a mutation in a tcga mutation cluster': 'Has_a_mutation_in_a_TCGA_Mutation_Cluster',
          'most severe sequence ontology': 'Most_severe_sequence_ontology',
          'cancer missense driver score (1 - chasm score)': 'Cancer_missense_driver_score_1_CHASM_score',
          'chasm cancer driver composite p-value (missense)': 'CHASM_cancer_driver_composite_p_value_missense',
          'chasm cancer driver fdr (missense)': 'CHASM_cancer_driver_FDR_missense',
          'vest pathogenicity score (non-silent)': 'VEST_pathogenicity_score_non_silent',
          'vest pathogenicity composite p-value (non-silent)': 'VEST_pathogenicity_composite_p_value_non_silent',
          'vest pathogenicity fdr (non-silent)': 'VEST_pathogenicity_FDR_non_silent',
          'driver genes': 'Driver_genes',
          'target': 'TARGET',
          'occurrences in cosmic': 'Occurrences_in_COSMIC',
          'occurrences in cosmic by primary sites': 'Occurrences_in_COSMIC_by_primary_sites',
          'pubmed articles': 'PubMed_articles',
          'pubmed search term': 'PubMed_search_term',
          'number of samples in study having the gene mutated': 'Number_of_samples_in_study_having_the_gene_mutated',
          'chasm score available': 'CHASM_score_available',
          'vest score available': 'VEST_score_available'
      };
    
    const CRAVAT_VISUAL_STYLE = [
      {
        selector: 'node',
        style: {
          'background-color': 'rgb(0, 220, 200)',
          'background-opacity': 0.8,
          'width': '40px',
          'height': '40px',
          'label': 'data(name)',
          'font-family': 'Roboto, sans-serif',
            'border-width' : '2px'
        }
      },
      {
        selector: 'edge',
        style: {
          'line-color': '#aaaaaa',
          'width': '2px',
          ///'label': 'data(interaction)',
          'font-family': 'Roboto, sans-serif',
          'text-opacity': 0.8
        }
      },
      {
        selector: 'node:selected',
        style: {
          'background-color': 'yellow'
        }
      },
      {
        selector: 'edge:selected',
        style: {
          'line-color': 'yellow',
          'width': 6
        }
      },
      {
        selector: 'node[inQuery = "true"]',
        style: {
            'border-color': 'red',
            'color': 'blue',
            'border-width' : '5px'
        }
      },
        {
            selector: 'node[VEST_pathogenicity_score_non_silent]',
            style: {
                'background-color': 'mapData(VEST_pathogenicity_score_non_silent, 1, 0, rgb(255,0,0), rgb(128,128,128))',
                'border-color': 'blue',
                'border-width' : '5px'
            }
        }
    ];
    
    this.getCravatVisualizeStyle = function () {
      return CRAVAT_VISUAL_STYLE;
    };


    this.markInQueryNodes = function (niceCX, networkUUID) {
        var overlappedIDs = getOverlappedIDsForNetwork(networkUUID);

        for (var i = 0; i < overlappedIDs.length; i++) {
            var nodeId = overlappedIDs[i];
            cxNetworkUtils.setNodeAttribute(niceCX, nodeId, 'inQuery', 'true');
        }
    };


    this.addCravatAttributesToCX = function (niceCX, networkUUID) {

        var responseScores = sharedProperties.getResponseScores(networkUUID);
        var cravatData = sharedProperties.getCravatData();

        if (!responseScores && !responseScores.overlap) {
            return;
        }

        if (!cravatData) {
            return;
        }

        for (var key in responseScores.overlap) {

            if (!cravatData.hasOwnProperty(key)) {
                continue;
            }

            var cravatDataEntry = cravatData[key];
            var nodeIds = responseScores.overlap[key];

            for (var index in nodeIds) {

                // loop through all key/value pairs from cravatDataEntry Object, and set them as node attributes
                for (var cravatEntryKey in cravatDataEntry) {

                    if (!cravatDataEntry[cravatEntryKey]) {
                        // skip empty entries; i.e., entries with keys and no values
                        continue;
                    }

                    var nodeId = nodeIds[index];

                    var cravatDataValue = isNaN(cravatDataEntry[cravatEntryKey]) ?
                        cravatDataEntry[cravatEntryKey] :
                        parseFloat(cravatDataEntry[cravatEntryKey]);
                    
                    var cravatEntryKeyMapped = CRAVAT_ATTRIBUTES_MAP[cravatEntryKey.toLowerCase()];
                    cxNetworkUtils.setNodeAttribute(niceCX, nodeId, cravatEntryKeyMapped, cravatDataValue);
                }
            }
        }
    };



    var getOverlappedIDsForNetwork = function(networkUUID) {

        var overlappedIDs = [];
        var responseScores = sharedProperties.getResponseScores(networkUUID);

        if (!responseScores) {
            return overlappedIDs;
        }

        if (responseScores.overlap) {
            for (var key in responseScores.overlap) {
                var nodeIds = responseScores.overlap[key];

                for (var index in nodeIds) {
                    overlappedIDs.push(nodeIds[index]);
                }
            }
        }

        return overlappedIDs;
    };

  });
