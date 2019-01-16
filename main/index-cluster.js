process.env.UV_THREADPOOL_SIZE = 1;
// the above line doesn't restrain the number of thread available
// it means that every child in the cluster can only use 1 thread
// (by default they can all access the defaut 4 threads)
// doing so allow us to understand more easily the result of our testing with ab
const cluster = require('cluster');

if(cluster.isMaster) {
    cluster.fork();
    cluster.fork();
} else {
    const express = require('express');
    const app = express();
    const crypto = require('crypto');
    
    app.get('/', (req, res) => {
        crypto.pbkdf2('a', 'b', 100000, 512, 'sha512', () => {
            res.send('Hi there');
        });
    });
    
    app.get('/fast', (req, res) => {
        res.send('This was really fast');
    });

    app.listen(3000);
}
