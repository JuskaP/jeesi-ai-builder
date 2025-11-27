# Jeesi.ai Railway Backend

Railway backend service for executing heavy and complex AI agents.

## Features

- **Heavy Agent Execution**: No 60s timeout limits, higher memory
- **WebSocket Support**: Real-time streaming and persistent connections
- **Complex Dependencies**: Support for any Node.js packages, Python integration possible
- **Supabase Integration**: Seamless auth and database access
- **Credit Management**: Automatic credit tracking and deduction

## Architecture

- **Express.js** server with TypeScript
- **Supabase Auth** JWT verification
- **API Key** authentication for widget/external calls
- **WebSocket** server for real-time communication
- **Lovable AI Gateway** integration for AI model access

## Deployment to Railway

### 1. Prerequisites
- Railway account (sign up at railway.app)
- Git repository with this code
- Supabase project credentials

### 2. Deploy Steps

1. **Push code to GitHub**:
   ```bash
   cd railway-backend
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-repo-url>
   git push -u origin main
   ```

2. **Create Railway Project**:
   - Go to railway.app
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository

3. **Configure Environment Variables** in Railway:
   ```
   PORT=3000
   SUPABASE_URL=https://kyysnciirgauhzzqobly.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=<from_supabase_settings>
   SUPABASE_JWT_SECRET=<from_supabase_jwt_secret>
   LOVABLE_API_KEY=<from_lovable_secrets>
   RAILWAY_BACKEND_SECRET=<generate_random_32_char_string>
   ```

4. **Deploy**:
   - Railway will auto-detect Node.js and deploy
   - Monitor logs for successful startup
   - Note the Railway URL (e.g., `yourapp.up.railway.app`)

### 3. Get Supabase JWT Secret

Run this SQL in Supabase SQL Editor:
```sql
SELECT current_setting('app.settings.jwt_secret');
```

Copy the result and add it to Railway environment variables.

## API Endpoints

### Health Check
```bash
GET /health
```

### Execute Agent (HTTP)
```bash
POST /api/agent/execute
Authorization: Bearer <supabase_jwt_token>
Content-Type: application/json

{
  "agentId": "uuid",
  "messages": [
    {"role": "user", "content": "Hello"}
  ],
  "stream": false
}
```

### Execute Agent (WebSocket)
```javascript
const ws = new WebSocket('wss://yourapp.up.railway.app/ws?token=<jwt_token>');

ws.send(JSON.stringify({
  type: 'agent_execute',
  agentId: 'agent-uuid',
  messages: [{ role: 'user', content: 'Hello' }]
}));
```

## Local Development

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up .env file**:
   ```bash
   cp .env.example .env
   # Edit .env with your credentials
   ```

3. **Run development server**:
   ```bash
   npm run dev
   ```

4. **Build for production**:
   ```bash
   npm run build
   npm start
   ```

## Testing

```bash
# Test health endpoint
curl https://yourapp.up.railway.app/health

# Test agent execution
curl -X POST https://yourapp.up.railway.app/api/agent/execute \
  -H "Authorization: Bearer <jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{"agentId":"uuid","messages":[{"role":"user","content":"test"}]}'
```

## Monitoring

- **Railway Dashboard**: View logs and metrics
- **Logs**: Available in Railway dashboard
- **Health Check**: Monitor `/health` endpoint

## Scaling

Railway auto-scales based on:
- Memory usage
- Request volume
- CPU utilization

Configure in Railway dashboard under "Settings" → "Resources".
