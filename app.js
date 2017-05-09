
var sync = angular.module('dataset', []);

sync.controller('DatasetController', ['$http', function($http) {
    var self = this;

    var apiResources = 'https://records-ws.nbnatlas.org/occurrences/search?q=*:*&facets=data_resource_uid&pageSize=0&facet=on&flimit=-1';
    var apiResourceDetail = 'https://registry.nbnatlas.org/ws/dataResource/';
    var ukAPI = 'https://records-ws.nbnatlas.org/occurrences/search?q=*:*&facets=data_resource_uid&pageSize=0&facet=on&flimit=-1';
    
    //var gbifDatasetSuggest ='https://api.gbif.org/v1/dataset/suggest?q=';
    var gbifAPI ='http://api.gbif.org/v1/occurrence/count?datasetKey=';

    self.datasets = [];

    // Call the UK API to get the list of datasets with counts
    var getDatasets = function() {

        $http.get(apiResources).then(function (response) {
            self.datasets = response.data.facetResults[0].fieldResult;

            angular.forEach(self.datasets, function(dataset) {
                
                if (dataset.label != "Unknown") {
                
                // populate the details from the UK API
                var url = apiResourceDetail +  dataset.fq.replace("data_resource_uid:\"", "").replace("\"", "");
                
                $http.get(url).then(function (response) {
                  dataset.name = response.data.name
                  dataset.id = response.data.uid
                  dataset.gbifRegistryKey = response.data.gbifRegistryKey                  
                  
                  if (response.data.provider) {
                    dataset.providerName = response.data.provider.name
                    dataset.providerId = response.data.provider.uid
                  
                    $http.get(response.data.provider.uri).then(function (p) {
                      dataset.gbifOrgKey = p.data.gbifRegistryKey
                    });
                  } else {
                    dataset.providerName = "No name from UK API!"
                  }
                  
                  if (dataset.gbifRegistryKey != null) {
                    $http.get(gbifAPI + dataset.gbifRegistryKey).then(function (p) {
                      dataset.gbifCount = dataset.gbifCount=p.data;
                    });                  
                  } else {
                    dataset.gbifCount = "-";                    
                  }
                  
                });                
                }
            });
        });
    }

    // call the function to populate the list
    getDatasets();
}]);