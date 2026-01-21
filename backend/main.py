import io

from fastapi import FastAPI, File, Response, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image, ImageFilter
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


def apply_blur_background(
    original_img: Image.Image, blur_radius: int = 10
) -> Image.Image:
    """
    画像の背景をぼかす

    Args:
        original_img: ぼかす画像
        blur_radius: ぼかしの強さ

    Returns:
        ぼかした画像
    """
    # 被写体を切り抜く(rembg)
    # alpha_matting=Trueで境界線をキレイにする
    subject_img = remove(original_img, alpha_matting=True)

    # 元の画像全体をぼかす(背景用)
    blurred_bg = original_img.filter(ImageFilter.GaussianBlur(radius=blur_radius))

    # 合成する
    # ぼかした背景の上に、切り抜いた被写体を貼り付ける
    # 第3引数(mask)に、subject_imgを指定することで、透明部分を考慮して合成する
    blurred_bg.paste(subject_img, (0, 0), subject_img)

    return blurred_bg.convert("RGB")


# 新しいAPIエンドポイント
@app.post("/process-image-blur")
async def process_image_blur(file: UploadFile = File(...)):
    """
    背景ぼかし専用のAPI

    """
    input_image = Image.open(file.file)

    # ぼかし処理実行
    final_image = apply_blur_background(input_image, blur_radius=15)

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
