from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from ultralytics import YOLO
from PIL import Image
import io
import numpy as np
import cv2
import base64
import os

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MODEL_PATH = "models/yolo_v8_final_best.pt" 

try:
    if os.path.exists(MODEL_PATH):
        print(f"✅ Loading Model: {MODEL_PATH}")
        model = YOLO(MODEL_PATH)
    else:
        print(f"⚠️ Model not found, using yolov8n.pt instead.")
        model = YOLO("yolov8n.pt")
except Exception as e:
    print(f"❌ Error loading model: {e}")
    model = None

def get_image_base64(img_array):
    _, buffer = cv2.imencode('.jpg', img_array)
    return base64.b64encode(buffer).decode('utf-8')

@app.post("/analyze")
async def analyze_image(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        image = Image.open(io.BytesIO(contents)).convert("RGB")
        img_cv = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)
        
        # ✅ 1. เก็บขนาดรูปจริง (สำคัญมากสำหรับการวาดกรอบให้ตรง)
        img_h, img_w = img_cv.shape[:2]
        
        if model is None:
            return {"error": "Model not loaded"}

        results = model(image)
        result = results[0]
        boxes = result.boxes
        
        raw_detections = []
        all_areas = []
        
        for box in boxes:
            x1, y1, x2, y2 = box.xyxy[0].tolist()
            w = x2 - x1
            h = y2 - y1
            area = w * h
            all_areas.append(area)
            raw_detections.append({
                "x": x1, "y": y1, "w": w, "h": h,
                "area": area
            })

        max_size_ref = max(all_areas) if all_areas else 1
        
        final_detections = []
        size_dist = {"Small": 0, "Medium": 0, "Large": 0}
        
        for d in raw_detections:
                area = d["area"]
                
                # --- แก้ไขใหม่: ให้ตรงกับบทที่ 2 (ใช้ Diameter และเลข 50/150) ---
                # ประมาณค่าเส้นผ่านศูนย์กลางจากด้านที่ยาวที่สุดของ Bounding Box
                diameter = max(d["w"], d["h"]) 
                
                if diameter < 50: 
                    size_label = "Small"
                elif 50 <= diameter <= 150: 
                    size_label = "Medium"
                else: # มากกว่า 150
                    size_label = "Large"
                # --------------------------------------------------------
            
                size_dist[size_label] += 1
                
                final_detections.append({
                    "x": d["x"], "y": d["y"], "w": d["w"], "h": d["h"],
                    "area": round(area, 2),
                    "diameter": round(diameter, 2), # เพิ่มค่า diameter ส่งกลับไปหน้าเว็บด้วยก็ดีครับ
                    "size": size_label
                })

        cell_count = len(final_detections)
        avg_size = sum(all_areas) / len(all_areas) if all_areas else 0
        confluence = (sum(all_areas) / (img_h * img_w)) * 100 

        original_img_str = get_image_base64(img_cv)
        processed_img_str = original_img_str 

        return {
            "width": img_w,   # ✅ ส่ง width กลับไป
            "height": img_h,  # ✅ ส่ง height กลับไป
            "cell_count": cell_count,
            "confluence": round(confluence, 2),
            "avg_size": round(avg_size, 2),
            "size_distribution": size_dist,
            "detections": final_detections, 
            "original_image": original_img_str,
            "processed_image": processed_img_str
        }

    except Exception as e:
        print("Error:", e)
        return {"error": str(e)}

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)