var promiseTimeout = function (func, time) {
  var defer = oath.defer();
  setTimeout(function () {
    defer.resolve(func());
  }, time);
  return defer.promise;
};



// Since objects only compare === to the same object (i.e. the same reference)
// we can do something like this instead of using integer enums because we can't
// ever accidentally compare these to other values and get a false-positive.
//
// For instance, `rejected === resolved` will be false, even though they are
// both {}.
var rejected = {}, resolved = {}, waiting = {};

function logStatus(status){
  if(status == rejected) {
    return "Rejected"
  } else if(status == resolved) {
    return "Resolved"
  } else if(status == waiting) {
    return "Waiting"
  } else {
    return "Other"
  }

}


// This is a promise. It's a value with an associated temporal
// status. The value might exist or might not, depending on
// the status.
var Promise = function (value, status) {
  this.status = status || waiting;
  if (this.status === waiting) {
    this.value = value;
  }
};

// The user-facing way to add functions that want
// access to the value in the promise when the promise
// is resolved.
Promise.prototype.then = function (success, _failure) {
  // success = success || 'success';
  // _failure = _failure || 'failure';
  var that = this;
  console.log(this);
  console.log(logStatus(this.status));
  if (this.status === waiting) {
    console.log('waiting');
    setTimeout(function() {that.then(success, _failure)}, 1);
  } else if (this.status === resolved) {
    success(this.value);
    console.log("Here", this);
    return this;
  } else if (this.status === rejected) {
    console.log('rejected');
    this.catch(_failure);
  }
  // see if the status is waiting
    // if so look again in 1 second
    // if resolved then success()
  console.log('then');
};


// The user-facing way to add functions that should fire on an error. This
// can be called at the end of a long chain of .then()s to catch all .reject()
// calls that happened at any time in the .then() chain. This makes chaining
// multiple failable computations together extremely easy.
Promise.prototype.catch = function (failure) {
  var that = this;
  if (this.status === waiting) {
    setTimeout(function() {that.catch(failure)}, 1);
  } else if (this.status === rejected) {
    if (this.error) {
      failure(this.error);
    } else {
      failure();
    }
  }
};



// This is the object returned by defer() that manages a promise.
// It provides an interface for resolving and rejecting promises
// and also provides a way to extract the promise it contains.
var Deferred = function (promise) {
  this.promise = promise;
};

// Resolve the contained promise with data.
//
// This will be called by the creator of the promise when the data
// associated with the promise is ready.
Deferred.prototype.resolve = function (data) {
  this.promise.status = resolved;
  this.promise.value = data;

  console.log('resolve');
};

// Reject the contained promise with an error.
//
// This will be called by the creator of the promise when there is
// an error in getting the data associated with the promise.
Deferred.prototype.reject = function (error) {
  this.promise.status = rejected;
  this.promise.error = error;
};

// The external interface for creating promises
// and resolving them. This returns a Deferred
// object with an empty promise.
var defer = function () {
  var promise = new Promise();
  var deferred = new Deferred(promise);
  return deferred;
};


module.exports.defer = defer;

