# Railway Backend Setup Guide for Jeesi.ai

Complete guide to deploying Railway backend for heavy agent workloads while keeping Supabase for auth + database.

## Architecture Overview

### Hybrid Execution Model

```
┌─────────────────────────────────────────────────┐
│              Frontend (Lovable)                 │
│  - User Interface                               │
│  - Agent Builder                                │
│  - Dashboard                                    │
└─────────────────┬───────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────┐
│        Supabase/Lovable Cloud                   │
│  - Authentication (JWT tokens)                  │
│  - Database (agents, credits, users)            │
│  - Edge Functions (routing logic)               │
└─────────┬──────────────────────┬────────────────┘
          │                      │
          ▼                      ▼
┌─────────────────┐    ┌─────────────────────────┐
│ Simple Agents   │    │    Railway Backend      │
│ (Edge Function) │    │   (Heavy Agents)        │
│                 │    │                         │
│ • <60s runtime  │    │ • No timeout limits     │
│ • Low memory    │    │ • High memory           │
│ • Quick tasks   │    │ • Complex dependencies  │
│                 │    │ • WebSocket support     │
└─────────────────┘    └─────────────────────────┘
```

### When to Use Railway vs Edge Functions

| Feature | Edge Functions | Railway Backend |
|---------|---------------|-----------------|
| **Execution Time** | <60 seconds | Unlimited |
| **Memory** | Limited (~256MB) | Configurable (up to 8GB+) |
| **Dependencies** | Deno modules only | Any npm package |
| **WebSockets** | Limited support | Full support |
| **Cost** | Included in Lovable | Railway usage-based |
| **Best For** | Quick responses, simple logic | ML models, heavy processing, streaming |

---

## Part 1: Railway Account & Project Setup

### 1.1 Create Railway Account

