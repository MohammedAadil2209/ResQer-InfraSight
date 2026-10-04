import os
import yaml

DATASET_PATH = os.path.abspath("./dataset")

# Defect class labels
CLASSES = [
    "longitudinal_crack",
    "transverse_crack",
    "alligator_crack",
    "pothole",
]

data_yaml_content = {
    "path": DATASET_PATH,
    "train": "train/images",
    "val": "valid/images",
    "test": "test/images",
    "nc": len(CLASSES),
    "names": CLASSES,
}

os.makedirs(DATASET_PATH, exist_ok=True)
yaml_path = os.path.join(DATASET_PATH, "data.yaml")

with open(yaml_path, "w") as f:
  yaml.dump(data_yaml_content, f, default_flow_style=False)

print(f"✅ Configured {yaml_path}")