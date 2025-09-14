from dance_server import app

# Expose 'app' for gunicorn: gunicorn wsgi:app
if __name__ == "__main__":
    # Local debug fallback
    app.run(host="0.0.0.0", port=5001)
