# main.py
from fastapi import FastAPI
from routers import parental_controls

app = FastAPI()

# 注册家长控制模块的所有接口，接口前缀可自定义
app.include_router(parental_controls.router, prefix="/api/parental-control")

@app.get("/")
def root():
    return {"status": "Parental Control Backend is running"}

