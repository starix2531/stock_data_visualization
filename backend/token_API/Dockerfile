# Use the official Node.js image.
# https://hub.docker.com/_/node
FROM node:18

# Create and change to the app directory.
WORKDIR /usr/src/app

# Copy application dependency manifests to the container image.
COPY package*.json ./

# Install production dependencies.
RUN npm install --production

# Copy local code to the container image.
COPY . .

# Copy the service account key file to the container.
COPY stock-firebase-v1-firebase-adminsdk-phrfc-5e8cf0a852.json /usr/src/app/

# Set the environment variable for Google Application Credentials.
ENV GOOGLE_APPLICATION_CREDENTIALS=/usr/src/app/stock-firebase-v1-firebase-adminsdk-phrfc-5e8cf0a852.json

# Run the web service on container startup.
CMD [ "node", "index.js" ]

# Inform Docker that the container is listening on the specified port at runtime.
EXPOSE 3000
