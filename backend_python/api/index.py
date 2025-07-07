from app import app

# Vercel expects either 'handler' or 'app' to be defined
# Since we're using Flask (WSGI), we export the app instance 