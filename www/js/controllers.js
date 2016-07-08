angular.module('eBottle')

.controller('LoginCtrl', function($scope, LoginService, SignInService, $ionicPopup, $state, $q, UserService, $ionicLoading){
	$scope.data = {};
	$scope.login = function(){
    var usr = {
    "emailId": $scope.data.username,
    "password": $scope.data.password
  };
		console.log("the username is "+ $scope.data.username + " PW is " +$scope.data.password);
		LoginService.loginUser($scope.data.username, $scope.data.password).success(function(data) {
            $state.go('app.home');
        }).error(function(data) {
            var alertPopup = $ionicPopup.alert({
                title: 'Login failed!',
                template: 'Please check your credentials!'
            });
        });
    // SignInService.signIn(usr).then(successCallback, errorCallback);
    // function successCallback(response){
    //   if(response.data.success === true){
    //     $state.go('app.home');
    //     console.log("successCallback", response);
    //   } else{
    //     var alertPopup = $ionicPopup.alert({
    //       title: 'Login failed!',
    //       template: 'Please check your credentials!'
    //     });
    //     console.log('SuccessCallback', response);
    //   }
    // };

    // function errorCallback(response){
    //   var alertPopup = $ionicPopup.alert({
    //       title: 'Login failed!',
    //       template: 'Something Went Wrong!'
    //   });
    //   console.log('errorCallback', response);
    // };
	};

  // This is the success callback from the login method
  var fbLoginSuccess = function(response) {
    if (!response.authResponse){
      fbLoginError("Cannot find the authResponse");
      return;
    }

    var authResponse = response.authResponse;

    getFacebookProfileInfo(authResponse)
    .then(function(profileInfo) {
      // For the purpose of this example I will store user data on local storage
      UserService.setUser({
        authResponse: authResponse,
        userID: profileInfo.id,
        name: profileInfo.name,
        email: profileInfo.email,
        picture : "http://graph.facebook.com/" + authResponse.userID + "/picture?type=large"
      });
      $ionicLoading.hide();
      $state.go('app.home');
    }, function(fail){
      // Fail get profile info
      console.log('profile info fail', fail);
    });
  };

  // This is the fail callback from the login method
  var fbLoginError = function(error){
    console.log('fbLoginError', error);
    $ionicLoading.hide();
    var alertPopup = $ionicPopup.alert({
                title: 'Login failed!'
            });
  };

  // This method is to get the user profile info from the facebook api
  var getFacebookProfileInfo = function (authResponse) {
    var info = $q.defer();

    facebookConnectPlugin.api('/me?fields=email,name&access_token=' + authResponse.accessToken, null,
      function (response) {
        console.log(response);
        info.resolve(response);
      },
      function (response) {
        console.log(response);
        info.reject(response);
      }
    );
    return info.promise;
  };

  //This method is executed when the user press the "Login with facebook" button
  $scope.facebookSignIn = function() {
    facebookConnectPlugin.getLoginStatus(function(success){
      if(success.status === 'connected'){
        // The user is logged in and has authenticated your app, and response.authResponse supplies
        // the user's ID, a valid access token, a signed request, and the time the access token
        // and signed request each expire
        console.log('getLoginStatus', success.status);

        // Check if we have our user saved
        var user = UserService.getUser('facebook');

        if(!user.userID){
          getFacebookProfileInfo(success.authResponse)
          .then(function(profileInfo) {
            // For the purpose of this example I will store user data on local storage
            UserService.setUser({
              authResponse: success.authResponse,
              userID: profileInfo.id,
              name: profileInfo.name,
              email: profileInfo.email,
              picture : "http://graph.facebook.com/" + success.authResponse.userID + "/picture?type=large"
            });

            $state.go('app.home');
          }, function(fail){
            // Fail get profile info
            console.log('profile info fail', fail);
          });
        }else{
          $state.go('app.home');
        }
      } else {
        // If (success.status === 'not_authorized') the user is logged in to Facebook,
        // but has not authenticated your app
        // Else the person is not logged into Facebook,
        // so we're not sure if they are logged into this app or not.

        console.log('getLoginStatus', success.status);

        $ionicLoading.show({
          template: 'Logging in...'
        });

        // Ask the permissions you need. You can learn more about
        // FB permissions here: https://developers.facebook.com/docs/facebook-login/permissions/v2.4
        facebookConnectPlugin.login(['email', 'public_profile'], fbLoginSuccess, fbLoginError);
      }
    });
  };
})

.controller('MenuCtrl', function($scope, $ionicConfig, UserService, $state, $window, $ionicSideMenuDelegate) {

  $scope.width = function () {
    return $window.innerWidth;
  };
  
  $scope.openMenu = function() {
    $ionicSideMenuDelegate.toggleRight(true);
  };

  var data = UserService.getUser();
  document.getElementById("userName").innerHTML = data.name;
  var image = document.getElementById("userPic");
  image.src = data.picture;
  console.log(data.email);
  $scope.user = {email: data.email};

  $scope.goBack = function(){
    console.log('I got clicked');
    $state.go('app.home');
  };

})

