angular.module('eBottle')

.service('LoginService', function($q){
	return {
		loginUser: function(name, pw) {
			var deferred = $q.defer();
            var promise = deferred.promise;
 
            if (name == '1' && pw == '1') {
                deferred.resolve();
            } else {
                deferred.reject('Wrong credentials.');
            }
            promise.success = function(fn) {
                promise.then(fn);
                return promise;
            }
            promise.error = function(fn) {
                promise.then(null, fn);
                return promise;
            }
            return promise;
        }
	}
})

.service('SignInService', function($http){
  var url = '/api/signIn';
  var signIn = function(usr){
    var req = {
      method: 'POST',
      url: url,
      headers: {
        'Content-Type': 'application/json'
      },
      data: usr
    };
    return $http(req);
  };

  return{
    signIn: signIn
  };
})

.service('UserService', function() {
  // For the purpose of this example I will store user data on ionic local storage but you should save it on a database
  var setUser = function(user_data) {
    window.localStorage.starter_facebook_user = JSON.stringify(user_data);
  };

  var getUser = function(){
    return JSON.parse(window.localStorage.starter_facebook_user || '{}');
  };

  return {
    getUser: getUser,
    setUser: setUser
  };
})

.service('VendorService', function($http){

  var baseUrl = '/api/vendor/';
  //var baseUrl = 'http://eazybottle.com/EWS/app/vendor/';
  var getVendor = function(){
    return $http.get(baseUrl);
  };

  return {
    getVendor : getVendor
  };
})


.service('HomeService', function($http){
  var url = '/api/product';

  var getProduct = function(){
    return $http.get(url);
  };

  return {
    getProduct : getProduct
  };
})