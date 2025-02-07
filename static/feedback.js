// Create and inject CSS
const style = document.createElement('style');
style.textContent = `
    .feedback-bubble {
        position: fixed;
        bottom: 24px;
        right: 24px;
        height: 32px;
        padding: 0 14px;
        background-color: transparent;
        border-radius: 16px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: rgba(0, 0, 0, 0.7);
        cursor: pointer;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen-Sans, Ubuntu, Cantarell, 'Helvetica Neue', sans-serif;
        font-size: 13px;
        font-weight: 400;
        letter-spacing: 0;
        transition: all 0.2s ease;
        z-index: 10000;
        border: 1px solid rgba(0, 0, 0, 0.15);
    }

    .feedback-bubble:hover {
        transform: translateY(-1px);
        color: rgba(0, 0, 0, 0.9);
        border-color: rgba(0, 0, 0, 0.3);
        background-color: rgba(0, 0, 0, 0.02);
    }

    .feedback-form {
        position: fixed;
        bottom: 84px;
        right: 24px;
        width: 320px;
        background: #fff;
        padding: 24px;
        border-radius: 16px;
        box-shadow: 0 4px 24px rgba(0,0,0,0.08);
        display: none;
        z-index: 10000;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen-Sans, Ubuntu, Cantarell, 'Helvetica Neue', sans-serif;
        border: 1px solid rgba(0,0,0,0.1);
    }

    .feedback-form h3 {
        margin: 0 0 16px 0;
        font-size: 16px;
        font-weight: 500;
        color: #111;
        letter-spacing: -0.01em;
    }

    .feedback-form .anonymous-note {
        font-size: 12px;
        color: #666;
        margin: -8px 0 20px 0;
        opacity: 0.8;
        text-align: center;
    }

    .feedback-form textarea {
        width: 100%;
        min-height: 120px;
        margin: 0 0 8px 0;
        padding: 12px;
        border: 1px solid rgba(0,0,0,0.1);
        border-radius: 12px;
        resize: vertical;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen-Sans, Ubuntu, Cantarell, 'Helvetica Neue', sans-serif;
        font-size: 14px;
        line-height: 1.5;
        transition: border-color 0.2s ease;
    }

    .feedback-form textarea:focus {
        outline: none;
        border-color: #000;
    }

    .feedback-form button {
        background: #000;
        color: #fff;
        border: none;
        padding: 12px 20px;
        border-radius: 12px;
        cursor: pointer;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen-Sans, Ubuntu, Cantarell, 'Helvetica Neue', sans-serif;
        font-size: 14px;
        font-weight: 500;
        transition: all 0.2s ease;
        width: 100%;
    }

    .feedback-form button:hover {
        background: #111;
        transform: translateY(-1px);
    }
    
    .feedback-success {
        text-align: center;
        padding: 20px;
    }
    
    .feedback-success h3 {
        color: #16a34a;
        margin-bottom: 8px;
    }
    
    .feedback-success p {
        color: #666;
        margin: 0;
        font-size: 14px;
    }`;

document.head.appendChild(style);

// Create feedback bubble and form
const bubble = document.createElement('div');
bubble.className = 'feedback-bubble';
bubble.textContent = 'Feedback';

const form = document.createElement('div');
form.className = 'feedback-form';
const formContent = `
    <h3>Feedback geben</h3>
    <textarea placeholder="Teile deine Gedanken."></textarea>
    <div class="anonymous-note">Dein Feedback wird anonym gesendet.</div>
    <button>Senden</button>
`;

const successContent = `
    <div class="feedback-success">
        <h3>Danke!</h3>
        <p>Dein Feedback wurde erfolgreich gesendet.</p>
    </div>
`;

form.innerHTML = formContent;

// Add elements to page
document.body.appendChild(bubble);
document.body.appendChild(form);

// Handle bubble click
bubble.addEventListener('click', () => {
    const isVisible = form.style.display === 'block';
    form.style.display = isVisible ? 'none' : 'block';
});

// Handle form submission
form.querySelector('button').addEventListener('click', () => {
    const feedback = form.querySelector('textarea').value;
    if (feedback.trim()) {
        submitFeedback(window.location.href, feedback);
        form.innerHTML = successContent;
        setTimeout(() => {
            form.style.display = 'none';
            form.innerHTML = formContent;
        }, 2000);
    }
});

const FEEDBACK_SERVER_URL = 'http://127.0.0.1:5000/submit_feedback';

function submitFeedback(site, feedback) {
    fetch(FEEDBACK_SERVER_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ site: site, feedback: feedback })
    })
    .then(response => response.json())
    .then(data => console.log(data.message))
    .catch((error) => console.error('Error:', error));
}
