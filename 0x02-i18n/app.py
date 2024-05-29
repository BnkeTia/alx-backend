from flask import Flask, render_template, request
from flask_babel import Babel, _

app = Flask(__name__)

# Configure Babel
app.config['BABEL_TRANSLATION_DIRECTORIES'] = 'translations'
app.config['BABEL_DEFAULT_LOCALE'] = 'en'

babel = Babel(app)

# List of supported locales
supported_locales = ['en', 'fr']


@babel.localeselector
def get_locale():
    """
    Select the best match locale from the request.

    If the 'locale' argument is present in the request and is supported,
    use it. Otherwise, use the best match from the request's accepted languages.
    """
    locale = request.args.get('locale')
    if locale in supported_locales:
        return locale
    return request.accept_languages.best_match(supported_locales)


@app.route('/')
def index():
    """Render the index page."""
    return render_template('index.html')


if __name__ == '__main__':
    app.run(debug=True)
