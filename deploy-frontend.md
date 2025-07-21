# Frontend Deployment to S3 + CloudFront

## Step 1: Update API URL

Edit `frontend/src/services/authService.js`:

```javascript
this.baseURL = "http://your-ec2-public-ip/api"; // Replace with your EC2 IP
```

## Step 2: Build Frontend

```bash
cd frontend
npm install
npm run build
```

## Step 3: Create S3 Bucket

1. Go to AWS S3 Console
2. Create bucket: `investment-token-frontend-[random-number]`
3. Enable static website hosting
4. Upload all files from `frontend/dist/` folder
5. Set bucket policy for public read access

## Step 4: Create CloudFront Distribution

1. Go to AWS CloudFront Console
2. Create distribution
3. Origin: Your S3 bucket
4. Default root object: `index.html`
5. Error pages: 404 → `/index.html` (for React Router)

## Step 5: Update Backend CORS

Update your `.env` file on EC2:

```
FRONTEND_URL=https://your-cloudfront-domain.cloudfront.net
```

Restart your backend:

```bash
pm2 restart investment-token-api
```

## Testing

- Frontend: `https://your-cloudfront-domain.cloudfront.net`
- Backend API: `http://your-ec2-ip/api/stats`
