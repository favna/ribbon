FROM openjdk:11-jre-slim

WORKDIR /opt/Lavalink

COPY Lavalink.jar Lavalink.jar
COPY application.yml application.yml

ENTRYPOINT ["java", "-Xmx4G", "-jar", "Lavalink.jar"]
