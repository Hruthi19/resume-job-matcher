from app import create_app
from dotenv import load_dotenv
import os

load_dotenv()

app = create_app()

if __name__ == '__main__':
    PORT = int(os.getenv("FLASK_PORT"))
    app.run(host = '0.0.0.0', debug = True, port = PORT)