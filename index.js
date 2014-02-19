var connect = require('connect');
var login = require('./login');

var app = connect();

app.use(connect.json()); // Parse JSON request body into `request.body`
app.use(connect.urlencoded()); // Parse form in request body into `request.body`
app.use(connect.cookieParser()); // Parse cookies in the request headers into `request.cookies`
app.use(connect.query()); // Parse query string into `request.query`

app.use('/', main);

function main(request, response, next) {
	switch (request.method) {
		case 'GET': get(request, response); break;
		case 'POST': post(request, response); break;
		case 'DELETE': del(request, response); break;
		case 'PUT': put(request, response); break;
	}
};

function get(request, response) {
	var cookies = request.cookies;
	console.log(cookies);
	if ('session_id' in cookies) {
		var sid = cookies['session_id'];
		if ( login.isLoggedIn(sid) ) {
			response.setHeader('Set-Cookie', 'session_id=' + sid);
			response.end(login.hello(sid));	
		} else {
			response.end("Invalid session_id! Please login again\n");
		}
	} else {
		response.end("Please login via HTTP POST\n");
	}
};


function post(request, response) {
	var cookies = request.cookies;
	console.log(cookies);

	console.log("Hello There "+request.body.name);
	var newSessionId = login.login(request.body.name, request.body.email);
    response.setHeader('Set-Cookie', 'session_id=' + newSessionId);
	response.end(login.hello(newSessionId));
};

function del(request, response) {
	console.log("DELETE:: Logout from the server");
	var cookies = request.cookies;
	console.log(cookies);
	if ('session_id' in cookies) {
		var sid = cookies['session_id'];
		if(login.isLoggedIn(sid))
		{
		login.logout(sid);
		response.end('Logged out from the server\n');
		}
		else
		{
			response.end('Invalid command\n');
		}
	}
	else
	{
			response.end('Invalid command\n');
	}

 	// TODO: remove session id via login.logout(xxx)
 	// No need to set session id in the response cookies since you just logged out!
  
};

function put(request, response) {
	console.log("PUT:: Re-generate new seesion_id for the same user");
	// TODO: refresh session id; similar to the post() function
	var cookies = request.cookies;
	if ('session_id' in cookies) {

		var sid = cookies['session_id'];
		response.setHeader('Old session_id' , sid);
		var obj = login.getmap(sid);
		var newSessionId = login.login(obj.name, obj.email);
		delete login.sessionMap[sid];
		//del(request,response);
    	response.setHeader('New session_id' ,newSessionId);
    	response.end("Refreshed Session\n");
		
	}
	else
	{
    //del(request,response);
		response.end("No session id to refresh\n");
	}
};




app.listen(8000);

console.log("Node.JS server running at 8000...");
