from firebase_admin import credentials, initialize_app, db

cred = credentials.Certificate(r"G:\final khales 2\adas-v2v-project-firebase-adminsdk-fbsvc-9564b12017.json")
initialize_app(cred, {
    'databaseURL': 'https://adas-v2v-project-default-rtdb.firebaseio.com/'
})


def update_feature_state(feature_name, status, message=""):

    feature_ref = db.reference(f'features/{feature_name}')
    feature_ref.set({
        'state': status,
        'message': message,
    })
    print(f"[Firebase] {feature_name} → State: {status}, Message: '{message}'")


def send_message(message):

    messages_ref = db.reference('features/messages')
    messages_ref.push({
        'message': message,
    })
    print(f"[Firebase] Message sent: {message}")