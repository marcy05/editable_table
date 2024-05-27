# editable_table
This project provides the possibility to have a table that it automatically save at every change, automatically update at every change and has a factory reset possibility


# Set-up the project on Raspberry Pi 3 B+

1. Make sure raspberry is updated

```
sudo apt update
sudo apt upgrade
```

2. Install Node.js

This is the current raccomanded version, the execution shuld advise you if there is a new version.


curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install /y nodejs
```

3. Create a project directory by pulling the project

```
git pull <SSH link to the project>
cd editable_table
```

4. Initialize Node.js project

```
npm init -y
```

5. Install packages

```
npm install express sqlite3 body-parser
```

6. Run the server

```
node server.js
```

	6.1 Access from web

		Open a browser and go to http://\<raspberry ip address>:3000

7. Auto start the server at the boot

Auto-start the server on boot: You can use pm2 to manage and auto-start your Node.js server on boot. Install pm2 globally:

```
sudo npm install -g pm2
```

Start your server with pm2:

```
pm2 start server.js
pm2 save
pm2 startup
```
