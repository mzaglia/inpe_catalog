FROM python:3-alpine
MAINTAINER Carolina Galvão <carolina.santos_datainfo@inpe.br> 

# Prepare work directory
RUN mkdir -p /usr/src/oscapp
WORKDIR /usr/src/oscapp

# Get source and install python requirements
COPY requirements.txt /usr/src/oscapp
RUN pip install -r requirements.txt

# Expose the Flask port
EXPOSE 5001

# Run the opensearch application
CMD [ "python3", "wsgi.py" ]
