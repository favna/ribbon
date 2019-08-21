build:
	docker build -t favware/lavalink:latest .

run:
	docker container run -d --expose 2568 -p 2568:2568 --name lavalink favware/lavalink:latest

logs:
	docker logs -f lavalink

stop:
	docker container stop lavalink

remove:
	docker container stop lavalink && docker container rm lavalink

clean:
	docker rmi -f favware/lavalink:latest
