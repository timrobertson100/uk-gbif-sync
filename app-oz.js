
var sync = angular.module('dataset', []);

sync.controller('DatasetController', ['$http', function($http) {
    var self = this;

    var apiResources = 'https://biocache.ala.org.au/ws/occurrences/search?q=*:*&facets=data_resource_uid&pageSize=0&facet=on&flimit=-1';
    var apiResourceDetail = 'http://collections.ala.org.au/ws/dataResource/';
    
    //var gbifDatasetSuggest ='https://api.gbif.org/v1/dataset/suggest?q=';
    var gbifAPI ='https://api.gbif.org/v1/occurrence/count?datasetKey=';
    //var gbifAPI ='https://api.gbif.org/v1/occurrence/search?limit=0&datasetKey=';
    

    self.datasets = [];
    self.numDatasets = 0;
    self.registeredDatasets = 0;
    self.synced = 0;
    self.underSynced = 0;
    self.overSynced = 0;

    var getDatasets = function() {

        $http.get(apiResources).then(function (response) {
            self.datasets = response.data.facetResults[0].fieldResult;
            
            angular.forEach(self.datasets, function(dataset) {
                self.numDatasets++;
            
                
                if (dataset.label != "Unknown") {
                
                // populate the details from the ALA API
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
                    dataset.providerName = "No data provider (could be institution?)"
                  }
                  
                  if (dataset.gbifRegistryKey != null) {
                    self.registeredDatasets++;
                    $http.get(gbifAPI + dataset.gbifRegistryKey).then(function (p) {
                      dataset.gbifCount = p.data;
                      //dataset.gbifCount = p.data.count;
                  
                     if (dataset.gbifCount == dataset.count) self.synced++;
                     if (dataset.gbifCount < dataset.count) self.underSynced++;
                     if (dataset.gbifCount > dataset.count) self.overSynced++;
                     
                     if (dataset.gbifCount > dataset.count) {
                       console.log(dataset.gbifRegistryKey + " has " + dataset.gbifCount + " instead of " + dataset.count)
                     } 
                                            
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