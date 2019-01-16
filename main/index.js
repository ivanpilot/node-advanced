const express = require('express');
const app = express();

function doWork(duration) {
    //we are simply trying to jam the CPU by mocking intensive CPU operations to see how clustering can help enhancing efficiency of our node program
    
    const start = Date.now();
    while(Date.now() - start < duration) {}
}

app.get('/', (req, res) => {
    doWork(5000);
    // the doWork will be managed by the event loop. keep in mind that the event loop is single threaded so while this event-loop is working for 5s it will not do anything else!!
    // this means that our entire server cannot do anything for 5s
    // in pratice that means that if 2 users ask for the same url resources at almost the same time one after the other one, the server receives the first request and immediately the second one - it processes the first request for 5 second and then only when it is done it process the second request for another 5 sec so in total it takes 10 sec for the second user to see the requested resource
    res.send('Hi there');
});

app.listen(3000);
