# Jeesi.ai Pricing Model Analysis

## Executive Summary

This document provides a comprehensive cost-based pricing model for Jeesi.ai, an AI agent builder platform. The analysis is based on actual infrastructure costs and realistic usage patterns for SMEs, solo founders, and agencies.

---

## 1. Cost Structure Analysis

### 1.1 Infrastructure Costs Per Component

#### A. LLM Inference Costs (via Lovable AI Gateway)

| Model | Input Cost (per 1M tokens) | Output Cost (per 1M tokens) | Avg Cost per Agent Chat |
|-------|---------------------------|----------------------------|------------------------|
| google/gemini-2.5-flash (default) | $0.075 | $0.30 | ~$0.002 |
| google/gemini-2.5-pro | $1.25 | $5.00 | ~$0.015 |
| openai/gpt-5 | $2.50 | $10.00 | ~$0.025 |
| openai/gpt-5-mini | $0.15 | $0.60 | ~$0.003 |

**Typical Agent Creation Session:**
- Avg conversation: 8-12 messages
- Avg tokens per session: ~15,000 input + 8,000 output
- Cost per agent creation: **$0.01 - $0.05** (using default model)

**Customer Agent Runtime (per conversation):**
- Avg conversation: 5-8 messages
- Avg tokens: ~5,000 input + 3,000 output
- Cost per runtime conversation: **$0.001 - $0.003**

#### B. Railway Backend Costs

| Resource | Cost | Usage Pattern |
|----------|------|---------------|
| Compute (Hobby) | $5/month | Light usage, shared |
| Compute (Pro) | $20/month base + usage | Medium-heavy usage |
| Memory (per GB/hour) | $0.000231 | Avg 512MB-2GB per agent |
| CPU (per vCPU/hour) | $0.000463 | Burst during generation |

**Per Heavy Agent Execution:**
- Avg execution time: 30-120 seconds
- Memory: 1GB average
- Cost per execution: **$0.0005 - $0.002**

#### C. Supabase (Lovable Cloud) Costs

| Resource | Free Tier | Pro Tier ($25/mo) | Per Unit Over |
|----------|-----------|-------------------|---------------|
| Database | 500MB | 8GB | $0.125/GB |
| Storage | 1GB | 100GB | $0.021/GB |
| Edge Function Invocations | 500K/mo | 2M/mo | $2/million |
| Bandwidth | 2GB | 250GB | $0.09/GB |
| Realtime Connections | 200 | 500 | $10/1000 |

**Per Active User Database Usage:**
- Agents table: ~2KB per agent
- Conversations: ~10KB per conversation
- Messages: ~1KB per message
- Avg storage per user/month: **5-50MB**

#### D. Stripe Fees

| Transaction Type | Fee |
|------------------|-----|
| Standard | 2.9% + $0.30 |
| Subscription | 2.9% + $0.30 |
| Invoice | 0.4% (capped at $2) |

#### E. File Storage & CDN

| Service | Cost |
|---------|------|
| Agent images (Supabase Storage) | $0.021/GB |
| Bandwidth | $0.09/GB |
| Avg per user/month | **$0.05 - $0.50** |

---

### 1.2 Total Cost Per Active User Per Month

#### Light User (1-2 agents, <100 agent conversations)
| Component | Cost |
|-----------|------|
| LLM (agent creation) | $0.05 |
| LLM (runtime) | $0.20 |
| Database | $0.02 |
| Edge Functions | $0.01 |
| Storage | $0.05 |
| **Total** | **$0.33** |

#### Medium User (3-5 agents, 100-500 conversations)
| Component | Cost |
|-----------|------|
| LLM (agent creation) | $0.15 |
| LLM (runtime) | $1.00 |
| Database | $0.10 |
| Edge Functions | $0.05 |
| Storage | $0.20 |
| Railway (heavy agents) | $0.50 |
| **Total** | **$2.00** |

#### Heavy User (10+ agents, 1000+ conversations)
| Component | Cost |
|-----------|------|
| LLM (agent creation) | $0.50 |
| LLM (runtime) | $5.00 |
| Database | $0.50 |
| Edge Functions | $0.25 |
| Storage | $1.00 |
| Railway (heavy agents) | $3.00 |
| **Total** | **$10.25** |

