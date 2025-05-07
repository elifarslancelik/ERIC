import requests

# Create new answer
response = requests.post('http://localhost:5000/generate', json={
    'input_text': 'Make an analysis about artificial intelligence and the future of art',
    'tags': ['#Tech', '#Art']
})

first_response = response.json()
response_id = first_response['id']

# Decode response with ID
decoded = requests.get(f'http://localhost:5000/decode/{response_id}')

# Combine multiple answers
combined = requests.post('http://localhost:5000/combine', json={
    'response_ids': ['id1', 'id2'],
    'new_prompt': 'Combining these two topics and discussing their impact on the future'
}) 