///////////////////////////////////////////////////////////// IMPLEMENT PAYPAL /////////////
//var PaypalExpress = require('../../libs/paypal-express').PaypalExpress;

// -> Load paynode
var payflow = require('paynode').use('payflowpro');

// -> Create a paypal client
var client = payflow.createClient({
	level: payflow.levels[ process.env.DEV ? 'sandbox' : 'live' ] , 
	user: process.env.PAYPAL_ID, 
	password: process.env.PAYPAL_SECRET, 
	signature: process.env.PAYPAL_SIGNATURE 
}); 

// -> Set paypal url
var PAYPAL_URL = 'https://www.'+(process.env.DEV ? 'sandbox.' : '')+'paypal.com'; 

// -> Bind addon
module.exports =  function(server, app) {

	// -> Logs
	tools.log('Paypal express load : OK');

	// -> Bind pay url
	app.get('/paypal/start', function(req, res) {

		var item = {
			price: 1
		}

		// Init payment
		client.setExpressCheckout({ 
			returnurl: req.protocol + '://' + req.headers.host+'/paypal/confirm',
			cancelurl: req.protocol + '://' + req.headers.host+'/paypal/abort',
			paymentrequest:[{
				amt:'241.96', 
				currencycode: 'EUR', 
				items: [
					{name: 'Parure Paris', amt: '234.00'},
					{name: 'Comission PayPal (3.40%)', amt: '7.96'}
				]
			}] 
		})

		// Payment is ok
		.on('success', function(response){ 
			req.session.paypal_token = response.token;
			res.redirect(PAYPAL_URL + '/cgi-bin/webscr?cmd=_express-checkout&token='+req.session.paypal_token);
		})

		// User canceled payment
		.on('failure', function(response){ 
			console.log(response)
			res.render('paypal_error.html', {error:response.errors[0].longmessage}) 
		})

	})

	// -> Bind route for confirming buy
	app.get('/paypal/confirm', function(req, res) {

		console.log("Prepare confirm page :: "+req.path)

		req.session.paypal_token = req.param('token');
		req.session.paypal_payerid = req.param('PayerID');

		client.getExpressCheckoutDetails({
			token: req.param('token')
		})

		.on('success', function(response){
			console.log(response, req.param('token'), req.session.paypal_token)
			req.session.paypal_paymentrequest = response.paymentrequest;
			res.render('paypal_confirm.html', {
				paypalResponse: response,
				orderTotal: response.paymentrequest[0].amt
			})     
		})
		.on('failure', function(response){
			res.render('paypal_error.html', {
				error: response.errors[0].longmessage
			})
		})

	}) ;

	// -> Bind route when item is bought
	app.post('/paypal/final', function(req, res) {

		console.log("Receive response :: "+req.path)

		var paymentrequest = [];
		console.log(req.session.paypal_paymentrequest) ;
		req.session.paypal_paymentrequest.forEach(function(order){
       		paymentrequest.push({amt:order.amt, paymentaction:'Sale', currencycode: 'EUR'})
     	})

		var request = {
			token: req.session.paypal_token,
			payerid: req.session.paypal_payerid,
			paymentrequest: paymentrequest
		}

		client.doExpressCheckoutPayment(request)
			.on('success', function(response){
				res.render('paypal_final.html')
			})
			.on('failure', function(response){
				console.log(response.errors)
				res.render('paypal_error.html', {locals:{error:response.errors[0].longmessage}})
			})

	}) ;

	
}
