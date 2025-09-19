import os
from dotenv import load_dotenv

BASE_DIR = os.path.abspath(os.path.dirname(__file__))
load_dotenv() 

class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "super-secret-key")
    

    # Banco PostgreSQL
    #SQLALCHEMY_DATABASE_URI = os.getenv(
        #"DATABASE_URL",
        #f"mysql+pymysql://{os.getenv('DB_USER')}:{os.getenv('DB_PASS')}@{os.getenv('DB_HOST')}:{os.getenv('DB_PORT', 3306)}/{os.getenv('DB_NAME')}"
    #)

    #SQLALCHEMY_TRACK_MODIFICATIONS = False

    SQLALCHEMY_DATABASE_URI = "sqlite:///" + os.path.join(BASE_DIR, "database.db")
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "super-secret-key")
    JWT_ALGORITHM = "HS256"

    UPLOAD_FOLDER = os.path.join(BASE_DIR, "uploads")
    ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "gif"}

    LOCAL_IP = os.getenv("LOCAL_IP", "127.0.0.1") 
    PORT = os.getenv("PORT", 5000)
    
    WTF_CSRF_ENABLED = True