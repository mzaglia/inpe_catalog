import logging
from catalog import app
from flask import render_template, abort

@app.route("/")
def index():
    return render_template("index.html")

@app.errorhandler(500)
def exception_handler(exception):
    app.logger.exception(exception)
    return """<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 3.2 Final//EN">
            <title>500 Internal Server Error</title>
            <h1>Internal Server Error</h1>
            <p>The server encountered an internal error and was 
            unable to complete your request..</p>"""