.controller('SignupCtrl', function($scope, $state, $ionicPopup, $http){

	$scope.authorize = {
		fullname: '',
		email: '',
		phoneNumber: '',
		password: ''
	};

  var date = new Date();
  $scope.fromDate = date.getFullYear() + '-' + ('0' + (date.getMonth() + 1)).slice(-2) + '-' + ('0' + date.getDate()).slice(-2);

  function IDGenerator() {
   
     this.length = 8;
     this.timestamp = +new Date;
     
     var _getRandomInt = function( min, max ) {
      return Math.floor( Math.random() * ( max - min + 1 ) ) + min;
     }
     
     this.generate = function() {
       var ts = this.timestamp.toString();
       var parts = ts.split( "" ).reverse();
       var id = "";
       
       for( var i = 0; i < this.length; ++i ) {
        var index = _getRandomInt( 0, parts.length - 1 );
        id += parts[index];  
       }
       
       return id;
     }

     
   };

   var id = new IDGenerator();

  $scope.otpPopup = function(form){

		if(form.$valid){
			var req = {
				method: 'POST',
        //below url is for the local dev only ruunning on the browser
				//url: '/api/signup',
        //below url is for the production app running on the device
        url: 'http://eazybottle.com/EWS/app/user/signup',
				headers: {
					'Content-Type': 'application/json'
				},
				//data: $scope.authorize
        //data: "fName="+$scope.authorize.fullname+ "&lName=" +$scope.authorize.fullname+ "&emailId=" +$scope.authorize.email+ "&password=" +$scope.authorize.password+ "&phoneNumber=" +$scope.authorize.phoneNumber+ "&deviceId=dfa&deviceModel=daf&platform=adf"
        data: {
          "personId": id.generate(),
          "createdDate": $scope.fromDate,
          "dob": null,
          "emailId": $scope.authorize.email,
          "firstname": $scope.authorize.fullname,
          "gender": null,
          "lastname": null,
          "phone": $scope.authorize.phoneNumber
         
        }
			};

			$http(req).then(successCallback, errorCallback);
			function successCallback(response){
				console.log('the api success callback' + response);
				$scope.data = {};
				var myPopup = $ionicPopup.show({
					template: '<input type="text" ng-model="data.otp">',
					title: 'Verification',
					subTitle: 'Please enter the OTP',
					scope: $scope,
					buttons: [{text: 'Resend OTP',
            onTap: function(e){
              e.preventDefault();
              $http({
                  //url: '/api/doRegenerateOtp',
                  url: 'http://eazybottle.com/EWS/app/user/regenerateOTP',
                  method: "GET",
                  params: {phone: $scope.authorize.phoneNumber}
                }).then(function successCallback(response) {
                  console.log("successCallback", response)
                }, function errorCallback(response) {
                  console.log("errorCallback", response)
                });
            }
          },
					{
						text: '<b>Submit</b>',
						type: 'button-positive',
						onTap: function(e) {
							if (!$scope.data.otp) {
								//don't allow the user to close unless he enters OTP
								e.preventDefault();
							} else {
								// $state.go('app.home');
								// return $scope.data.otp;
                $http({
                  //url: '/api/doValidOtp',
                  url: 'http://eazybottle.com/EWS/app/user/validateOTP',
                  method: "GET",
                  params: {otp: $scope.data.otp}
                }).then(function successCallback(response) {
                  console.log("successCallback", response)
                  var data = response;
                  if(data.success){
                    $state.go('app.home');
                  }
                }, function errorCallback(response) {
                  console.log("errorCallback", response)
                });
							}
						}
					}]
				});
			};

			function errorCallback(response){
				console.log('the api errorCallback', response);
			};
		} else{
			console.log("Form is invalid");
		}
  }
})

.controller('HealthCtrl', function($scope, $state, $ionicPopup){
	$scope.health = {
    weight: '',
    height: ''
  };
	$scope.bmicalc = function(){
		var x = $scope.health.height/100;
		var y = $scope.health.weight * 0.453592;
		$scope.bmi = (y/(x *x)) || '';
		console.log($scope.bmi);
	}
	$scope.calculate = function(){
		console.log('calculate button got click event');
		console.log($scope.health.weight);
    var weightCal = $scope.health.weight;
		//var myPopup = this;
		var myPopup = $ionicPopup.show({
      template: '<b> {{0.5 * health.weight + 16}} </b>',
      title: 'Result',
      scope: $scope,
      buttons: [
        {
          text: '<b>Done</b>',
          type: 'button-positive',
          onTap: function() {
						if(angular.isUndefined($scope.health.weight)){
							console.log("the weight is undefined");
						}
            $state.go('app.record');
          }
        }
      ]
    }).then(function(res){
			console.log(res);
			console.log($scope.health.weight);
		});
	}
})

