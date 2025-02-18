from deepface import DeepFace
import cv2
class FaceVerification:
    def __init__(self, known_img_path):
       self.cap = cv2.VideoCapture(0)  # افتح الكاميرا
       #variables
       self.frame_num = 0
       self.same_person = False  # هل الشخص هو نفسه؟ لا عشان لسة مش متأكد
       try:
            self.cap.release()
       except AttributeError:
            print("Camera was not open, so nothing to release.")  

       self.known_img = cv2.imread(known_img_path)
       if self.known_img is None:
            print(f"Error: Unable to load image")
         
    def verify_face(self, frame):
        
        try:
            result: dict = DeepFace.verify(img1_path=self.known_img, img2_path=frame)
            return result["verified"]
        except Exception:
            print(f"Error during verification") 
            return False

    def run(self):
        cap = cv2.VideoCapture(0)
        frame_num = 0
        
        while frame_num < 30:
            ret, frame = cap.read()

            if not ret:
                print("Error: Unable to read frame from camera.")
                break

            cv2.imshow("Frame", frame)

            self.same_person = self.verify_face(frame)

            print(f'Frame number: {self.frame_num +1} - Verified: {self.same_person}')
            
            frame_num += 1
            
            if self.same_person:
                break

            if cv2.waitKey(1) & 0xFF == ord('q'):
                break

        self.cap.release()
        cv2.destroyAllWindows()

        print("Same person verified:", self.same_person)
