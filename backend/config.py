from pydantic_settings import BaseSettings
from pydantic import Field
from functools import lru_cache

class Settings(BaseSettings):
    # Firebase - explicitly map to uppercase env vars
    firebase_project_id: str = Field(default="", alias="FIREBASE_PROJECT_ID")
    firebase_private_key_id: str = Field(default="", alias="FIREBASE_PRIVATE_KEY_ID")
    firebase_private_key: str = Field(default="", alias="FIREBASE_PRIVATE_KEY")
    firebase_client_email: str = Field(default="", alias="FIREBASE_CLIENT_EMAIL")
    firebase_client_id: str = Field(default="", alias="FIREBASE_CLIENT_ID")
    
    # Google Cloud
    google_cloud_project_id: str = Field(default="", alias="GOOGLE_CLOUD_PROJECT_ID")
    
    # Cloudinary
    cloudinary_cloud_name: str = Field(default="", alias="CLOUDINARY_CLOUD_NAME")
    cloudinary_api_key: str = Field(default="", alias="CLOUDINARY_API_KEY")
    cloudinary_api_secret: str = Field(default="", alias="CLOUDINARY_API_SECRET")
    
    # Backend
    backend_port: int = 5000
    backend_env: str = "development"
    frontend_url: str = "http://localhost:3000"
    
    class Config:
        env_file = ".env"
        populate_by_name = True  # Allow both field name and alias

@lru_cache()
def get_settings():
    return Settings()
