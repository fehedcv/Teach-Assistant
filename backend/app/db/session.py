from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv
import os

load_dotenv()

user = os.getenv('username')
password = os.getenv('password')
host = os.getenv('host')
port = os.getenv('port')
database = os.getenv('database')
if user == "":
    raise ValueError("Missing environment variable: username")
if password == "":
    raise ValueError("Missing environment variable: password")
if host == "":
    host = "localhost"
if port == "":
    port = 5432
if database == "":
    raise ValueError("Missing environment variable: database")


DATABASE_URL = f"postgresql+pg8000://{user}:{password}@{host}:{port}/{database}"
engine = create_engine(
    DATABASE_URL,
    pool_size=5,          # keep pool small
    max_overflow=10,      # allow temporary overflow
    pool_timeout=30,      # wait before failing
    pool_recycle=1800,    # recycle connections every 30 min
    )
Session = sessionmaker(bind=engine, autoflush=False, autocommit=False)


def get_db():
    db = Session()
    try:
        yield db
    finally:
        db.close()