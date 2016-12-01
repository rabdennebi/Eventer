angular.module('starter.controllers', [])

.controller('VoyagesCtrl', function(DB_CONFIG, $ionicLoading, $location, $ionicHistory, model, $scope, $cordovaSQLite, $ionicPopup, $cordovaToast, $state, Voyage, $ionicModal, $ionicPlatform, $cordovaImagePicker) {
    
    $scope.$on('$ionicView.beforeEnter', function(){
      Voyage.allVoyages().then(function(datas) {
          $scope.Voyages = datas;
          $ionicLoading.hide();
      });
    });

    $ionicModal.fromTemplateUrl('templates/voyage-form.html', {
      scope: $scope,
      animation: 'slide-in-up'}).then(function(modal) {$scope.modalVoyage = modal;});
        
    $ionicPlatform.onHardwareBackButton(function() {
      ionic.Platform.exitApp();
    });

    $scope.Voyageurl = "img/eventer.png";
    
    $scope.openModal = function() {
      $scope.add = true;
      $scope.modalVoyage.show();
    };
    
    $scope.edit = function(id) {
      Voyage.getById(id).then(function(data) {
			  $scope.voyageEdit = data;
			  $scope.datedebut = new Date(data.datedebut);
			  $scope.datefin = new Date(data.datefin);
			  });
      $scope.add = false;
      $scope.modalVoyage.show();
    }
    
    $scope.closeModal = function() {
      $scope.add = false;
      $scope.modalVoyage.hide();
    };
  	
  	$scope.refresh = function() {
      $state.go($state.current, {}, {reload: true});
  	  $scope.$broadcast('scroll.refreshComplete');
  	};
  	
    $scope.ip = function() {
      var options = {
       maximumImagesCount: 1,
       width: 800,
       height: 800,
       quality: 80
      };
  
      $cordovaImagePicker.getPictures(options)
        .then(function (results) {
          for (var i = 0; i < results.length; i++) {
            $scope.Voyageurl = results[i];
          }
        }, function(error) {
          $scope.error = "Select picture error";
        });
    }
    
    $scope.editVoyage = function(voyageEdit, datedebut, datefin) {
      var updateVoyage = {
    		id:voyageEdit.id,
    		estimation:voyageEdit.estimation,
    		Name:voyageEdit.Name,
    		datedebut:new Date(datedebut).getTime(),
    		datefin:new Date(datefin).getTime(),
    		description:voyageEdit.description,
    		url:$scope.Voyageurl
  	  };
		  Voyage.updateVoyage(updateVoyage);
      $state.go($state.current, {}, {reload: true});
		  $scope.modalVoyage.hide();
    }
    
    $scope.addVoyage = function(voyage) {
      var v = {
          estimation:voyage.estimation,
          Name:voyage.Name,
          datedebut:new Date(voyage.datedebut).getTime(),
    			datefin:new Date(voyage.datefin).getTime(),
          description:voyage.description,
          url:$scope.Voyageurl
      };
      Voyage.addVoyages(v);
      $state.go($state.current, {}, {reload: true});
      $scope.modalVoyage.hide();
    }
    
    $scope.remove = function(id) {
         var confirmPopup = $ionicPopup.confirm({
           title: 'Delete event',
           template: 'Are you sure?'
         });
         confirmPopup.then(function(res) {
           if(res) {
            Voyage.removeVoyage(id);
            Voyage.allVoyages().then(function(datas) {
              $state.go($state.current, {}, {reload: true});
            });
           } else {
           }
         });
    }
})
.controller('VoyagesDetailCtrl', function($ionicPopup, Article, $scope, $cordovaImagePicker, $cordovaCamera, $state, $stateParams, Voyage, $ionicModal, Participant, $ionicPlatform) {
  
  $scope.$on('$ionicView.beforeEnter', function(){
      Voyage.getById($stateParams.voyagesId).then(function(data) {
    		  $scope.Voyage = data;
    		});
    	Participant.getAllParticipant($stateParams.voyagesId).then(function(datas){
    		$scope.participants = datas;
    	});
    	Article.articles($stateParams.voyagesId).then(function(data) {
    	  $scope.articles = data;
    	});
    });
		
    $ionicModal.fromTemplateUrl('templates/algo.html', {
      scope: $scope,
      animation: 'slide-in-up'}).then(function(modal) {$scope.modalAlgo = modal;});
    
    $scope.algo = function(id) {
      $scope.modalAlgo.show();
      Voyage.Algo(id).then(function(res) {
        console.log(res);
        $scope.algo = res;
      });
    };

    $scope.openAlgo = function() {
      
    }

    $scope.closeAlgo = function() {
      $scope.modalAlgo.hide();
    }

		$scope.newArticle = function() {
      $scope.modalArt.show();
    }
    
    $ionicModal.fromTemplateUrl('templates/article-form.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function(modal) {
      $scope.modalArt = modal;
    });
    
  $scope.participantsURL = "img/eventer.png";
  $scope.vID = $stateParams.voyagesId;
  
  $ionicModal.fromTemplateUrl('templates/participants-form.html', {
    scope: $scope,
    animation: 'slide-in-up',
    hardwareBackButtonClose: true,
    focusFirstInput: true
  }).then(function(modalp) {
    $scope.modal1 = modalp;
  });
  
  $scope.openModal = function() {
    $scope.modal1.show();
  };
  
  $scope.close = function() {
    $scope.modal1.hide();
  };
  
  $scope.closeModalA = function() {
    $scope.modalArt.hide();
  }
  
  $scope.addArticle = function(a) {
    var article = {
			id_Voyage:$stateParams.voyagesId,
			id_Participant:a.contributorId,
			status:1,
			Name:a.Name,
			Categorie : a.Categorie,
			Prix: a.Prix,
			Commentaire: '',
			date:Date.now()
  	};
  	
  	Article.addArticleToUser(article).then(function(data) {
  	  $state.go($state.current, {}, {reload: true});
  	});
  	
  	$scope.modalArt.hide();
  };
  
  $scope.refresh = (function() {
	  $state.go($state.current, {}, {reload: true});
  	$scope.$broadcast('scroll.refreshComplete');
  });
  
	$scope.ip = function() {
      var options = {
       maximumImagesCount: 1,
       width: 400,
       height: 400,
       quality: 80
      };
  
      $cordovaImagePicker.getPictures(options)
        .then(function (results) {
          for (var i = 0; i < results.length; i++) {
            $scope.participantsURL = results[i];
          }
        }, function(error) {
          $scope.error = "Select picture error";
        });
    }
  
  $scope.addUser = function(user) {
    var insertuser = {
			id_Voyage:$scope.vID,
			Name:user.Name,
			budget:user.Budget,
			url:$scope.participantsURL
		};
		
		Participant.insertParticipant(insertuser).then(function(data) {

		});
		
		Participant.getAllParticipant($scope.vID).then(function(datas) {
  		 $state.go($state.current, {}, {reload: true});
		});

    $scope.modal1.hide();
  };
  
  $scope.remove = function(id) {
    
    var confirmPopup = $ionicPopup.confirm({
           title: 'Delete contributor',
           template: 'Are you sure?'
         });
         confirmPopup.then(function(res) {
           if(res) {
             Participant.removeParticipant(id);
             Participant.getAllParticipant($stateParams.voyagesId).then(function(datas){
          			$state.go($state.current, {}, {reload: true});
          		});
           } else {

           }
         });
  }
  
})
.controller('ParticipantsDetailCtrl', function($cordovaImagePicker, $ionicPopup, $scope, Article, $stateParams, $ionicModal, Voyage, Participant, $state, $ionicPlatform) {
  $scope.userUrl = "img/eventer.png";
  $ionicModal.fromTemplateUrl('templates/participants-edit.html', {
      scope: $scope,
      animation: 'slide-in-up',
      hardwareBackButtonClose: true,
      focusFirstInput: true
    }).then(function(modal) {
      $scope.modal = modal;
    });

    $scope.close = function() {
      $scope.modal.hide();
    }
    $scope.open = function() {
      $scope.modal.show();
    }

  var id = {
    id_Voyage:$stateParams.voyagesId,
    id_Participant:$stateParams.participantsId
  };
  
  var idp = {
    idVoyage:$stateParams.voyagesId,
    idParticipant:$stateParams.participantsId
  };
  
  $scope.edit = function(id) {
    Participant.getParticipant(idp).then(function(data) {
      $scope.userEdit = data[0];
    });
    $scope.modal.show();
  };

  $scope.$on('$ionicView.beforeEnter', function(){
      var id = {
        id_Voyage:$stateParams.voyagesId,
        id_Participant:$stateParams.participantsId
      };
      
      var idp = {
        idVoyage:$stateParams.voyagesId,
        idParticipant:$stateParams.participantsId
      };
      
      Participant.getParticipant(idp).then(function(data) {
        $scope.user = data[0];
      });
      
      Article.articlesByUser(id).then(function(data) {
        $scope.articles = data;
      });
    });
  
  $scope.refresh = (function() {
    Participant.getParticipant(idp).then(function(data) {
      $scope.user = data[0];
    });
	  Article.articlesByUser(id).then(function(data) {
      $scope.articles = data;
    });
  	$scope.$broadcast('scroll.refreshComplete');
  });

  $scope.EditUser = function(userEdit) {
    var updatParticipant = {
      Name:userEdit.Name,
      url:$scope.userUrl,
      id:userEdit.id,
      budget:userEdit.budget  
    }
    Participant.updatParticipant(updatParticipant);
    $state.go($state.current, {}, {reload: true});
    $scope.modal.hide();
  };
  
  $scope.ip = function() {
      var options = {
       maximumImagesCount: 1,
       width: 400,
       height: 400,
       quality: 80
      };
  
      $cordovaImagePicker.getPictures(options).then(function (results) {
          for (var i = 0; i < results.length; i++) {
            $scope.userUrl = results[i];
          }
        }, function(error) {
          $scope.error = "Select picture error";
        });
    }

  $scope.remove = function(id) {
    var id2 = {
      id_Voyage:$stateParams.voyagesId,
      id_Participant:$stateParams.participantsId
    };
    var confirmPopup = $ionicPopup.confirm({
           title: 'Delete article',
           template: 'Are you sure?'
         });
         confirmPopup.then(function(res) {
           if(res) {
             Article.removeArticle(id);
             Article.articlesByUser(id2).then(function(data) {
                $scope.articles = data;
              });
           } else {
           }
         });
  }
  
});
  