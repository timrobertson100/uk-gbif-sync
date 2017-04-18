
var sync = angular.module('dataset', []);

sync.controller('DatasetController', ['$http', function($http) {
    var self = this;

    var ukAPI = 'https://records-ws.nbnatlas.org/occurrences/search?q=*:*&facets=data_resource_uid&pageSize=0&facet=on&flimit=-1';
    var gbifDatasetSuggest ='https://api.gbif.org/v1/dataset/suggest?q=';
    var gbifAPI ='https://api.gbif.org/v1/occurrence/count?datasetKey=';

    self.datasets = [];

    // Call the UK API to get the list of datasets with counts
    var getDatasets = function() {

        $http.get(ukAPI).then(function (response) {
            console.log(response);
            self.datasets = response.data.facetResults[0].fieldResult;

            angular.forEach(self.datasets, function(dataset) {
                console.log(dataset);
                dataset.url = dataset.fq // TODO Dave create an archive URL please

                // populate GBIF counts using title search
                $http.get(gbifDatasetSuggest + dataset.label).then(function (response) {

                    if (response.data && response.data.length == 1) {
                        $http.get(gbifAPI + response.data[0].key).then(function (response2) {
                            dataset.gbifdatasetid = response.data[0].key
                            dataset.gbifCount=response2.data;
                        })
                    } else if (response.data.length == 0) {
                        dataset.gbifCount = 0;
                    } else {
                        dataset.gbifCount = response.data.length + " datasets found";
                    }
                });

            });
        });
    }

    // call the function to populate the list
    getDatasets();
}]);