---

## 2. Tiered Pricing Structure

### 2.1 Proposed Tiers

#### 🆓 FREE TIER - "Explorer"
**Price: €0/month**

| Feature | Limit |
|---------|-------|
| Agents | 2 |
| Monthly Credits | 50 |
| Agent Conversations | 100/month |
| Custom Domains | ❌ |
| Remove Branding | ❌ |
| API Access | ❌ |
| Support | Community |

**Economics:**
- Cost to serve: €0.33/user/month
- Purpose: Acquisition funnel, product validation
- Expected conversion: 5-8% to paid

---

#### 🚀 STARTER TIER - "Builder"
**Price: €19/month (€190/year - 2 months free)**

| Feature | Limit |
|---------|-------|
| Agents | 5 |
| Monthly Credits | 200 |
| Agent Conversations | 1,000/month |
| Custom Domains | 1 |
| Remove Branding | ✅ |
| API Access | Basic |
| Support | Email |

**Economics:**
- Cost to serve: €2.00/user/month
- Gross margin: **89.5%**
- Target: Solo founders, freelancers

---

#### 💼 PRO TIER - "Professional"
**Price: €49/month (€490/year - 2 months free)**

| Feature | Limit |
|---------|-------|
| Agents | 15 |
| Monthly Credits | 500 |
| Agent Conversations | 5,000/month |
| Custom Domains | 3 |
| Remove Branding | ✅ |
| API Access | Full |
| Team Members | 3 |
| Priority Support | ✅ |
| Advanced Analytics | ✅ |

**Economics:**
- Cost to serve: €5.50/user/month
- Gross margin: **88.8%**
- Target: Growing SMEs, consultants

---

#### 🏢 BUSINESS TIER - "Scale"
**Price: €149/month (€1,490/year - 2 months free)**

| Feature | Limit |
|---------|-------|
| Agents | 50 |
| Monthly Credits | 2,000 |
| Agent Conversations | 25,000/month |
| Custom Domains | 10 |
| Remove Branding | ✅ |
| API Access | Full + Webhooks |
| Team Members | 10 |
| SSO | ✅ |
| SLA | 99.5% |
| Dedicated Support | ✅ |
| White-label Option | ✅ |

**Economics:**
- Cost to serve: €25/user/month
- Gross margin: **83.2%**
- Target: Agencies, mid-size companies

---

#### 🏛️ ENTERPRISE TIER - "Custom"
**Price: Starting €499/month (custom)**

| Feature | Limit |
|---------|-------|
| Agents | Unlimited |
| Monthly Credits | Custom |
| Agent Conversations | Unlimited |
| Custom Domains | Unlimited |
| Dedicated Infrastructure | ✅ |
| Custom Integrations | ✅ |
| Team Members | Unlimited |
| SSO + SAML | ✅ |
| SLA | 99.9% |
| Dedicated Success Manager | ✅ |
| On-premise Option | Available |
| Data Residency | EU/US choice |

**Economics:**
- Cost to serve: Variable (€50-200/month)
- Gross margin: **60-85%**
- Target: Large enterprises, regulated industries

---

## 3. Credit System Design

### 3.1 Credit Consumption Model

| Action | Credit Cost |
|--------|-------------|
| Create Agent (with Helpie) | 5 credits |
| Agent Conversation (customer) | 1 credit |
| Heavy Agent Execution | 3 credits |
| Image Analysis | 2 credits |
| Knowledge Base Update | 1 credit |
| Export/Deploy Agent | 2 credits |

### 3.2 Credit Packs (Add-ons)

| Pack | Credits | Price | Per Credit |
|------|---------|-------|------------|
| Micro | 100 | €9 | €0.09 |
| Small | 250 | €19 | €0.076 |
| Medium | 500 | €35 | €0.07 |
| Large | 1,000 | €59 | €0.059 |
| Bulk | 2,500 | €129 | €0.052 |

---

## 4. Financial Projections

### 4.1 Unit Economics Per Tier

