#!/usr/bin/env python3
"""A Module containing Flask app"""
from flask import Flask, render_template

app = Flask(__name__)


@app.route('/')
def root():
    """A Function that defines the route to an html template"""

    return render_template('0-index.html')


if __name__ == "__main__":
    app.run()
