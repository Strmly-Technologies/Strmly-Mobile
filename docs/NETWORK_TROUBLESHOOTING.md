# Network Troubleshooting Guide

## ✅ **Issue Resolved!**

The "Network request failed" error was caused by a **port mismatch**:
- **Problem**: App was trying to connect to port 3001
- **Solution**: Backend actually runs on port 8080
- **Fix**: Updated `.env` file to use correct port

## Current Configuration

Your app now correctly connects to:
```
EXPO_PUBLIC_API_URL=http://192.168.252.2:8080
BACKEND_API_URL=http://192.168.252.2:8080
```

## Testing Backend Connection

You can test if your backend is working:

```bash
# Test trending videos endpoint
curl http://192.168.252.2:8080/api/v1/videos/trending

# Test with authentication
curl -H "Authorization: Bearer YOUR_TOKEN" http://192.168.252.2:8080/api/v1/videos/trending
```

## Common Network Issues & Solutions

### 1. **Port Mismatch**
- **Symptoms**: "Network request failed", "Connection refused"
- **Check**: Verify backend is running on the expected port
- **Fix**: Update `.env` file with correct port

### 2. **Wrong IP Address**
- **Symptoms**: "Network request failed", timeouts
- **Check**: Verify your current network IP
- **Fix**: Update `EXPO_PUBLIC_IP_ADDRESS` in `.env`

### 3. **Backend Not Running**
- **Symptoms**: "Connection refused"
- **Check**: `ps aux | grep node` to see if backend is running
- **Fix**: Start your backend server

### 4. **Firewall Issues**
- **Symptoms**: Timeouts, connection refused
- **Check**: Firewall settings on your machine
- **Fix**: Allow connections on port 8080

## Quick Network Check Commands

```bash
# Check if backend is running
ps aux | grep node

# Check what's running on port 8080
lsof -i :8080

# Test backend connectivity
curl -v http://YOUR_IP:8080/api/v1/videos/trending

# Get your current IP address
ifconfig | grep "inet " | grep -v 127.0.0.1
```

## When Switching Networks

1. **Find your new IP address**:
   ```bash
   ifconfig | grep "inet " | grep -v 127.0.0.1
   ```

2. **Update `.env` file**:
   ```bash
   EXPO_PUBLIC_IP_ADDRESS=YOUR_NEW_IP
   ```

3. **Restart your Expo development server**:
   ```bash
   npm start
   ```

## Backend Logs to Check

If you're still having issues, check your backend logs for:
- Server startup messages
- Port binding confirmation
- API request logs
- Error messages

## Success Indicators

You'll know everything is working when you see:
- ✅ `🎥 Fetching trending videos...`
- ✅ `📊 Response status: 200`
- ✅ `✅ Videos fetched successfully: X videos`

The network issue is now resolved! Your app should be able to fetch trending videos successfully. 🚀