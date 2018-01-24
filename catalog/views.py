from flask import render_template, abort, request
from catalog import app

@app.before_request
def before_request():
    if 'localhost' in request.host_url or '0.0.0.0' in request.host_url:
        app.jinja_env.cache = {}

@app.route("/")
def index():
    return render_template("index.jinja2")

@app.errorhandler(500)
def exception_handler(exception):
    app.logger.exception(exception)
    return """<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 3.2 Final//EN">
            <title>500 Internal Server Error</title>
            <h1>Internal Server Error</h1>
            <p>The server encountered an internal error and was 
            unable to complete your request..</p>"""
