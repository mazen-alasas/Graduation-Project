from numpy import argmin
import glob
import cv2
import face_recognition
from utils.helper import *
from utils.firebase_conn import update_feature_state, send_message


CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
USERS_IMAGES_DIR = os.path.join("users_data/*.*")


def display_text(frame, text):
    if text == "Authorized":
        cv2.putText(frame, text, (50, 50), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
    else:
        cv2.putText(frame, text, (50, 50), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)


class FaceRecognition:
    def __init__(self):
        self.known_face_encodings: list = []
        self.known_face_names: list = []
        self.process_this_frame: bool = True
        self.FRAME_RESIZE: float = 0.25
        self.FRAME_LIMIT: int = 20
        self.same_person: bool = False
        self.VERIFIED_FRAME_LIMIT: int = 5

    def load_users_data(self) -> None:
        """
        Load known faces from the specified directory.
        The images in the directory should be named with the person's name.
        """
        all_images = glob.glob(USERS_IMAGES_DIR)
        for image in all_images:
            image = cv2.imread(image)
            if image is None:
                print(f"Error loading image: {image}")
                continue
            small_img = self._resize_image(image)
            image_encoding = face_recognition.face_encodings(small_img)[0]

            self.known_face_encodings.append(image_encoding)

    def _resize_image(self, image):
        """
        Resize the image to a smaller size for faster processing.
        :param image: The original image
        :return: The resized image
        """
        new_image = cv2.resize(image, (0, 0), fx=self.FRAME_RESIZE, fy=self.FRAME_RESIZE)
        return new_image

    @staticmethod
    def _get_face_locations(frame) -> list:
        """
        Get the locations of faces in the frame.
        :param frame: The frame to process
        :return: The locations of faces in the frame
        """
        locations = face_recognition.face_locations(frame)
        return locations

    @staticmethod
    def _get_face_encodings(frame, locations) -> list:
        """
        Get the face encodings for the faces in the frame.
        :param frame: The frame to process
        :param locations: The locations of faces in the frame
        :return: The face encodings for the faces in the frame
        """
        encodings = face_recognition.face_encodings(frame, locations)
        return encodings

    def _detect_faces(self, frame) -> None:
        """
        Detect faces in the frame and compare them with known faces.
        :param frame: The frame to process
        """
        small_frame = self._resize_image(frame)
        all_face_locations = self._get_face_locations(small_frame)
        all_face_encodings = self._get_face_encodings(small_frame, all_face_locations)

        for face_encoding in all_face_encodings:
            matches = face_recognition.compare_faces(self.known_face_encodings, face_encoding)
            face_distances = face_recognition.face_distance(self.known_face_encodings, face_encoding)

            if len(face_distances) > 0:
                best_match_index = argmin(face_distances)
                if matches[best_match_index]:
                    self.same_person = True
                # else:
                #     self.same_person = False

    def is_verified(self) -> bool:
        """
        Check if the person is verified.
        :return: True if the person is verified, False otherwise.
        """
        return self.same_person

    def run(self) -> None:
        cap = cv2.VideoCapture(0)
        frame_num: int = 0
        verified_frame_count: int = 0

        while frame_num < self.FRAME_LIMIT:
            success, frame = cap.read()

            if not success:
                print("Error reading frame.")
                break

            self._detect_faces(frame)

            if not True != self.same_person:
                display_text(frame, "Authorized")
                verified_frame_count += 1
                if verified_frame_count == 1:
                    update_feature_state("DFR", "ON", "Driver recognized")
                    send_message("Driver verified successfully.")
            else:
                display_text(frame, "Not Authorized")
                update_feature_state("DFR", "OFF", "Unauthorized driver detected")
                send_message("Unauthorized driver detected")
                

            cv2.imshow("Frame", frame)

            frame_num += 1
            print(f'frame number: {frame_num} - verified: {self.same_person}')

            if verified_frame_count >= self.VERIFIED_FRAME_LIMIT:
                break

            if cv2.waitKey(1) & 0xFF == ord('q'):
                break

        cap.release()
        cv2.destroyAllWindows()
