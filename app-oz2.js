var sync = angular.module('dataset', []);

sync.controller('DatasetController', ['$http', function($http) {
    var self = this;

    // list the GBIF registered datasets from Australia
    var gbifList = 'https://api.gbif.org/v1/dataset?country=AU&limit=1000';
    
    // inventories from ALA
    var alaProviders = 'http://collections.ala.org.au/ws/dataProvider/';
    var alaInsitutions = 'http://collections.ala.org.au/ws/institution/';
    var alaResources = 'http://collections.ala.org.au/ws/dataResource/';


    self.datasets = [];
    self.institutions = [];
    self.dataProviders = [];
    self.dataResources = [];
    
    
    
    self.load = function () {
      console.log("Loading");
    
      // worst code ever follows
      $http.get(gbifList).then(function (response) {
        self.datasets = response.data.results;
        
        $http.get(alaInsitutions).then(function (response) {
          self.institutions = response.data;
          
          $http.get(alaProviders).then(function (response) {
            self.dataProviders = response.data;
            
           
            $http.get(alaResources).then(function (response) {
              self.dataResources = response.data;
              
              // load the organisation from GBIF
              angular.forEach(self.datasets, function(dataset) {
                $http.get("https://api.gbif.org/v1/organization/" + dataset.publishingOrganizationKey).then(function (response) {
                  dataset.publishingOrganization = response.data;
                  
                  
                  // try and match to ALA
                  angular.forEach(self.dataProviders, function(alaProvider) {
                    if (alaProvider.name == dataset.publishingOrganization.title) {
                      dataset.alaProvider = alaProvider;                      
                    }
                  })
                  angular.forEach(self.institutions, function(alaInstitution) {
                    if (alaInstitution.name == dataset.publishingOrganization.title) {
                      dataset.alaInstitution = alaInstitution;                      
                    }
                  })
                  angular.forEach(self.dataResources, function(alaDataResource) {
                    if (alaDataResource.name == dataset.title) {
                      dataset.alaDataResource = alaDataResource;                      
                    }
                  })
                });

                $http.get("https://api.gbif.org/v1/occurrence/search?datasetKey=" + dataset.key).then(function (response) {
                  console.log(response);
                  dataset.count = response.data.count;
                })

                
              });

              
              
            }); 
          });          
        });  
      });
    
    }
    
    self.load();
}]);