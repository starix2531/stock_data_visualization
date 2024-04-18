# Use an official Python runtime as the base image
FROM python:3.8

# Set the working directory in the container
WORKDIR /app

# Copy the requirements file to the working directory
COPY requirements.txt .

# Install the Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the entire backend directory to the working directory
COPY . .
COPY application_default_credentials.json /app/credentials.json
# Expose the port on which your backend server will run
EXPOSE 5000

# Set the entry point command to run the Flask server
CMD ["python", "data_extraction.py"]