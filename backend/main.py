import io

from fastapi import FastAPI, File, Response, UploadFile
from PIL import Image

app = FastAPI()


@app.get("/")
def read_root():
    return {"massage": "Hello Mercari Studio!"}


@app.post("/process-image")
async def process_image(file: UploadFile = File(...)):
    # 画像を開く
    input_image = Image.open(file.file)

    # そのまま保存用データ(バイナリ)に変換する
    img_byte_arr = io.BytesIO()
    input_image.save(img_byte_arr, format="PNG")

    # 画像として送り返す
    return Response(content=img_byte_arr.getvalue(), media_type="image/png")
