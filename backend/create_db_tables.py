from app.db.session import engine
from app.db.base import Base
from app.models import models

def create_tables():
    print("Attempting to create tables...")
    Base.metadata.create_all(bind=engine)
    print("Tables created successfully.")

if __name__ == "__main__":
    create_tables()
