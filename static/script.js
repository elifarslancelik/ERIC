document.addEventListener('DOMContentLoaded', function() {
    initializeTagSystem();
    initializeTextArea();
    initializeAnimations();
});

function initializeTagSystem() {
    document.querySelectorAll('.tag').forEach(tag => {
        tag.addEventListener('click', function() {
            document.querySelectorAll('.tag').forEach(t => t.classList.remove('selected'));
            this.classList.add('selected');
            animateSelection(this);
        });
    });
}

function animateSelection(element) {
    element.style.transform = 'scale(1.1)';
    setTimeout(() => {
        element.style.transform = 'scale(1)';
    }, 200);
}

function initializeTextArea() {
    const textarea = document.getElementById('input_text');
    const charCount = document.getElementById('currentCount');
    const MAX_CHARS = 25000;
    
    textarea.addEventListener('input', function() {
        // Automatic height adjustment (limited)
        const maxHeight = 400; // Must be the same as max-height in CSS
        this.style.height = 'auto';
        const newHeight = Math.min(this.scrollHeight, maxHeight);
        this.style.height = newHeight + 'px';
        
        // character counter
        const remaining = this.value.length;
        charCount.textContent = remaining;
        
        // change color
        const countElement = document.querySelector('.character-count');
        if (remaining >= MAX_CHARS * 0.9) {
            countElement.classList.add('limit-reached');
            countElement.classList.remove('limit-close');
        } else if (remaining >= MAX_CHARS * 0.8) {
            countElement.classList.add('limit-close');
            countElement.classList.remove('limit-reached');
        } else {
            countElement.classList.remove('limit-close', 'limit-reached');
        }
    });

    // key control
    textarea.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            generateResponse();
        }
    });
}

function initializeAnimations() {
    // Smooth transition effect on page load
    document.body.style.opacity = '0';
    setTimeout(() => {
        document.body.style.opacity = '1';
        document.body.style.transition = 'opacity 0.5s ease-in';
    }, 100);

    // Hide loading indicator at the beginning
    document.getElementById('loading').style.display = 'none';
}

async function generateResponse() {
    const inputText = document.getElementById('input_text').value;
    const selectedTag = document.querySelector('.tag.selected');
    const tags = selectedTag ? [`#${selectedTag.dataset.tag}`] : ['#general'];
    
    if (!inputText.trim()) {
        showError('Please enter a message');
        return;
    }
    
    showLoading(true);
    
    try {
        const response = await fetch('/generate', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({input_text: inputText, tags: tags})
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showResponse(data, tags);
            showSuccess('Response generated successfully!');
        } else {
            showError(data.error || 'An error occurred');
        }
    } catch (error) {
        showError('An error occurred: ' + error.message);
    } finally {
        showLoading(false);
    }
}

function showLoading(show) {
    const loading = document.getElementById('loading');
    const sendButton = document.getElementById('sendButton');
    
    loading.style.display = show ? 'inline-flex' : 'none';
    sendButton.disabled = show;
}

function showError(message) {
    const error = document.getElementById('error');
    error.textContent = message;
    error.style.opacity = '1';
    setTimeout(() => {
        error.style.opacity = '0';
    }, 3000);
}

function showSuccess(message) {
    const success = document.getElementById('success');
    success.textContent = message;
    success.style.opacity = '1';
    setTimeout(() => {
        success.style.opacity = '0';
    }, 3000);
}

function showResponse(data, tags) {
    const timestamp = new Date().toLocaleString('en-US');
    const responseDiv = document.getElementById('response');
    
    responseDiv.innerHTML = `
        <div class="metadata">
            <strong>ID:</strong> ${data.id}<br>
            <strong>Timestamp:</strong> ${timestamp}<br>
            <strong>Persona:</strong> ${data.persona}<br>
            <strong>Tags:</strong> ${tags.join(', ')}
        </div>
        <div class="response-content">
            ${data.content}
        </div>
    `;
    
    // show export button
    const exportButton = document.getElementById('exportButton');
    if (exportButton) {
        exportButton.style.display = 'block';
    }
    
    // scroll answer
    responseDiv.scrollIntoView({ behavior: 'smooth' });
}

