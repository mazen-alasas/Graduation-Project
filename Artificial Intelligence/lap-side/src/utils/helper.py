import os
import json
import winsound
from pathlib import Path
from playsound import playsound
from scipy.spatial import distance as dist


JSON_PATH = r'\utils\data.json'
ALARM_PATH = r"alarm.mp3"

def play_alarm_sound() -> None:
    """
    Play the alarm sound.
    This function uses the playsound library to play a sound file.
    The sound file should be in the same directory as this script.
    :return: None
    """
    playsound(ALARM_PATH)

def eye_aspect_ratio(eye) -> float:
    """
    Compute the eye aspect ratio (EAR) for a given eye.
    The EAR is a measure of the eye's aspect ratio, which can be used to detect drowsiness.
    :param eye: The eye coordinates (a list of 6 points)
    :return: The eye aspect ratio (EAR)
    """
    A = dist.euclidean(eye[1], eye[5])
    B = dist.euclidean(eye[2], eye[4])
    C = dist.euclidean(eye[0], eye[3])
    return (A + B) / (2.0 * C)

def check_shape_predictor(path) -> None:
    """
    Check if the shape predictor file exists
    :param path: The path to the shape predictor file
    :return: None
    """
    if not os.path.exists(path):
        raise FileNotFoundError(f"File '{path}' not found. Please download it and place it in the same directory.")



def get_variable(variable_name: str):
    """
    Get the value of a variable from the JSON file
    :param variable_name: The name of the variable to get
    :return: The value of the variable
    """
    with open(JSON_PATH, 'r') as f:
        data = json.load(f)
        verified = data[variable_name]
    return verified


def set_variable(variable_name: str, value) -> None:
    """
    Set the value of a variable in the JSON file
    :param variable_name: The name of the variable to set
    :param value: The value to set the variable to
    """
    with open(JSON_PATH, 'r') as f:
        data = json.load(f)
    data[variable_name] = value
    with open(JSON_PATH, 'w') as f:
        json.dump(data, f)

