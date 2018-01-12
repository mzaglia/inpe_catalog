# pylint: disable=invalid-name
"""
TODO
"""
import logging
from logging.handlers import RotatingFileHandler
from flask import Flask
from flask_bootstrap import Bootstrap

class LevelFilter(logging.Filter):
    """
    Filters a level of logger
    if rejected is True all other levels are accepted
    if rejected is False only the given level is accepted
    """

    def __init__(self, level, reject):
        self.level = level
        self.reject = reject

    def filter(self, record):
        if self.reject:
            return record.levelno != self.level
        else:
            return record.levelno == self.level

def create_app():
    app = Flask(__name__)
    Bootstrap(app)
    return app 

def create_logger(app):
    formatter = logging.Formatter("%(asctime)s %(levelname)s in %(name)s: %(message)s")

    info_handler = RotatingFileHandler('{}.log'.format(__name__),
                                       maxBytes=1024 * 1024 * 100,
                                       backupCount=20)
    info_handler.setLevel(logging.ERROR)
    info_handler.setFormatter(formatter)
    info_handler.addFilter(LevelFilter(logging.ERROR, True))

    if app.debug is not True:
        error_handler = RotatingFileHandler('{}_err.log'.format(__name__),
                                            maxBytes=1024 * 1024 * 100,
                                            backupCount=20)

        error_handler.setLevel(logging.ERROR)
        error_handler.setFormatter(formatter)
        error_handler.addFilter(LevelFilter(logging.ERROR, False))

        app.logger.setLevel(logging.ERROR)

    app.logger.addHandler(info_handler)
    app.logger.addHandler(error_handler)

app = create_app()
create_logger(app)

from catalog import views
