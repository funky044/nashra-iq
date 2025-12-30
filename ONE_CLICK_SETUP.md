# 🚀 NashraIQ One-Click Setup Guide

Get NashraIQ running in **under 5 minutes** with Docker!

## Prerequisites

You only need **one thing** installed:

- **Docker Desktop** (includes Docker Compose)
  - [Download for Windows](https://docs.docker.com/desktop/install/windows-install/)
  - [Download for Mac](https://docs.docker.com/desktop/install/mac-install/)
  - [Download for Linux](https://docs.docker.com/desktop/install/linux-install/)

That's it! No Node.js, PostgreSQL, or Redis needed separately.

---

## 🎯 One-Click Installation

### On Windows:

1. **Download** the NashraIQ folder
2. **Double-click** `install.bat`
3. **Wait** 2-3 minutes
4. **Open** http://localhost:3000

### On Mac/Linux:

1. **Download** the NashraIQ folder
2. **Open Terminal** in the folder
3. **Run:**
   ```bash
   chmod +x install.sh
   ./install.sh
   ```
4. **Open** http://localhost:3000

---

## 🎬 What Happens During Installation

The script automatically:

1. ✅ Checks if Docker is installed
2. ✅ Creates `.env` configuration file
3. ✅ Downloads required Docker images (PostgreSQL, Redis, Node.js)
4. ✅ Builds the NashraIQ application
5. ✅ Creates and configures database
6. ✅ Seeds demo data (8 companies, 30 days of prices)
7. ✅ Starts all services (web app + background worker)

**Total time:** 2-3 minutes (depending on internet speed)

---

## 📋 What You Get

After installation completes:

### ✅ Running Services:
- **Web Application** - http://localhost:3000
- **PostgreSQL Database** - Port 5432
- **Redis Cache** - Port 6379
- **Background Worker** - Processing jobs automatically

### ✅ Pre-Loaded Demo Data:
- 8 Saudi market companies (Aramco, Al Rajhi Bank, SABIC, etc.)
- 30 days of historical price data
- Sample news articles
- Earnings calendar events
- Demo user accounts

### ✅ Demo Accounts:
```
Regular User:
  Email: demo@nashra-iq.com
  Password: demo123

Admin User:
  Email: admin@nashra-iq.com
  Password: admin123
```

---

## 🎮 Using Your Platform

### Access the Platform:
Open your browser and go to: **http://localhost:3000**

### Test Features:
1. **Switch Languages** - Click 🌐 to toggle English/Arabic
2. **View Companies** - Click any ticker (e.g., 2222 for Aramco)
3. **Login** - Use demo credentials above
4. **Admin Panel** - Login as admin, navigate to admin section
5. **Background Jobs** - They're already running automatically!

---

## 🔧 Managing Your Platform

### View Logs (See What's Happening):
```bash
docker-compose logs -f
```

### Stop the Platform:
```bash
docker-compose stop
```

### Start Again:
```bash
docker-compose start
```

### Restart Everything:
```bash
docker-compose restart
```

### Complete Reset (Delete All Data):
```bash
docker-compose down -v
./install.sh  # Run installer again
```

---

## ⚙️ Configuration (Optional)

### Add Your API Keys:

1. **Edit** the `.env` file in the project folder
2. **Add** your licensed API keys:
   ```env
   MARKET_DATA_API_KEY=your-actual-key-here
   NEWS_API_KEY=your-news-api-key
   OPENAI_API_KEY=sk-your-openai-key
   ```
3. **Restart:**
   ```bash
   docker-compose restart
   ```

### Turn Off Demo Mode:

In `.env` file, change:
```env
ENABLE_DEMO_MODE=false
```

Then restart.

---

## 📊 How Automation Works

Once running, the platform automatically:

**Every 5 minutes:**
- Fetches latest market data from APIs
- Updates company prices

**Every 15 minutes:**
- Checks news feeds (RSS + licensed APIs)
- Generates AI summaries
- Auto-publishes high-confidence content

**Every minute:**
- Checks price alerts
- Sends notifications to users

**All happens in the background - no manual work needed!**

---

## 🌐 Accessing From Other Devices

### On Your Local Network:

1. Find your computer's IP address:
   - **Windows:** `ipconfig` (look for IPv4)
   - **Mac/Linux:** `ifconfig` (look for inet)
   
2. On other devices, visit: `http://YOUR-IP:3000`
   Example: `http://192.168.1.100:3000`

### On the Internet:

For production deployment, see [DEPLOYMENT.md](DEPLOYMENT.md) for options like:
- Vercel (easiest)
- AWS
- DigitalOcean
- Your own VPS

---

## 🔍 Troubleshooting

### Port Already in Use:

**Error:** "Port 3000 is already allocated"

**Solution:**
```bash
# Stop other services using port 3000
# Or change port in docker-compose.yml:
ports:
  - "3001:3000"  # Use 3001 instead
```

### Docker Not Running:

**Error:** "Cannot connect to Docker daemon"

**Solution:**
- Open Docker Desktop application
- Wait for it to fully start
- Try installation again

### Database Connection Failed:

**Error:** "Could not connect to database"

**Solution:**
```bash
# Full reset
docker-compose down -v
./install.sh
```

### Out of Disk Space:

**Solution:**
```bash
# Clean up old Docker images
docker system prune -a
```

---

## 📱 What's Running?

Check all services:
```bash
docker-compose ps
```

You should see:
- ✅ `nashra-iq-web` - Web application
- ✅ `nashra-iq-worker` - Background automation
- ✅ `nashra-iq-db` - PostgreSQL database
- ✅ `nashra-iq-redis` - Redis cache

---

## 🎯 Production Checklist

Before going live:

- [ ] Change `JWT_SECRET` in `.env` to random string
- [ ] Change database password in `docker-compose.yml`
- [ ] Add licensed API keys in `.env`
- [ ] Set `ENABLE_DEMO_MODE=false`
- [ ] Set up SSL/HTTPS (use Nginx or Caddy)
- [ ] Configure backups for PostgreSQL
- [ ] Set up monitoring (Sentry, etc.)
- [ ] Configure email SMTP for alerts

---

## ❓ Getting Help

### Check Logs:
```bash
docker-compose logs web     # Web app logs
docker-compose logs worker  # Background job logs
docker-compose logs postgres # Database logs
```

### Verify Services:
```bash
# Check if database is ready
docker-compose exec postgres pg_isready

# Check if Redis is ready
docker-compose exec redis redis-cli ping
```

### Common Issues:

**Platform not loading?**
- Wait 30 seconds after starting
- Check logs: `docker-compose logs web`

**No data showing?**
- Check if seeding completed: `docker-compose logs db-setup`
- Manually seed: `docker-compose run web npm run db:seed`

**Background jobs not running?**
- Check worker logs: `docker-compose logs worker`

---

## 🎉 Success!

If you see the NashraIQ homepage at http://localhost:3000, **you're done!**

You now have a fully functional, bilingual financial intelligence platform running with:
- ✅ Automated data ingestion
- ✅ AI-powered summarization
- ✅ Real-time price tracking
- ✅ News aggregation
- ✅ User management
- ✅ Admin panel

**Enjoy your platform!** 🚀

---

## 📚 Next Steps

1. **Customize branding** - Edit logos and colors
2. **Add API keys** - Connect licensed data sources
3. **Deploy to cloud** - See [DEPLOYMENT.md](DEPLOYMENT.md)
4. **Monitor performance** - Set up Sentry or DataDog
5. **Scale up** - Add more worker instances

For detailed documentation, see:
- [README.md](README.md) - Full documentation
- [API_DOCS.md](API_DOCS.md) - API reference
- [DEPLOYMENT.md](DEPLOYMENT.md) - Production deployment
