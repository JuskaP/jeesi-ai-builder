# Admin Dashboard Setup Guide

## Assigning Admin Role

To access the Admin Dashboard, a user must have the `admin` role assigned in the `user_roles` table.

### Method 1: Direct Database Insert (Recommended for First Admin)

Run this SQL query in your Supabase SQL Editor to make yourself an admin:

```sql
-- Replace 'your-email@example.com' with your actual email
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::public.app_role
FROM public.profiles
WHERE email = 'your-email@example.com'
ON CONFLICT (user_id, role) DO NOTHING;
```

### Method 2: Using the Edge Function

Once you have at least one admin, they can use the `assign-admin-role` function to assign admin privileges to other users:

```javascript
const { data, error } = await supabase.functions.invoke('assign-admin-role', {
  body: { email: 'new-admin@example.com' }
});
```

### Method 3: Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to Table Editor → user_roles
3. Click "Insert row"
4. Fill in:
   - user_id: (copy the UUID from the profiles table for the target user)
   - role: admin
5. Save

## Accessing the Admin Dashboard

Once you have the admin role assigned:

1. Log in to Jeesi.ai with your admin account
2. Look for the "Admin" link in the navigation bar (with shield icon)
3. Click to access the admin dashboard

## Admin Dashboard Features

The admin dashboard provides:

### Key Metrics
- **Total Users**: All registered users
- **Total Agents**: All created agents across the platform
- **Credits Used**: Total and weekly credit consumption
- **Subscribers**: Count of Pro and Expert plan subscribers

### Activity Monitoring
- Agent creation trends (weekly, monthly, all-time)
- Recent user registrations (last 10)
- Recently created agents with creator information

### Security Features
- Server-side role verification using security definer functions
- RLS policies prevent unauthorized access
- No client-side admin checks (secure by design)

## Troubleshooting

### "Access denied. Admin privileges required"
- Verify your user_roles entry exists in the database
- Ensure the role is set to 'admin' (not 'user' or 'moderator')
- Try logging out and back in

### Admin link not showing in navbar
- Clear browser cache and reload
- Check browser console for errors
- Verify user_roles table has correct entry

### Dashboard shows zero for all stats
- Check that the `get_admin_stats()` function exists in your database
- Verify you have actual data in agents, profiles, and credit tables
- Check Supabase logs for function errors

## Security Notes

- The admin role system uses PostgreSQL security definer functions to prevent privilege escalation
- All admin checks are performed server-side
- RLS policies ensure only admins can view/modify role assignments
- Never expose admin status in client-side storage
