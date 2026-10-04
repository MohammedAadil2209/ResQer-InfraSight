import os
import cv2
import numpy as np
import yaml
import glob
import random
from ultralytics import YOLO

def create_4class_dataset():
    base_dir = os.path.abspath("dataset_resqer_4class")
    train_img_dir = os.path.join(base_dir, "train", "images")
    train_lbl_dir = os.path.join(base_dir, "train", "labels")
    val_img_dir = os.path.join(base_dir, "val", "images")
    val_lbl_dir = os.path.join(base_dir, "val", "labels")

    os.makedirs(train_img_dir, exist_ok=True)
    os.makedirs(train_lbl_dir, exist_ok=True)
    os.makedirs(val_img_dir, exist_ok=True)
    os.makedirs(val_lbl_dir, exist_ok=True)

    # Gather real road background images from existing dataset
    existing_imgs = glob.glob("dataset/train/images/*.jpg")[:150]
    if len(existing_imgs) < 40:
        existing_imgs = glob.glob("dataset/**/*.jpg", recursive=True)[:150]

    print(f"Loaded {len(existing_imgs)} source road images for synthesis & augmentation.")

    # 4 Target Classes:
    # 0: pothole
    # 1: road_crack
    # 2: open_manhole
    # 3: waterlogging
    
    classes = ['pothole', 'road_crack', 'open_manhole', 'waterlogging']

    def generate_defect_sample(src_path, class_id, idx, is_val=False):
        img = cv2.imread(src_path)
        if img is None:
            img = np.full((640, 640, 3), 70, dtype=np.uint8)
        else:
            img = cv2.resize(img, (640, 640))

        h, w = 640, 640
        # Random location
        cx = random.randint(180, 460)
        cy = random.randint(200, 480)

        boxes = []

        if class_id == 0:  # POTHOLE
            rw = random.randint(70, 140)
            rh = random.randint(50, 110)
            # Draw textured rough dark depression
            overlay = img.copy()
            cv2.ellipse(overlay, (cx, cy), (rw, rh), random.randint(-20, 20), 0, 360, (20, 20, 25), -1)
            cv2.ellipse(overlay, (cx, cy), (int(rw*0.7), int(rh*0.7)), random.randint(-15, 15), 0, 360, (10, 10, 12), -1)
            cv2.addWeighted(overlay, 0.85, img, 0.15, 0, img)
            # Add gravel edge noise
            for _ in range(30):
                nx = cx + random.randint(-rw, rw)
                ny = cy + random.randint(-rh, rh)
                cv2.circle(img, (nx, ny), random.randint(1, 4), (120, 120, 130), -1)

            bw = (rw * 2 + 10) / w
            bh = (rh * 2 + 10) / h
            boxes.append((0, cx / w, cy / h, bw, bh))

        elif class_id == 1:  # ROAD_CRACK
            # Branching crack lines
            points = [(cx, cy)]
            cur_x, cur_y = cx, cy
            for _ in range(8):
                cur_x += random.randint(-35, 35)
                cur_y += random.randint(15, 35)
                points.append((cur_x, cur_y))
            pts_arr = np.array(points, np.int32).reshape((-1, 1, 2))
            cv2.polylines(img, [pts_arr], False, (15, 15, 15), random.randint(3, 7))
            
            # Secondary branch
            if len(points) > 4:
                b_start = points[len(points)//2]
                b_pts = [b_start]
                bx, by = b_start
                for _ in range(4):
                    bx += random.randint(20, 40)
                    by += random.randint(5, 25)
                    b_pts.append((bx, by))
                cv2.polylines(img, [np.array(b_pts, np.int32).reshape((-1, 1, 2))], False, (15, 15, 15), 3)

            min_x = min(p[0] for p in points)
            max_x = max(p[0] for p in points)
            min_y = min(p[1] for p in points)
            max_y = max(p[1] for p in points)
            bcx = ((min_x + max_x) / 2) / w
            bcy = ((min_y + max_y) / 2) / h
            bw = (max_x - min_x + 20) / w
            bh = (max_y - min_y + 20) / h
            boxes.append((1, bcx, bcy, max(bw, 0.1), max(bh, 0.1)))

        elif class_id == 2:  # OPEN_MANHOLE
            rad = random.randint(55, 90)
            overlay = img.copy()
            # Outer cast iron ring
            cv2.circle(overlay, (cx, cy), rad + 12, (50, 50, 55), -1)
            cv2.circle(overlay, (cx, cy), rad + 6, (90, 90, 95), 4)
            # Pitch black deep chamber
            cv2.circle(overlay, (cx, cy), rad, (5, 5, 5), -1)
            # Inner ladder rung highlight
            cv2.line(overlay, (cx - rad//2, cy - rad//3), (cx + rad//2, cy - rad//3), (60, 60, 65), 3)
            cv2.addWeighted(overlay, 0.95, img, 0.05, 0, img)

            bw = (rad * 2 + 30) / w
            bh = (rad * 2 + 30) / h
            boxes.append((2, cx / w, cy / h, bw, bh))

        elif class_id == 3:  # WATERLOGGING
            rw = random.randint(90, 180)
            rh = random.randint(60, 120)
            overlay = img.copy()
            # Specular water puddle with dark reflection
            cv2.ellipse(overlay, (cx, cy), (rw, rh), random.randint(-10, 10), 0, 360, (30, 40, 45), -1)
            cv2.ellipse(overlay, (cx, cy), (int(rw*0.8), int(rh*0.7)), random.randint(-5, 5), 0, 360, (55, 75, 85), -1)
            # Water surface reflection shimmer
            cv2.ellipse(overlay, (cx - 20, cy - 15), (int(rw*0.4), int(rh*0.3)), -15, 0, 360, (180, 200, 215), -1)
            cv2.addWeighted(overlay, 0.70, img, 0.30, 0, img)

            bw = (rw * 2 + 20) / w
            bh = (rh * 2 + 20) / h
            boxes.append((3, cx / w, cy / h, bw, bh))

        target_img_dir = val_img_dir if is_val else train_img_dir
        target_lbl_dir = val_lbl_dir if is_val else train_lbl_dir

        prefix = "val" if is_val else "train"
        filename = f"{prefix}_{classes[class_id]}_{idx}"
        img_file = os.path.join(target_img_dir, f"{filename}.jpg")
        lbl_file = os.path.join(target_lbl_dir, f"{filename}.txt")

        cv2.imwrite(img_file, img)
        with open(lbl_file, "w") as f:
            for b in boxes:
                f.write(f"{b[0]} {b[1]:.6f} {b[2]:.6f} {b[3]:.6f} {b[4]:.6f}\n")

    # Generate 16 train images per class (64 train) and 4 val per class (16 val)
    idx = 0
    for cls_id in range(4):
        for i in range(16):
            src = existing_imgs[idx % len(existing_imgs)]
            generate_defect_sample(src, cls_id, i, is_val=False)
            idx += 1
        for i in range(4):
            src = existing_imgs[idx % len(existing_imgs)]
            generate_defect_sample(src, cls_id, i, is_val=True)
            idx += 1

    data_yaml = {
        "path": base_dir,
        "train": "train/images",
        "val": "val/images",
        "nc": 4,
        "names": classes
    }

    yaml_file = os.path.join(base_dir, "data.yaml")
    with open(yaml_file, "w") as f:
        yaml.dump(data_yaml, f, default_flow_style=False)

    print(f"✅ Generated 4-class dataset at {yaml_file}")
    return yaml_file

def train_model(yaml_file):
    print("🚀 Training ResQer YOLOv8 Nano for 4 Classes (Pothole, Road Crack, Open Manhole, Waterlogging)...")
    model = YOLO("yolov8n.pt")
    results = model.train(
        data=yaml_file,
        epochs=12,
        imgsz=416,
        batch=8,
        name="resqer_4class",
        exist_ok=True,
        verbose=True
    )

    best_pt = os.path.join("runs", "detect", "resqer_4class", "weights", "best.pt")
    if os.path.exists(best_pt):
        # Deploy directly to backend/best.pt
        import shutil
        os.makedirs("backend", exist_ok=True)
        shutil.copy2(best_pt, "backend/best.pt")
        print(f"🎉 Successfully trained and deployed weights to backend/best.pt ({os.path.getsize('backend/best.pt')} bytes)")
    else:
        print("⚠️ Best weights not found at expected path:", best_pt)

if __name__ == "__main__":
    y_file = create_4class_dataset()
    train_model(y_file)
