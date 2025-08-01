# Book_search_app

A simple web application to search for books using the Open Library API, deployed with Docker and load-balanced across two servers.

## Purpose
This application allows users to search for books by title, author, or keyword, sort results by title or publication year, and filter by books with cover images. It serves a practical purpose for book enthusiasts and researchers.

## API Used
- **Open Library API**: https://openlibrary.org/developers/api
- No API key required.
- Credit: Thanks to the Internet Archive for providing the Open Library API.

## Local Setup
1. Clone the repository:
   ```bash
   git clone <your-repo-url>
   cd book_search_app

### Docker Deployment & Load Balancing

**Option 1: Simple Docker Pull and Run (Recommended)**
[Repo link: https://hub.docker.com/repositories/emacslad](https://hub.docker.com/u/emacslad)
```bash
# Pull the Docker images
docker pull emacslad/redinsight-web-01:latest
docker pull emacslad/redinsight-web-02:latest
docker pull emacslad/redinsight-lb-01:latest

# Run the containers
docker run -d -p 8080:3000 -p 2210:22 --name web-01 emacslad/redinsight-web-01
docker run -d -p 8081:3000 -p 2211:22 --name web-02 emacslad/redinsight-web-02
docker run -d -p 8082:3000 -p 2212:22 --name lb-01 emacslad/redinsight-lb-01

# Access the application
# Web: http://localhost:8082
# SSH: ssh ubuntu@localhost -p 2212 (password: pass123)
```

**Option 2: Docker Compose (Build locally)**
```bash
# Start all services
docker-compose up -d --build

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Nginx & Haproxy Setup

#### Nginx
I used echo with the redirection '>' to add the Nginx config within the Dockerfile responsible for setting up web-01 and web-02 containers
```
# Configure nginx
RUN echo 'server {\n\
    listen 80;\n\
    location / {\n\
        proxy_pass http://localhost:3000;\n\
        proxy_set_header Host $host;\n\
        proxy_set_header X-Real-IP $remote_addr;\n\
    }\n\
}' > /etc/nginx/sites-available/default
```

#### Haproxy
I created a different Dockerfile for the loadbalancer as seen in the lb directory. I had used a heredoc(EOF) to add the config to haproxy.cfg within the Dockerfile
```
global
    maxconn 256
    log stdout format raw local0 info

defaults
    mode http
    timeout connect 5s
    timeout client  50s
    timeout server  50s
    option forwardfor
    option http-server-close

frontend http-in
    bind *:80
    default_backend servers
    http-response add-header X-Served-By %[srv_name]

backend servers
    balance roundrobin
    server web01 172.20.0.11:3000 check
    server web02 172.20.0.12:3000 check
```