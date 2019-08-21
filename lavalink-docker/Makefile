build:
	docker build -t favware/lavalink:latest .

run:
	docker container run -d --expose 2568 -p 2568:2568 --name lavalink favware/lavalink:latest

remove:
	docker rmi -f favware/lavalink:latest
