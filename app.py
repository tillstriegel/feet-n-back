from flask import Flask, request, jsonify, render_template, redirect, url_for, session
from flask_cors import CORS
import logging
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from functools import wraps
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Configure logging
logging.basicConfig(level=logging.DEBUG)

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///feedback.db'
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', os.urandom(24))
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# Get credentials from environment variables
ADMIN_USERNAME = os.getenv('ADMIN_USERNAME')
ADMIN_PASSWORD = os.getenv('ADMIN_PASSWORD')

if not ADMIN_USERNAME or not ADMIN_PASSWORD:
    raise ValueError('Admin credentials not set in environment variables')

class Feedback(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    site = db.Column(db.String(200), nullable=False)
    feedback = db.Column(db.Text, nullable=False)
    date = db.Column(db.DateTime, default=datetime.utcnow)

# Authentication required decorator
def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'logged_in' not in session:
            return redirect(url_for('login'))
        return f(*args, **kwargs)
    return decorated_function

@app.route('/submit_feedback', methods=['POST'])
def submit_feedback():
    try:
        app.logger.info(f'Received feedback submission request: {request.json}')
        site = request.json.get('site')
        feedback = request.json.get('feedback')
        
        if not site or not feedback:
            app.logger.error('Missing site or feedback in request')
            return jsonify({'error': 'Missing required fields'}), 400
        
        new_feedback = Feedback(site=site, feedback=feedback)
        db.session.add(new_feedback)
        db.session.commit()
        
        app.logger.info(f'Feedback stored successfully for site: {site}')
        return jsonify({'message': 'Feedback submitted successfully!'}), 201
    
    except Exception as e:
        app.logger.error(f'Error storing feedback: {str(e)}')
        db.session.rollback()
        return jsonify({'error': 'Failed to store feedback'}), 500

@app.route('/dashboard')
@login_required
def dashboard():
    feedbacks = Feedback.query.all()
    return render_template('dashboard.html', feedbacks=feedbacks)

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        if username == ADMIN_USERNAME and password == ADMIN_PASSWORD:
            session['logged_in'] = True
            return redirect(url_for('dashboard'))
        return 'Invalid credentials', 401
    return render_template('login.html')

if __name__ == '__main__':
    with app.app_context():
        db.create_all()  # Create database tables
    app.run(debug=True)
