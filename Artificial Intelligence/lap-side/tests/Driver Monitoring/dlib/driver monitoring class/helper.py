import os
from scipy.spatial import distance as dist

def eye_aspect_ratio(eye):
    A = dist.euclidean(eye[1], eye[5])
    B = dist.euclidean(eye[2], eye[4])
    C = dist.euclidean(eye[0], eye[3])
    return (A + B) / (2.0 * C)

def check_shape_predictor(path):
    if not os.path.exists(path):
        raise FileNotFoundError(f"File '{path}' not found. Please download it and place it in the same directory.")