| Tier | MRR | COGS | Gross Profit | Margin |
|------|-----|------|--------------|--------|
| Starter | €19 | €2.00 | €17.00 | 89.5% |
| Pro | €49 | €5.50 | €43.50 | 88.8% |
| Business | €149 | €25.00 | €124.00 | 83.2% |
| Enterprise | €499+ | €75.00 | €424.00 | 85.0% |

### 4.2 Customer Lifetime Value (LTV)

**Assumptions:**
- Avg subscription length: 18 months
- Annual churn: 5% (monthly ~0.42%)
- Expansion revenue: 15% annually

| Tier | Monthly | LTV (18mo) | With Expansion |
|------|---------|------------|----------------|
| Starter | €19 | €342 | €393 |
| Pro | €49 | €882 | €1,014 |
| Business | €149 | €2,682 | €3,084 |
| Enterprise | €499 | €8,982 | €10,329 |

### 4.3 Customer Acquisition Cost (CAC) Targets

| Tier | Target CAC | LTV:CAC Ratio | Payback (months) |
|------|------------|---------------|------------------|
| Starter | €50-80 | 5:1 - 8:1 | 3-4 |
| Pro | €150-250 | 4:1 - 7:1 | 3-5 |
| Business | €500-800 | 4:1 - 6:1 | 4-6 |
| Enterprise | €2,000-4,000 | 3:1 - 5:1 | 4-8 |

### 4.4 Break-Even Analysis

**Fixed Costs (Monthly):**
| Item | Cost |
|------|------|
| Supabase Pro | €25 |
| Railway Base | €20 |
| Domain/SSL | €5 |
| Monitoring | €10 |
| **Total Fixed** | **€60/month** |

**Break-even customers:**
- Starter only: 4 customers
- Pro only: 2 customers
- Mixed (realistic): 3 customers

---

## 5. Pricing Strategies Comparison

### 5.1 Value-Based Pricing ✅ RECOMMENDED

**Approach:** Price based on value delivered (time saved, revenue generated)

| Metric | Value |
|--------|-------|
| Time to build agent manually | 40+ hours |
| Jeesi.ai build time | 5-15 minutes |
| Developer hourly rate | €80-150 |
| Value created per agent | €3,200 - €6,000 |
| Capture rate | 0.5% - 2% |
| **Price justification** | €16 - €120/agent |

**Pros:**
- Aligns price with customer success
- Higher willingness to pay
- Defensible pricing

**Cons:**
- Hard to communicate
- Requires ROI education

---

### 5.2 Usage-Based Pricing

**Approach:** Pay per credit/conversation

| Model | Price Point |
|-------|-------------|
| Per conversation | €0.05 - €0.15 |
| Per agent/month | €5 - €15 |
| Per API call | €0.01 - €0.03 |

**Pros:**
- Low barrier to entry
- Scales with usage
- Fair to light users

**Cons:**
- Unpredictable revenue
- Customer budget anxiety
- Complex to explain

---

### 5.3 Hybrid Credit Model ✅ CURRENT

**Approach:** Base subscription + credit pool

**Pros:**
- Predictable base revenue
- Flexibility for heavy users
- Clear upgrade path

**Cons:**
- Complexity for users
- Credit tracking overhead

---

### 5.4 Per-Seat Pricing

**Approach:** Price per team member

| Team Size | Price/Seat | Total |
|-----------|------------|-------|
| 1-3 | €25 | €25-75 |
| 4-10 | €20 | €80-200 |
| 11+ | €15 | €165+ |

**Pros:**
- Simple to understand
- Scales with organization
- Common B2B model

**Cons:**
- Penalizes collaboration
- Doesn't reflect value

---

### 5.5 Unlimited Tier Strategy

**Approach:** High-price unlimited access

| Tier | Price | Features |
|------|-------|----------|
| Unlimited Pro | €199/mo | Unlimited agents, 10K conversations |
| Unlimited Business | €499/mo | Everything unlimited |

**Pros:**
- Attracts power users
- Predictable costs for customers
- Premium positioning

**Cons:**
- Risk of abuse
- Lower revenue from heavy users
- Difficult to sustain

---

## 6. Recommended Final Pricing Model

