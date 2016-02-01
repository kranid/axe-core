describe('utils.queue', function () {
	'use strict';

	it('should be a function', function () {
		assert.isFunction(utils.queue);
	});

	describe('defer', function () {
		it('should be a function', function () {
			var q = utils.queue();
			assert.isFunction(q.defer);
		});

		it('should push onto the "utils.queue"', function (done) {
			var q = utils.queue();

			q.defer(function (resolve) {
				setTimeout(function () {
					resolve(1);
				}, 0);
			});

			q.defer(function (resolve) {
				setTimeout(function () {
					resolve(2);
				}, 0);
			});

			q.then(function (data) {
				assert.deepEqual(data, [1, 2]);
				done();
			});
		});

		it('should execute resolve immediately if defered functions are already complete', function () {
			var q = utils.queue(),
				complete = false;

			q.defer(function (resolve) {
				resolve(1);
			});

			q.defer(function (resolve) {
				resolve(2);
			});

			q.then(function (data) {
				complete = true;
				assert.deepEqual(data, [1, 2]);
			});

			assert.isTrue(complete);

		});

	});

	describe('then', function () {
		it('should be a function', function () {
			var q = utils.queue();
			assert.isFunction(q.then);
		});

		it('should execute immediately if utils.queue is complete', function () {
			var q = utils.queue();
			var result = false;

			q.then(function () {
				result = true;
			});

			assert.isTrue(result);
		});

	});

	describe('abort', function () {
		it('should be a function', function () {
			var q = utils.queue();
			assert.isFunction(q.abort);
		});


		it('stops `then` from being called', function (done) {
			var q = utils.queue();

			q.defer(function (resolve) {
				setTimeout(function () {
					resolve(true);
				}, 100);
			});

			q.then(function () {
				assert.ok(false, 'should not execute');
			});
			q.catch(function () {});

			setTimeout(function () {
				var data = q.abort();
				assert.ok(true, 'Queue aborted');
				assert.isFunction(data[0]);
				done();
			}, 1);

		});

		it('sends a message to `catch`', function (done) {
			var q = utils.queue();
			q.defer(function () {});

			q.then(function () {});
			q.catch(function (err) {
				assert.equal(err, 'Super sheep');
				done();
			});

			q.abort('Super sheep');
		});

	});

	describe('catch', function () {
		it('is called when defer throws an error', function (done) {
			var q = utils.queue();
			q.defer(function () {
				throw 'error! 1';
			});

			q.catch(function (e) {
				assert.equal(e, 'error! 1');
				done();
			});
		});

		it('can catch error synchronously', function (done) {
			var q = utils.queue();
			var sync = true;
			q.defer(function () {
				throw 'error! 2';
			});

			q.catch(function (e) {
				assert.equal(e, 'error! 2');
				assert.ok(sync, 'error caught in sync');
				done();
			});
			sync = false;
		});

		it('is called when the reject method is called', function (done) {
			var q = utils.queue();
			var errorsCaught = 0;

			q.defer(function (resolve, reject) {
				setTimeout(function () {
					reject('error! 2');
				}, 1);
			});

			q.catch(function (e) {
				assert.equal(e, 'error! 2');
				errorsCaught += 1;
				done();
			});
		});

		it('will not run `then` if an error is thrown', function (done) {
			var q = utils.queue();
			q.defer(function () {
				throw 'error! 3';
			});

			q.then(function () {
				assert.ok(false, 'Should not be called');
			});
			q.catch(function (e) {
				assert.equal(e, 'error! 3');
				done();
			});
		});

	});

});