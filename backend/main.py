import io

from fastapi import FastAPI, File, Response, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
from rembg import remove  # type: ignore

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def make_white_background(img: Image.Image) -> Image.Image:
    """
    画像の背景を白くする

    Args:
        img: 背景を白くする画像

    Returns:
        背景を白くした画像
    """
    # 白い画像を作る
    white_bg = Image.new("RGB", img.size, (255, 255, 255))
    # 画像を貼り付ける
    white_bg.paste(img, (0, 0), img)

    return white_bg


@app.post("/process-image")
async def process_image(file: UploadFile = File(...)):
    """
    画像を背景を白くする

    Args:
        file: 画像ファイル

    Returns:
        背景を白くした画像
    """
    # 画像を開く
    input_image = Image.open(file.file)

    # 背景削除(背景が透明の画像が返ってくる)
    no_bg_image = remove(input_image, alpha_matting=True)

    # 背景を白くする
    final_image = make_white_background(no_bg_image)

    # JPEGとして返す
    img_byte_arr = io.BytesIO()
    final_image.save(img_byte_arr, format="JPEG", quality=95)

    # レスポンスとして返す
    return Response(content=img_byte_arr.getvalue(), media_type="image/jpeg")


@app.get("/")
def read_root():
    """
    ルートエンドポイント

    Returns:
        JSONレスポンス: "Hello Mercari Studio!"
    """
    return {"massage": "Hello Mercari Studio!"}
