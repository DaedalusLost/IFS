app.controller( "prefCtrl", function($scope, $http) {
    $scope.prefsList = [];
    $http.get('/preferences/data.json').then(function(res) {
    	console.log(res.data);
        $scope.prefsList = res.data;
    });
});
