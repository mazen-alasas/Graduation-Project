from deepface import DeepFace

def verify_face(self, frame):
        try:
            result = DeepFace.verify(img1_path=self.known_img, img2_path=frame)
            return result["verified"]
        except Exception:
            print(f"Error during verification")
            return False