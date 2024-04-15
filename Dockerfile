FROM node:14

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the entire project
COPY . .

# Expose the desired port (e.g., 3000)
EXPOSE 3000

# Start the application
CMD ["npm", "start"]

