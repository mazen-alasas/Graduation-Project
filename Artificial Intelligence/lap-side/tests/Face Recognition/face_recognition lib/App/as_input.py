import face_recognition as fr
import streamlit as st
from PIL import Image
import numpy as np


st.title("Face Recognition App")

name = st.text_input("Enter your name :")

upload_file = st.file_uploader("Upload an image ...", type=["jpg", "jpeg", "png"])



enable_webcam_x = st.checkbox("Enable Webcam again")
x_image = st.camera_input("Take a picture again", disabled = not enable_webcam_x)


if upload_file is not None:
    # unknown_encoding = fr.face_encodings(image)[0]

    img = Image.open(upload_file)
    # st.image(img, caption='Uploaded Image', use_column_width = True)
    # st.write("image uploaded")
    img_array = np.array(img)


    face_locations = fr.face_locations(img_array)

    if face_locations:
        unknown_encoding = fr.face_encodings(img_array, face_locations)[0]
        
        if x_image is not None:
            x_img = Image.open(x_image)
            x_img_array = np.array(x_img)

            x_face_locations = fr.face_locations(x_img_array)

            if x_face_locations:
                x_unknown_encoding = fr.face_encodings(x_img_array, x_face_locations)[0]

                is_match = fr.compare_faces([unknown_encoding], x_unknown_encoding)[0]

                if is_match:
                    st.write("You are a verified person")
                else:
                    st.write("You are not a verified person")
            else:
                st.write("No face detected in the image. Please try again.")
        else:
            st.write("Please take a picture first.")

else:
    st.write("Please take a picture first.")

