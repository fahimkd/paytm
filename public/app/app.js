/**
 * Created by faheem on 22/09/16.
 */
var app = angular.module('paytm', [
  'ngRoute',
  'ngMaterial',
  'ngCookies'
]);

function checkAccess($location, Communicator, $cookies, $http) {
  if ((!Communicator.user || !Communicator.user.id) && !$cookies.get('user')) {
    $location.path('/login');    //redirect user to home.
    alert("You don't have access here");
  } else {
    return $http.get('/api/employee/'+$cookies.get('user'))
      .then(function(result) {
        Communicator.user = result.data;
        Communicator.setShowLogout(true);
        return true;
      });
  }
}

app.config(['$routeProvider', function ($routeProvider) {
  $routeProvider
  .when("/login", {templateUrl: "ui/partials/login.html", controller: "LoginCtrl"})
  .when("/", {templateUrl: "ui/partials/home.html", controller: "HomeCtrl", resolve: {"check" : checkAccess}})
  .when("/add/employee", {templateUrl: "ui/partials/employee-edit.html", controller: "EmployeeCtrl", resolve: {"check" : checkAccess}})
  .when("/employee/:id", {templateUrl: "ui/partials/employee-view.html", controller: "EmployeeCtrl", resolve: {"check" : checkAccess}})
  .when("/employee/:id/edit", {templateUrl: "ui/partials/employee-edit.html", controller: "EmployeeCtrl", resolve: {"check" : checkAccess}})
  .when("/employee/:employee_id/review/:review_id", {templateUrl: "ui/partials/review.html", controller: "ReviewCtrl", resolve: {"check" : checkAccess}})
  .when("/employee/:employee_id/review/:review_id/edit", {templateUrl: "ui/partials/review-edit.html", controller: "ReviewCtrl", resolve: {"check" : checkAccess}})
  .when("/employee/:employee_id/add/review", {templateUrl: "ui/partials/review-edit.html", controller: "ReviewCtrl", resolve: {"check" : checkAccess}})
  .otherwise("/404", {templateUrl: "ui/partials/404.html", controller: "HomeCtrl", resolve: {"check" : checkAccess}});
}]);

app.controller('HeaderCtrl', function ($scope, $location, Communicator, $cookies) {
  $scope.logout = function () {
    $cookies.remove('user');
    Communicator.user = null;
    Communicator.setShowLogout(false);
    $location.path('/login');
  };

  $scope.title = Communicator.title;
  $scope.showLogout = Communicator.showLogout;
});

app.factory('Communicator', function(){
  var title = 'Employee Performance Reviews';
  var showLogout = false;
  return {
    title: function() { return title; },
    setTitle: function(newTitle) { title = newTitle; },
    showLogout: function() { return showLogout; },
    setShowLogout: function(newShow) { showLogout = newShow; },
  };
});

app.controller('LoginCtrl', function ($scope, $location, $http, Communicator, $cookies) {
  Communicator.setTitle('Employee Performance Reviews');
  Communicator.setShowLogout(false);
  $scope.username = '';
  $scope.password = '';
  $scope.login = function () {
    $http.post('/api/login', {username: $scope.username, password: $scope.password})
      .then(function(result) {
        if (result.data && result.data.id) {
          Communicator.user = result.data;
          Communicator.setShowLogout(true);
          $cookies.put('user', result.data.id);
          $location.path('/');
        } else {
          $scope.loginError = true;
        }
      });
  }

});

app.controller('HomeCtrl', function ($scope, $location, $http, $mdPanel, Communicator, $cookies) {
  Communicator.setTitle('Employees');
  $scope.user = Communicator.user;
  $scope._mdPanel = $mdPanel;
  $scope.employees = [];

  $http.get('/api/employees')
    .then(function(result) {
      $scope.employees = result.data;
    });

  $scope.showDialog = function(sourceEmployee) {
    var position = $scope._mdPanel.newPanelPosition()
      .absolute()
      .center();

    var config = {
      attachTo: angular.element(document.body),
      controller: PanelDialogCtrl,
      controllerAs: 'ctrl',
      disableParentScroll: false,
      locals: {items: $scope.employees, sourceEmployeeId: sourceEmployee.id, http: $http},
      templateUrl: 'ui/partials/panel.tmpl.html',
      hasBackdrop: true,
      panelClass: 'demo-dialog-example',
      position: position,
      trapFocus: true,
      zIndex: 1,
      clickOutsideToClose: true,
      escapeToClose: true,
      focusOnOpen: true
    };

    $scope._mdPanel.open(config);
  };

  $scope.viewEmployee = function (employee) {
    $location.path('/employee/'+employee.id);
  };

  $scope.newReview = function (employee) {
    if (employee.id != $cookies.get('user')) {
      $location.path('/employee/'+employee.id+'/add/review');
    } else {
      alert('You cannot submit review for your self!')
    }
  };

  $scope.editEmployee = function (employee) {
    $location.path('/employee/'+employee.id+'/edit');
  };

  $scope.deleteEmployee = function (employee) {
    $http.delete('/api/employee/'+ employee.id)
      .then(function(result) {
        if (result.data.data) {
          $scope.employees.forEach(function (elem, index, arr) {
            if (elem.id == employee.id) {
              arr.splice(index, 1);
            }
          })
        } else {
          alert(result.data.message);
        }
      });
  };

  $scope.addNewEmployee = function () {
    $location.path('/add/employee');
  };


});