### 6.1 Structure: Hybrid Value + Usage

```
┌─────────────────────────────────────────────────────────────┐
│                    JEESI.AI PRICING                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  FREE        STARTER      PRO         BUSINESS    ENTERPRISE│
│  €0/mo       €19/mo       €49/mo      €149/mo     Custom    │
│                                                             │
│  2 agents    5 agents     15 agents   50 agents   Unlimited │
│  50 credits  200 credits  500 credits 2K credits  Custom    │
│  100 convos  1K convos    5K convos   25K convos  Unlimited │
│                                                             │
│  Community   Email        Priority    Dedicated   Success   │
│  support     support      support     support     Manager   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 6.2 Key Differentiators

| Feature | Free | Starter | Pro | Business | Enterprise |
|---------|------|---------|-----|----------|------------|
| Jeesi.ai Branding | Yes | No | No | No | No |
| Custom Domain | - | 1 | 3 | 10 | Unlimited |
| Team Members | 1 | 1 | 3 | 10 | Unlimited |
| API Access | - | Basic | Full | Full | Custom |
| Analytics | Basic | Standard | Advanced | Advanced | Custom |
| Integrations | - | 3 | 10 | Unlimited | Custom |
| SSO | - | - | - | ✅ | ✅ |
| SLA | - | - | 99% | 99.5% | 99.9% |

### 6.3 Justification

1. **Competitive positioning:** 
   - Cheaper than hiring developers (€80-150/hr)
   - Comparable to Zapier/Make for automation
   - Premium to basic chatbot builders

2. **Value delivery:**
   - Time savings: 40+ hours per agent
   - No-code accessibility
   - Instant deployment

3. **Market alignment:**
   - SME budget: €20-200/mo for tools
   - Agency budget: €100-500/mo
   - Enterprise budget: €500+/mo

---

## 7. Sensitivity Analysis

### 7.1 Price Elasticity Scenarios

| Scenario | Starter | Pro | Business | Impact on Revenue |
|----------|---------|-----|----------|-------------------|
| Base | €19 | €49 | €149 | Baseline |
| -20% price | €15 | €39 | €119 | +35% users, +8% rev |
| +20% price | €23 | €59 | €179 | -15% users, +2% rev |
| Remove free | - | €39 | €129 | -40% signups, +5% conv |

### 7.2 Cost Sensitivity

| Variable | +50% Cost | Impact |
|----------|-----------|--------|
| LLM costs | €3.00 → €4.50/user | -2% margin |
| Railway | €0.50 → €0.75/user | -0.5% margin |
| Supabase | €0.15 → €0.23/user | -0.2% margin |

**Conclusion:** Model is resilient to moderate cost increases.

---

## 8. Risks and Opportunities

### 8.1 Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| LLM price increase | Medium | High | Multi-provider strategy |
| Competitor undercutting | High | Medium | Focus on value, not price |
| Heavy user abuse | Medium | Medium | Fair use policy, soft limits |
| Churn at scale | Medium | High | Improve onboarding, support |
| Infrastructure outage | Low | High | Multi-region, SLA credits |

### 8.2 Opportunities

| Opportunity | Potential | Timeline |
|-------------|-----------|----------|
| Agency reseller program | +30% revenue | 6 months |
| Marketplace (agent templates) | +20% revenue | 12 months |
| White-label licensing | +50% revenue | 12 months |
| Industry-specific tiers | +25% revenue | 6 months |
| AI model cost reduction | +10% margin | Ongoing |

---

## 9. Industry Benchmarks

### 9.1 Comparable SaaS Pricing

| Company | Starter | Pro | Enterprise |
|---------|---------|-----|------------|
| **Jeesi.ai** | €19 | €49 | €499+ |
| Zapier | $20 | $69 | Custom |
| Make (Integromat) | $9 | $16 | Custom |
| Chatbase | $19 | $99 | Custom |
| Voiceflow | $50 | $125 | Custom |
| Botpress | Free | $495 | Custom |
| Typebot | $39 | $89 | Custom |

### 9.2 Positioning

```
                    HIGH PRICE
                        │
         Voiceflow      │      Botpress
              ●         │         ●
                        │
    ────────────────────┼──────────────────
    LOW COMPLEXITY      │      HIGH COMPLEXITY
                        │
         Typebot  ●  JEESI.AI ●    
         Chatbase ●     │      
              Make ●    │
                        │
                    LOW PRICE
