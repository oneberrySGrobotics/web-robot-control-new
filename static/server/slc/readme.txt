In Case of Change PC or IP.

please follow these step to update the cert

1. open file rungen.sh

2. change the -i=192.168.0.199 to ip of your PC/Tx2

3. save the rungen.sh

4. run rm -rf localhost*  
# this will delete all current localhost cert which ip bound to 192.168.0.199


5. run ./rungen.sh
#this will generate a new set of localhost cert



do not change the name of these files as its used in index.js



6. lastly
go to chrome://settings/ >> privacy and security >> (more) >> manage certificates >> Authorities >> import

then select localhost_CA.pem file as target file.

after that a prompt will come out
check all checkbox trusting this website.. and click 'OK'


7.a. chrome://restart 
7.b. restart/ start node static/server/index.js