app.controller('EmployeeCtrl', function ($scope, $location, $http, $mdPanel, Communicator, $routeParams, $cookies) {
  Communicator.setTitle('Loading Employee....');
  $scope.user = Communicator.user;
  $scope._mdPanel = $mdPanel;
  $scope.user = Communicator.user;

  $scope.employee = {};

  PanelDialogCtrl.repos = $scope.reviews;

  if ($routeParams.id != undefined) {
    $http.get('/api/employee/'+$routeParams.id)
      .then(function(result) {
        Communicator.setTitle(result.data.firstName + ' ' + result.data.lastName);
        $scope.employee = result.data;
      });
  } else {
    Communicator.setTitle('New Employee');
  }

  $scope.viewReview = function (review) {
    $location.path('/employee/'+$routeParams.id+'/review/'+review.id);
  };

  $scope.editReview = function (review) {
    $location.path('/employee/'+$routeParams.id+'/review/'+review.id+'/edit');
  };

  $scope.deleteReview = function (review) {
    $http.delete('/api/review/'+ review.id)
      .then(function(result) {
        if (result.data.data) {
          $scope.reviews.forEach(function (elem, index, arr) {
            if (elem.id == review.id) {
              arr.splice(index, 1);
            }
          })
        }
      });
  };

  $scope.saveEmployee = function (employee) {
    if (employee.id) {
      $http.put('/api/employee/'+ employee.id, employee)
        .then(function(result) {
          $location.path('/');
        });
    } else {
      $http.post('/api/employee', employee)
        .then(function(result) {
          $location.path('/employee/'+ result.data.data.id);
        });
    }
  };

  $scope.cancelEdit = function (employee) {
    $http.post('/api/employee', employee)
      .then(function(result) {
        $location.path('/employee/'+ result.data.data.id);
      });
  };

  $scope.newReview = function (employee) {
    if (employee.id != $cookies.get('user')) {
      $location.path('/employee/'+employee.id+'/add/review');
    } else {
      alert('You cannot submit review for your self!')
    }
  };


});

app.controller('ReviewCtrl', function ($scope, $location, $http, $mdPanel, Communicator, $routeParams, $cookies) {
  Communicator.setTitle('Loding Review....');
  $scope.user = Communicator.user;
  $scope._mdPanel = $mdPanel;
  $scope.review = {questions: []};

  if ($routeParams.review_id != undefined) {
    $http.get('/api/employee/'+$routeParams.employee_id+'/review/'+$routeParams.review_id)
      .then(function(result) {
        $scope.review= result.data;
        $http.get('/api/employee/'+$routeParams.employee_id)
          .then(function(result2) {
            Communicator.setTitle(result2.data.firstName + ' ' + result2.data.lastName + ' - ' + result.data.title);
          });
      });
  } else {
    $scope.review = {
      questions: [
        {"question": "Question 1"},
        {"question": "Question 2"},
        {"question": "Question 3"},
        {"question": "Question 4"}
      ]
    };
    $http.get('/api/employee/'+$routeParams.employee_id)
      .then(function(result2) {
        Communicator.setTitle(result2.data.firstName + ' ' + result2.data.lastName + ' - New Review');
      });
  }

  $scope.submitReview = function (review) {
    if (review.id) {
      return $http.put('/api/review/'+ review.id, review)
        .then(function(result) {
          $location.path('/employee/'+ $routeParams.employee_id);
        });
    } else {
      return $http.get('/api/employee/'+ $cookies.get('user'))
        .then(function(result) {
          review.employee_id = $routeParams.employee_id;
          review.submitted_by = $routeParams.employee_id;
          review.title = 'Submitted by ' + result.data.firstName + ' ' + result.data.lastName;
          return $http.post('/api/review', review)
            .then(function(result) {
              $location.path('/employee/'+ $routeParams.employee_id);
            });
        });
    }
  };

  $scope.cancelSubmit = function () {
    $location.path('/employee/'+ $routeParams.employee_id);
  };

});

function PanelDialogCtrl(mdPanelRef, items, sourceEmployeeId, http) {
  this._mdPanelRef = mdPanelRef;
  self.repos         = items;
  this.sourceEmployeeId = sourceEmployeeId;
  this.http = http;
}

function createFilterFor(query) {
  var lowercaseQuery = angular.lowercase(query);

  return function filterFn(state) {
    return ((state.firstName + ' ' + state.firstName).toLowerCase().indexOf(lowercaseQuery) === 0);
  };

}

PanelDialogCtrl.prototype.fullName = function (item) {
  return item.firstName + ' ' + item.lastName;
}

PanelDialogCtrl.prototype.querySearch = function (query) {
  var results = query ? self.repos.filter( createFilterFor(query) ) : self.repos,
    deferred;
  return results;
}

PanelDialogCtrl.prototype.closeDialog = function() {
  var panelRef = this._mdPanelRef;

  panelRef && panelRef.close().then(function() {
    angular.element(document.querySelector('.demo-dialog-open-button')).focus();
    panelRef.destroy();
  });
};

PanelDialogCtrl.prototype.assign = function() {
  var that =this;
  return this.http.post('/api/assign', {source_employee_id: this.sourceEmployeeId, dest_employee_id: this.selectedItem.id})
    .then(function(result) {
      that.closeDialog();
    });
};

