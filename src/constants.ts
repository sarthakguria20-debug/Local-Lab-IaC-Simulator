export const DEFAULT_YAML = `version: '3.8'
services:
  web:
    image: nginx:alpine
    type: container
    ports:
      - "8080:80"
    networks:
      frontend:
        ipv4_address: 172.16.0.10
    dependsOn:
      - api

  api:
    image: my-express-api:latest
    type: container
    ports:
      - "3000"
    networks:
      - frontend
      - backend
    dependsOn:
      - db

  db:
    image: postgres:15
    type: vm
    networks:
      backend:
        ipv4_address: 10.0.0.50

networks:
  frontend:
    ipam:
      config:
        - subnet: 172.16.0.0/24
  backend:
    ipam:
      config:
        - subnet: 10.0.0.0/24
`;