.controller('HomeCtrl', function($scope, HomeService, $state, $ionicModal){

  // var vm = $scope;
  // vm.vendorData = [];

  // VendorService.getVendor().then(successCallback, errorCallback);
  // function successCallback(res){
  //   console.log(res);
  //   vm.vendorData = res.data;
  //   console.log(vm.vendorData);
  // };

  // function errorCallback(res){
  //   console.log("Vendor api errorCallback", res);
  // };

  // $ionicModal.fromTemplateUrl('templates/cert-modal.html', {
  //     scope: vm,
  //     animation: 'slide-in-up',
  //  }).then(function(modal) {
  //     vm.modal = modal;
  //     //vm.ISI = src;
  //  });

  //   vm.openModal = function() {
  //     vm.modal.show();
  //   };
  
  //   vm.closeModal = function() {
  //     vm.modal.hide();
  //   };
  
  //  //Cleanup the modal when we're done with it!
  //   vm.$on('$destroy', function() {
  //     vm.modal.remove();
  //   });
  // vm.openCertificate = function(src){
  //   //vm.ISI = 'img/ionic.jpg';
  //   console.log("the click event is received");
  //   vm.openModal();
  //   vm.companyISI = 'img/ionic.png';
  // }
  // vm.openCart = function(){
  //   $state.go('app.cart');
  // }

  $scope.product = [  
      {  
         "productId":1,
         "description":"Water on demand service",
         "name":"Get Me a Bottle",
         "noOfBottles":1,
         "offer":{  
            "offerId":1,
            "description":"",
            "discount":0,
            "freeBottles":0,
            "name":"Water On Demand"
         }
      },
      {  
         "productId":3,
         "description":"Buy 10 bottles to get free {0} bottles free",
         "name":"Goldify My Bottles",
         "noOfBottles":10,
         "offer":{  
            "offerId":3,
            "description":"",
            "discount":0,
            "freeBottles":2,
            "name":"Gold Offer"
         }
      },
      {  
         "productId":4,
         "description":"Buy 15 bottles to get {0} bottles free",
         "name":"Planinum Maximum",
         "noOfBottles":15,
         "offer":{  
            "offerId":4,
            "description":"",
            "discount":0,
            "freeBottles":3,
            "name":"Platinum Offer"
         }
      },
      {  
         "productId":2,
         "description":"Buy 5 bottles to get {0} bottle free",
         "name":"Silverize My Service",
         "noOfBottles":5,
         "offer":{  
            "offerId":2,
            "description":"",
            "discount":0,
            "freeBottles":1,
            "name":"Silver Offer"
         }
      },
      {  
         "productId":5,
         "description":"Let us know your business requirements",
         "name":"Water Your Business",
         "noOfBottles":0,
         "offer":{  
            "offerId":5,
            "description":"",
            "discount":10,
            "freeBottles":0,
            "name":"Biz Offer"
         }
      }
   ];

  // HomeService.getProduct().then(successCallback, errorCallback);
  // function successCallback(res){
  //   console.log(res);
  //   $scope.product = res.data.response;
  // };

  // function errorCallback(res){
  //   console.log(res);
  // };

})

.controller('BottleCtrl', function($scope, $state){

  $scope.recEvent= {
    isTrue : false
  };

  $scope.delivery = function(str){
    if(str === 'bottle'){
      $scope.recEvent.isTrue = false;
      //$state.go('app.recTime');
      $state.go('app.setTime');
    } else{
      $scope.recEvent.isTrue = true;
      $state.go('app.recTime');
    }
  }

  $scope.contd = function(){
    $state.go('app.cart');
  }

  $scope.showTimePicker = function() {    
    var options = {date: new Date(), mode: 'time'};      
    $cordovaDatePicker.show(options).then(function(date){
        $scope.timeFieldInModel = date;
    });
  }
})

.controller('CartCtrl', function($scope){

})

.controller('OrderCtrl', function($scope){
    $scope.ordersData = [
    {
        "orderID": 23456,
        "oderDate": new Date().getDate(),
        "orderStatus": "Processing",
        "orderMessage": "Your Order is Under way!",
        "currentOrder": true
    },
    {
        "orderID": 23455,
        "oderDate": new Date().getDate(),
        "orderStatus": "Completed",
        "orderMessage": "Your delivery is successfully completed",
        "currentOrder": false
    },
    {
        "orderID": 23454,
        "oderDate": new Date().getDate(),
        "orderStatus": "Cancelled",
        "orderMessage": "Your order has been cancelled!",
        "currentOrder": false
    }];
})

.controller('RecordCtrl', function($scope){

})
