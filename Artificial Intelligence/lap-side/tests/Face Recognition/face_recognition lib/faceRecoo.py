import json                             # to store data in JSON format

from numpy import array, argmin         # to get min distance between known face and unknown face

import os, glob                         # to take all images from directory

import cv2                              # for image processing
import face_recognition                 # for face detection, encoding and recognition

from playsound import playsound         # to play alarm sound when face is not recognized



def read_shared_variable():
    with open('F:\\VS\\ML\\Sub Projects For GP\\Face Recognition\\face_recognition lib\\data.json', 'r') as f:
        data = json.load(f)
        verified = data['Verified']
    return verified

def write_shared_variable():
    with open('F:\\VS\\ML\\Sub Projects For GP\\Face Recognition\\face_recognition lib\\data.json', 'r') as f:
        data = json.load(f)

    data['Verified'] = True

    with open('F:\\VS\\ML\\Sub Projects For GP\\Face Recognition\\face_recognition lib\\data.json', 'w') as f:
        json.dump(data, f)



known_face_encodings    = []            # to store known face encodings
frame_resize            = 0.25          # to resize frame


all_images = glob.glob(os.path.join("images 1/*.*"))                # get all images from directory


for image in all_images:                                            # for each image
    image = cv2.imread(image)                                       # read image
    small_img = cv2.resize(image, (0, 0), fx = frame_resize, fy = frame_resize)   # resize image  (0.25 original size)
    image_encoding = face_recognition.face_encodings(small_img)[0]  # get encoding
    known_face_encodings.append(image_encoding)



def detect_faces_from_frame(frame):
    small_frame = cv2.resize(frame, (0, 0), fx = frame_resize, fy = frame_resize)
    face_locations = face_recognition.face_locations(small_frame)                       # get face locations
    face_encodings = face_recognition.face_encodings(small_frame, face_locations)       # get face encodings
    for face_encoding in face_encodings:                                                # for each face in the frame if there are multiple faces in the frame
        matches = face_recognition.compare_faces(known_face_encodings, face_encoding)   # compare face encodings with known face encodings, return True if they match
        face_distances = face_recognition.face_distance(known_face_encodings, face_encoding)    # get min distance between known face and unknown face
        best_match_index = argmin(face_distances)                                       # get index of min distance
        if matches[best_match_index]:                                                   # if unknown face matches with known face
            write_shared_variable()                                       # write True
    face_locations = array(face_locations)                                              # convert to array to do operations quickly (using list will not work)

cap = cv2.VideoCapture(0)                        # camera setup   
same_persone = False                             # initialize shared variable
frame_num = 0                                    # to count frames
while frame_num < 30:                            # 30 frames is enough to detect face
    ret, frame = cap.read()                      # read frame by frame
    detect_faces_from_frame(frame)               # using detect faces function to get face locations and names in the frame
    cv2.imshow("Frame", frame)                   # show frame after processing
    same_persone = read_shared_variable()        # read shared variable
    print(f'frame number: {frame_num + 1} - verified: {same_persone}')
    frame_num += 1
    if same_persone == True:                     # if it's True (unknown face matches with known face) 
        break
    if cv2.waitKey(1) & 0xFF == ord('q'):        # press q to quit
        break

cap.release()                                    # release camera
cv2.destroyAllWindows()                          # close all windows (imshow windows)
if same_persone == False:                        # if it's False (unknown face does not matches with known face)
    print("playing alarm")
    playsound('alarm.wav')
