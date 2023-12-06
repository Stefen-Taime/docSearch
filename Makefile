# Makefile

# Command to start the services and display the URLs
up:
	cd docker && docker-compose up --build -d
	@echo "Services are up and running. Access them at the following URLs:"
	@echo "Zookeeper: http://localhost:2181"
	@echo "Broker (Kafka): http://localhost:9092"
	@echo "Schema Registry: http://localhost:8081"
	@echo "Control Center: http://localhost:9021"
	@echo "REST Proxy: http://localhost:8082"
	@echo "Elasticsearch: http://localhost:9200"
	@echo "Kibana: http://localhost:5601"
	@echo "Hadoop Namenode: http://localhost:9870"
	@echo "ResourceManager (YARN): http://localhost:8088"
	@echo "SFTP: sftp -P 2222 stefen@localhost"
	@echo "NiFi: http://localhost:8080"
	@echo "Tika Server: http://localhost:9997"
	@echo "Tika Server with OCR: http://localhost:9998"

# Command to change permissions for the sftp uploads directory
chmod-sftp:
	sudo chmod -R 777 ~/docSearch/docker/sftp/uploads

# Command to execute commands inside a Docker container
exec-logstash:
	docker exec -it 41cb5ab9cc73 /bin/bash -c "mkdir -p ~/logstash_data && bin/logstash -f pipeline/ingest_pipeline.conf --path.data /usr/share/logstash/logstash_data"


# Command to install dependencies and run the Python app in the api directory
run-api:
	cd api && pip install -r requirements.txt && python app.py
	@echo "API is running. Access the docs at: http://localhost:8000/docs"

# Command to start the frontend application with Docker Compose
run-front:
	cd front && docker-compose up --build -d
	@echo "Frontend application is starting up on http://localhost:5173/"

# Command to tear down everything
clean-all:
	cd docker && docker-compose down --rmi all --volumes --remove-orphans
	@echo "All containers, volumes, and images have been removed."		

