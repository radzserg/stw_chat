STW Chat
=========

Just another node chat based on socket.io. For me it was a good case to work with node again.

Installation
-----------
```sh
git clone [git-repo-url] stw_chat 
cd stw_chat
npm install
npm run-script seed
cd public && bower install
npm start
```

Go to [http://localhost:3000]


[http://localhost:3000]: http://localhost:3000

Notes
-----------
I tried to make all queries that are not normally be part of chat to be handled by express app. So all such requests are 
done via HTTP requests. While chat related requests are done via socket.emit().