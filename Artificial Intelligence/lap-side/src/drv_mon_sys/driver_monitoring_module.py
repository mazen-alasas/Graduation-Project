import os
import time
import threading
import cv2
import dlib
import pygame
from scipy.spatial import distance as dist
from utils.firebase_conn import update_feature_state, send_message
from utils.helper import eye_aspect_ratio

pygame.init()
pygame.mixer.init()

PLAY:    int = 1  # motor running
WARN:    int = 4  # sleeping or dead
NO_FACE: int = 5  # no face detected


def check_shape_predictor(path):
    if not os.path.isfile(path):
        raise FileNotFoundError(f"Shape predictor file not found at {path}")
    else:
        print(f"Shape predictor verified at {path}")


def display_EAR(frame, ear):
    cv2.putText(frame, f"EAR: {ear:.2f}", (10, 60), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)

def display_message(frame, message):
    cv2.putText(frame, message, (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 255), 2)

def display_warning(frame, message):
    # on center of the frame in red color
    cv2.putText(frame, message, (frame.shape[1] // 2 - 100, frame.shape[0] // 2), cv2.FONT_HERSHEY_SIMPLEX, 1.5, (0, 0, 255), 3)

class DriverMonitor:
    def __init__(self, socket=None):
        self.shape_predictor_path = "shape_predictor_68_face_landmarks.dat"
        self.detector = dlib.get_frontal_face_detector()
        self.predictor = dlib.shape_predictor(self.shape_predictor_path)

        self.EAR_THRESHOLD = 0.25
        self.ALARM_DURATION_THRESHOLD = 3
        self.NO_FACE_THRESHOLD = 4
        self.MESSAGE_DISPLAY_DURATION = 2

        self.closed_eyes_start_time = None
        self.no_face_start_time = None
        self.alarm_on = False
        self.message_time = None
        self.message_text = ""
        self.warning_ctr = 0
        self.client_socket = socket
        self.stop_now = False

    def play_alarm(self):
        if not pygame.mixer.music.get_busy():
            try:
                pygame.mixer.music.load("alarm.wav")
                pygame.mixer.music.play(-1)
            except Exception as e:
                print(f"[Alarm] Error loading sound: {e}")

        while self.alarm_on:
            time.sleep(0.5)

        pygame.mixer.music.stop()

    def process_frame(self, frame, update_json_and_firebase_func):
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        faces = self.detector(gray)
        self.message_text = ""

        if len(faces) == 0:
            if self.no_face_start_time is None:
                self.no_face_start_time = time.time()
            elif time.time() - self.no_face_start_time >= self.NO_FACE_THRESHOLD:
                if not self.alarm_on:
                    self.warning_ctr += 1
                    if self.warning_ctr >= 3:
                        self.stop_now = True                        
                    self.message_text = " No face detected!"
                    self.message_time = time.time()
                    self.alarm_on = True
                    threading.Thread(target=self.play_alarm, daemon=True).start()
                    send_message("no face detected")
                    update_json_and_firebase_func("No Face Detected", "Warning: No face detected!")
                    # if self.client_socket:
                    #     self.client_socket.send(str(NO_FACE).encode())
        else:
            self.no_face_start_time = None
            for face in faces:
                landmarks = self.predictor(gray, face)
                left_eye = [(landmarks.part(i).x, landmarks.part(i).y) for i in range(36, 42)]
                right_eye = [(landmarks.part(i).x, landmarks.part(i).y) for i in range(42, 48)]
                left_ear = eye_aspect_ratio(left_eye)
                right_ear = eye_aspect_ratio(right_eye)
                ear = (left_ear + right_ear) / 2.0

                if ear < self.EAR_THRESHOLD:
                    if self.closed_eyes_start_time is None:
                        self.closed_eyes_start_time = time.time()
                    elif time.time() - self.closed_eyes_start_time >= self.ALARM_DURATION_THRESHOLD:
                        if not self.alarm_on:
                            self.warning_ctr += 1
                            if self.warning_ctr >= 3:
                                self.stop_now = True
                            self.message_text = " Driver is sleeping!"
                            self.message_time = time.time()
                            self.alarm_on = True
                            threading.Thread(target=self.play_alarm, daemon=True).start()
                            send_message("Driver is sleeping")
                            update_json_and_firebase_func("Sleeping", "Warning: Driver is sleeping!")
                            # if self.client_socket:
                            #     self.client_socket.send(str(WARN).encode())
                else:
                    self.closed_eyes_start_time = None
                    if self.alarm_on:
                        self.alarm_on = False
                        print("✅ Driver awake, stopping alarm.")
                        send_message("Driver awake")
                        # if self.client_socket:
                        #     self.client_socket.send(str(PLAY).encode())

                display_EAR(frame, ear)
        if self.alarm_on:
            display_warning(frame, "Warning!!")
        if self.message_text and time.time() - self.message_time <= self.MESSAGE_DISPLAY_DURATION:
            display_message(frame, self.message_text)
            
        return frame

    def run(self):
        cap = cv2.VideoCapture(0)
        print("[DMS] Monitoring started...")

        while True:
            ret, frame = cap.read()
            if not ret:
                break

            # processed_frame = self.process_frame(frame, lambda s, m: print(f"[Dummy Update] {s}: {m}"))
            processed_frame = self.process_frame(
                frame,
                lambda short_state, msg: update_feature_state("DMS", "ON", msg)
            )
            cv2.imshow("Driver Monitoring System", processed_frame)
            if self.stop_now:
                print("[DMS] Monitoring stopped.")
                break
            if cv2.waitKey(1) == ord('q'):
                break

        cap.release()
        cv2.destroyAllWindows()



