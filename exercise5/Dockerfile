# Use an official Node.js runtime as a parent image
FROM node:12

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install app dependencies
RUN npm install

# Bundle app source
COPY . .

# Set the environment variable to the port on which your Node.js app will run
ENV PORT=8080

# Expose the port on which your Node.js app will run
EXPOSE 8080

# Define the command to run your application
CMD ["npm", "start"]