// Accordion functionality
document.querySelector('.tags-toggle').addEventListener('click', function() {
    const tagsSection = document.querySelector('.tags-section');
    tagsSection.classList.toggle('expanded');
});

// tab functionality
document.querySelectorAll('.tab-button').forEach(button => {
    button.addEventListener('click', () => {
        // Aktif tab'i değiştir
        document.querySelectorAll('.tab-button').forEach(b => b.classList.remove('active'));
        button.classList.add('active');
        
        // show content
        const tabName = button.dataset.tab;
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
            if (content.dataset.tab === tabName) {
                content.classList.add('active');
            }
        });
    });
});

// Close the persona selection field on page load
document.addEventListener('DOMContentLoaded', function() {
    // ... mevcut kodlar ...
    
    // Auto close when Persona is selected
    document.querySelectorAll('.tag').forEach(tag => {
        tag.addEventListener('click', () => {
            setTimeout(() => {
                document.querySelector('.tags-section').classList.remove('expanded');
            }, 300);
        });
    });
});

// Decoder function
async function decodeResponse() {
    const responseId = document.getElementById('responseId').value.trim();
    
    if (!responseId) {
        showError('Please enter a response ID');
        return;
    }
    
    try {
        const response = await fetch(`/decode/${responseId}`);
        const data = await response.json();
        
        if (response.ok) {
            const decodedResponse = document.getElementById('decodedResponse');
            decodedResponse.innerHTML = `
                <div class="metadata">
                    <strong>ID:</strong> ${responseId}<br>
                    <strong>Timestamp:</strong> ${new Date(data.timestamp).toLocaleString('tr-TR')}<br>
                    <strong>Tags:</strong> ${data.tags.join(', ')}
                </div>
                <div class="response-content">
                    ${data.content}
                </div>
            `;
            showSuccess('Response retrieved successfully!');
        } else {
            showError(data.error || 'Response not found');
        }
    } catch (error) {
        showError('An error occurred: ' + error.message);
    }
}

// Export function
function exportConversation() {
    const responseDiv = document.getElementById('response');
    const inputText = document.getElementById('input_text').value;
    const selectedTag = document.querySelector('.tag.selected');
    
    if (!responseDiv.textContent) {
        showError('No conversation to export');
        return;
    }
    
    const metadata = responseDiv.querySelector('.metadata').textContent;
    const content = responseDiv.querySelector('.response-content').textContent;
    
    const exportText = `ERIC AI Assistant - Conversation Record
Date: ${new Date().toLocaleString('en-US')}
${'-'.repeat(50)}

USER MESSAGE:
${inputText}

SELECTED PERSONA:
${selectedTag ? selectedTag.textContent : 'Not specified'}

METADATA:
${metadata}

RESPONSE:
${content}

${'-'.repeat(50)}
Generated by ERIC AI Assistant`;
    
    // create,download file
    const blob = new Blob([exportText], { type: 'text/plain;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ERIC_Conversation_${new Date().toISOString().slice(0,10)}.txt`;
    
    // link, click
    document.body.appendChild(a);
    a.click();
    
    // cleaning
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    
    showSuccess('Conversation saved successfully!');
}

// User Menu Functions
function toggleUserMenu() {
    const dropdown = document.getElementById('userDropdown');
    const arrow = document.querySelector('.menu-arrow');
    
    dropdown.classList.toggle('active');
    arrow.classList.toggle('active');
}

function openSettings() {
    // settings, modal
    console.log('Settings opened');
}

function logout() {
    // Logout
    console.log('Logging out...');
}

// close the menu when clicking outside
document.addEventListener('click', function(event) {
    const userMenu = document.querySelector('.user-menu');
    const dropdown = document.getElementById('userDropdown');
    const arrow = document.querySelector('.menu-arrow');
    
    if (!userMenu.contains(event.target) && dropdown.classList.contains('active')) {
        dropdown.classList.remove('active');
        arrow.classList.remove('active');
    }
}); 