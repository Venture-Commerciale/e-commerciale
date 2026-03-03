import requests
r = requests.post('http://localhost:8080/api/auth/login', json={'email':'customer@demo.com','password':'Password123'})
print(r.status_code, r.text)
if r.status_code==200:
    token = r.json().get('data', {}).get('accessToken')
    print('token', token)
    r2 = requests.get('http://localhost:8080/api/orders', headers={'Authorization': f'Bearer {token}'})
    print('orders', r2.status_code, r2.text)