```

**Jeesi.ai positioning:** Mid-price, mid-to-high complexity with unique AI-first approach.

---

## 10. Implementation Roadmap

### Phase 1: Launch (Month 1-2)
- [ ] Implement Free, Starter, Pro tiers
- [ ] Stripe subscription integration ✅ (done)
- [ ] Credit system ✅ (done)
- [ ] Usage tracking

### Phase 2: Optimize (Month 3-4)
- [ ] A/B test pricing pages
- [ ] Implement annual discounts
- [ ] Add credit packs
- [ ] Usage analytics dashboard

### Phase 3: Scale (Month 5-6)
- [ ] Business tier launch
- [ ] Enterprise sales process
- [ ] Reseller program
- [ ] Usage-based add-ons

---

## 11. Pricing Page Copy (Ready to Use)

### Hero Section
```
Build AI Agents in Minutes, Not Months
Start free. Scale as you grow.
```

### Tier Cards

**FREE**
```
Explorer
€0/month
Perfect for trying Jeesi.ai

✓ 2 AI agents
✓ 50 monthly credits
✓ 100 agent conversations
✓ Community support
✓ Jeesi.ai branding

[Start Free]
```

**STARTER** (Most Popular)
```
Builder
€19/month
Billed annually at €190/year

For solo founders and freelancers

✓ 5 AI agents
✓ 200 monthly credits
✓ 1,000 agent conversations
✓ 1 custom domain
✓ Remove branding
✓ Basic API access
✓ Email support

[Get Started]
```

**PRO**
```
Professional
€49/month
Billed annually at €490/year

For growing teams and consultants

Everything in Starter, plus:
✓ 15 AI agents
✓ 500 monthly credits
✓ 5,000 agent conversations
✓ 3 custom domains
✓ Full API access
✓ 3 team members
✓ Advanced analytics
✓ Priority support

[Upgrade to Pro]
```

**BUSINESS**
```
Scale
€149/month
Billed annually at €1,490/year

For agencies and growing companies

Everything in Pro, plus:
✓ 50 AI agents
✓ 2,000 monthly credits
✓ 25,000 agent conversations
✓ 10 custom domains
✓ 10 team members
✓ SSO integration
✓ 99.5% SLA
✓ Dedicated support
✓ White-label option

[Contact Sales]
```

**ENTERPRISE**
```
Custom
Starting at €499/month

For large organizations

Everything in Business, plus:
✓ Unlimited agents
✓ Custom credit allocation
✓ Unlimited conversations
✓ Dedicated infrastructure
✓ Custom integrations
✓ Unlimited team members
✓ 99.9% SLA
✓ Success manager
✓ Data residency options
✓ On-premise available

[Talk to Sales]
```

### FAQ Section

**Q: What is a credit?**
A: Credits are used for AI operations. Creating an agent costs 5 credits, each customer conversation costs 1 credit.

**Q: Can I upgrade or downgrade anytime?**
A: Yes! Upgrade instantly, downgrades take effect at next billing cycle.

**Q: What happens if I run out of credits?**
A: You can purchase additional credit packs or wait for your monthly reset.

**Q: Do unused credits roll over?**
A: Credits roll over for up to 3 months on paid plans.

**Q: Is there a free trial for paid plans?**
A: Yes, all paid plans include a 14-day free trial with full features.

---

## Summary

**Recommended Pricing:**
- Free: €0 (acquisition)
- Starter: €19/month (solo users)
- Pro: €49/month (teams)
- Business: €149/month (agencies)
- Enterprise: €499+/month (custom)

**Expected Metrics:**
- Gross margin: 83-90%
- LTV:CAC target: 4:1 - 6:1
- Payback period: 3-5 months
- Annual churn target: <5%

**Key Success Factors:**
1. Clear value proposition
2. Smooth upgrade path
3. Usage transparency
4. Credit flexibility
5. Enterprise-ready features