1. Go to [railway.app](https://railway.app)
2. Click "Sign up" → "Sign up with GitHub"
3. Authorize Railway to access your GitHub account
4. Complete account setup

### 1.2 Prepare Git Repository

```bash
# Navigate to your Railway backend folder
cd railway-backend

# Initialize git (if not already initialized)
git init

# Add all files
git add .

# Commit
git commit -m "Initial Railway backend for Jeesi.ai heavy agents"

# Create GitHub repository and push
# (Follow GitHub instructions to create repo)
git remote add origin https://github.com/yourusername/jeesi-railway-backend.git
git branch -M main
git push -u origin main
```

### 1.3 Create Railway Project

1. In Railway dashboard, click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. Choose your `jeesi-railway-backend` repository
4. Railway will automatically detect Node.js and start building

---

## Part 2: Configure Environment Variables

### 2.1 Get Supabase Credentials

**Get JWT Secret:**
1. Open Supabase SQL Editor (via Lovable Cloud tab)
2. Run this query:
   ```sql
   SELECT current_setting('app.settings.jwt_secret');
   ```
3. Copy the result (it's a long string)

**Get Service Role Key:**
1. Go to Lovable Cloud → Backend → Settings
2. Copy the Service Role Key

### 2.2 Set Railway Environment Variables

In Railway dashboard → Your Project → Variables:

```env
PORT=3000
NODE_ENV=production

# Supabase Configuration
SUPABASE_URL=https://kyysnciirgauhzzqobly.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<paste_service_role_key>
SUPABASE_JWT_SECRET=<paste_jwt_secret_from_query>

# Lovable AI
LOVABLE_API_KEY=<from_lovable_secrets>

# Railway Security
RAILWAY_BACKEND_SECRET=<generate_random_32_char_string>
```

**Generate Random Secret:**
```bash
# Use this command or any password generator
openssl rand -hex 32
```

### 2.3 Get Lovable API Key

The `LOVABLE_API_KEY` is already configured in your Supabase secrets. To get it:

1. In Lovable, use this command in console logs or edge function logs
2. OR copy from your Supabase project settings

---

## Part 3: Deploy to Railway

### 3.1 Trigger Deployment

Railway automatically deploys when you push to your repository. To manually trigger:

1. Go to Railway dashboard → Your project
2. Click **"Deploy"** button
3. Monitor deployment logs

### 3.2 Get Railway URL

Once deployed successfully:

1. Railway assigns a URL like: `yourapp-production.up.railway.app`
2. Copy this URL - you'll need it for configuration

### 3.3 Test Deployment

```bash
# Health check
curl https://yourapp-production.up.railway.app/health

# Expected response:
# {"status":"healthy","timestamp":"...","service":"jeesi-railway-backend"}
```

---

## Part 4: Configure Supabase to Use Railway

### 4.1 Add Railway URL Secret

In Lovable Cloud, add a new secret:

**Secret Name:** `RAILWAY_BACKEND_URL`  
**Value:** `https://yourapp-production.up.railway.app`

This allows edge functions to route heavy agents to Railway.

### 4.2 Mark Agents as Heavy

For agents that need Railway execution:

1. Go to Dashboard → Select Agent → Settings
2. Scroll to **"Railway Backend Execution"** section
3. Toggle **"Execute on Railway Backend"** to ON
4. (Optional) Set custom Railway URL if different from default
5. Click **Save**

---

## Part 5: Testing the Pipeline

### 5.1 Test Simple Agent (Edge Function)

1. Create a test agent (leave "Execute on Railway" OFF)
2. Publish the agent
3. Test via widget or API
4. Should execute quickly via edge function

### 5.2 Test Heavy Agent (Railway)

1. Create another test agent
2. Toggle "Execute on Railway Backend" ON
3. Publish the agent
4. Test via widget or API
5. Check Railway logs for execution

### 5.3 Monitor Execution

**Railway Logs:**
- Railway Dashboard → Your Project → Logs
- Look for `[AGENT-EXECUTE]` and `[AGENT-EXECUTOR]` entries

**Supabase Logs:**
- Lovable Cloud → Backend → Logs
- Look for routing decisions in `agent-runtime` function

---

## Part 6: Scaling & Production

### 6.1 Railway Resource Configuration

In Railway Dashboard → Settings → Resources:

- **Memory**: Start with 512MB, scale up as needed
- **CPU**: Railway auto-allocates based on usage
- **Replicas**: Use horizontal scaling for high traffic

### 6.2 Cost Optimization

Railway pricing is usage-based:
- **Development**: Free tier sufficient for testing
- **Production**: ~$5-20/month for moderate usage
- **Scale**: Pay only for what you use

### 6.3 Monitoring & Alerts

**Set up Railway Alerts:**
1. Railway Dashboard → Settings → Notifications
2. Configure email alerts for:
   - Deployment failures
   - High error rates
   - Resource limits

---

## Part 7: Advanced Features

### 7.1 WebSocket Support

Railway backend includes WebSocket server at `/ws`:

```javascript
// Connect from frontend
const ws = new WebSocket(
  `wss://yourapp.up.railway.app/ws?token=${jwtToken}`
);

// Send agent execution request
ws.send(JSON.stringify({
  type: 'agent_execute',
  agentId: 'uuid',
  messages: [{ role: 'user', content: 'Hello' }]
}));

// Receive streaming responses
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  if (data.type === 'agent_chunk') {
    console.log('Chunk:', data.content);
  }
};
```

### 7.2 Custom ML Models

Add Python support for ML models:

1. Install Python in Railway (auto-detected)
2. Add requirements.txt for ML libraries
3. Create Python worker scripts
4. Call from Node.js using child_process

### 7.3 Database Connection Pooling

For high traffic, add connection pooling:

```typescript
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.SUPABASE_DB_URL,
  max: 20
});
```

---

## Troubleshooting

### Railway Deployment Failed

**Check:**
- Build logs in Railway dashboard
- Ensure all dependencies in package.json
- Verify Node version (>=20.0.0)

**Solution:**
```bash
# Test build locally first
npm install
npm run build
npm start
```

### "Heavy agent execution not configured"

**Check:**
- `RAILWAY_BACKEND_URL` secret is set in Supabase
- Railway app is deployed and healthy
- Agent has `is_heavy = true` in database

### Authentication Errors

**Check:**
- `SUPABASE_JWT_SECRET` matches Supabase project
- JWT token is valid and not expired
- Service role key is correct

**Get JWT Secret:**
```sql
SELECT current_setting('app.settings.jwt_secret');
```

### High Railway Costs

**Optimize:**
- Use edge functions for simple agents
- Implement request caching
- Scale down memory if over-provisioned
- Use Railway's sleep feature for dev environments

---

## Security Checklist

- ✅ Never expose service role keys in frontend
- ✅ Always validate JWT tokens on Railway
- ✅ Use HTTPS only (Railway auto-provides SSL)
- ✅ Implement rate limiting if needed
- ✅ Monitor for suspicious activity
- ✅ Keep dependencies updated
- ✅ Use environment variables for all secrets

---

## Support & Resources

- **Railway Documentation**: [docs.railway.app](https://docs.railway.app)
- **Supabase Edge Functions**: [supabase.com/docs/guides/functions](https://supabase.com/docs/guides/functions)
- **Jeesi.ai Support**: support@jeesi.ai

---

## Quick Reference

### Railway URLs
- Dashboard: https://railway.app/dashboard
- Your App: https://yourapp-production.up.railway.app
- Logs: Railway Dashboard → Project → Logs

### Key Endpoints
- Health: `GET /health`
- Execute Agent: `POST /api/agent/execute`
- WebSocket: `wss://yourapp.up.railway.app/ws`

### Database Functions
- `has_role(user_id, role)`: Check user roles
- `deduct_credits(user_id, credits)`: Deduct credits
- `get_admin_stats()`: Get platform statistics

### Agent Fields
- `is_heavy`: Boolean - route to Railway
- `railway_url`: Text - custom Railway URL (optional)
- `is_published`: Boolean - agent visibility

---

**Ready to Scale!** Your Jeesi.ai platform can now handle both simple agents (edge functions) and complex agents (Railway) seamlessly.
